import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, ListItem, Screen, Text, TextField } from '@/components';
import { getErrorMessage } from '@/lib/api';
import { digitsOnly } from '@/lib/format';
import type { ScreenProps } from '@/navigation/types';
import { colors, spacing } from '@/theme';

import { RecipientRow } from '../components/RecipientRow';
import { useRecentRecipients, useRecipientLookup } from '../queries';
import { useTransferDraft } from '../store';
import type { Recipient } from '../types';
import { type ContactsStatus, useContacts } from '../useContacts';
import { isValidAccountNumber } from '../validation';

type Row =
  | { type: 'header'; key: string; title: string }
  | { type: 'recipient'; key: string; recipient: Recipient };

const NO_RECIPIENTS: Recipient[] = [];

const keyExtractor = (row: Row) => row.key;
const getItemType = (row: Row) => row.type;

function toSection(title: string, recipients: Recipient[]): Row[] {
  if (recipients.length === 0) return [];
  return [
    { type: 'header', key: title, title },
    ...recipients.map((recipient): Row => ({
      type: 'recipient',
      key: `${title}-${recipient.accountNumber}`,
      recipient,
    })),
  ];
}

function filterRecipients(recipients: Recipient[], search: string) {
  if (!search) return recipients;
  const digits = digitsOnly(search);
  return recipients.filter(
    ({ name, accountNumber }) =>
      name.toLowerCase().includes(search) || (!!digits && accountNumber.includes(digits)),
  );
}

export function RecipientsScreen({ navigation }: ScreenProps<'Recipients'>) {
  const [query, setQuery] = useState('');
  // Filtering a large contact list shouldn't block typing.
  const search = useDeferredValue(query.trim().toLowerCase());
  const typedNumber = /^[\d\s-]+$/.test(search) ? digitsOnly(search) : '';

  const { data: recent = NO_RECIPIENTS } = useRecentRecipients();
  const contacts = useContacts();
  const lookup = useRecipientLookup(typedNumber);
  const setRecipient = useTransferDraft((state) => state.setRecipient);
  const { bottom } = useSafeAreaInsets();

  const select = useCallback(
    (recipient: Recipient) => {
      setRecipient(recipient);
      navigation.goBack();
    },
    [navigation, setRecipient],
  );

  const rows = useMemo(
    () => [
      ...toSection('Recent', filterRecipients(recent, search)),
      ...toSection(
        'Contacts',
        filterRecipients(contacts.data?.recipients ?? NO_RECIPIENTS, search),
      ),
    ],
    [search, recent, contacts.data],
  );

  const stickyHeaderIndices = useMemo(
    () => rows.flatMap((row, index) => (row.type === 'header' ? [index] : [])),
    [rows],
  );

  const renderItem = useCallback<ListRenderItem<Row>>(
    ({ item }) =>
      item.type === 'header' ? (
        <SectionHeader title={item.title} />
      ) : (
        <RecipientRow recipient={item.recipient} onPress={select} />
      ),
    [select],
  );

  const numberHint =
    typedNumber && !isValidAccountNumber(typedNumber)
      ? 'Account and mobile numbers have 10 to 16 digits'
      : undefined;

  return (
    <Screen scrollable={false}>
      <TextField
        icon="search"
        placeholder="Name, account or mobile number"
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        accessibilityLabel="Search recipients"
        hint={numberHint}
        error={lookup.isError ? getErrorMessage(lookup.error) : undefined}
      />

      <FlashList
        data={rows}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        stickyHeaderIndices={stickyHeaderIndices}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: bottom }}
        ListHeaderComponent={
          <LookupResult loading={lookup.isLoading} recipient={lookup.data} onSelect={select} />
        }
        ListEmptyComponent={
          search && !typedNumber ? (
            <Text color="textMuted" align="center" style={styles.empty}>
              No one matches “{query.trim()}”
            </Text>
          ) : null
        }
        ListFooterComponent={<ContactsNotice status={contacts.data?.status} />}
      />
    </Screen>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text variant="label" color="textMuted" style={styles.sectionHeader}>
      {title}
    </Text>
  );
}

interface LookupResultProps {
  loading: boolean;
  recipient?: Recipient;
  onSelect: (recipient: Recipient) => void;
}

/** The registered name behind a typed account number, shown before it can be selected. */
function LookupResult({ loading, recipient, onSelect }: LookupResultProps) {
  if (loading) return <ListItem title="Checking account…" leading={<ActivityIndicator />} />;
  if (!recipient) return null;

  return (
    <>
      <SectionHeader title="Account holder" />
      <RecipientRow recipient={recipient} onPress={onSelect} />
    </>
  );
}

function ContactsNotice({ status }: { status?: ContactsStatus }) {
  if (status === 'granted') return null;
  if (!status) return <ActivityIndicator style={styles.notice} />;

  return (
    <View style={styles.notice}>
      <Text color="textMuted" align="center">
        {status === 'denied'
          ? 'Allow access to your contacts to pay people straight from your phone book.'
          : "Contacts aren't available on this device. Search by account or mobile number instead."}
      </Text>
      {status === 'denied' && (
        <Button title="Open Settings" variant="secondary" onPress={() => Linking.openSettings()} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    backgroundColor: colors.background,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  empty: { paddingVertical: spacing.xl },
  notice: { gap: spacing.md, paddingVertical: spacing.xl },
});
