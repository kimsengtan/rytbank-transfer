import { useQuery } from '@tanstack/react-query';
import { Contact, ContactField, ContactsSortOrder, requestPermissionsAsync } from 'expo-contacts';
import { Platform } from 'react-native';

import { toLocalNumber } from '@/lib/format';

import { uniqueRecipients } from './queries';
import type { Recipient } from './types';

export type ContactsStatus = 'granted' | 'denied' | 'unavailable';

interface ContactsResult {
  status: ContactsStatus;
  recipients: Recipient[];
}

async function loadContacts(): Promise<ContactsResult> {
  if (Platform.OS === 'web') return { status: 'unavailable', recipients: [] };

  const { granted } = await requestPermissionsAsync();
  if (!granted) return { status: 'denied', recipients: [] };

  const contacts = await Contact.getAllDetails([ContactField.FULL_NAME, ContactField.PHONES], {
    sortOrder: ContactsSortOrder.GivenName,
  });

  const recipients = contacts.flatMap(({ fullName, phones }) => {
    const accountNumber = toLocalNumber(phones[0]?.number ?? '');
    return fullName && accountNumber ? [{ name: fullName, accountNumber }] : [];
  });

  return { status: 'granted', recipients: uniqueRecipients(recipients) };
}

/**
 * Device contacts with a phone number, mapped to recipients. Asks for permission on first
 * use, and checks again on focus while denied so returning from Settings picks up the change.
 */
export const useContacts = () =>
  useQuery({
    queryKey: ['contacts'],
    queryFn: loadContacts,
    staleTime: ({ state }) => (state.data?.status === 'granted' ? 5 * 60_000 : 0),
  });
