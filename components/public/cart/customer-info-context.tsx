'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  EMPTY_CUSTOMER,
  getCustomerInfo,
  setCustomerInfo,
  type CustomerInfo,
} from '@/lib/customer-info';

type CustomerInfoContextValue = {
  info: CustomerInfo;
  hydrated: boolean;
  /** Update one field at a time — keeps callers terse. */
  setField: <K extends keyof CustomerInfo>(key: K, value: CustomerInfo[K]) => void;
  /** Replace the whole record at once. Used when hydrating from a shared
   *  cart link or any other "import full state" flow. Unknown / missing
   *  fields fall back to the empty defaults so partial payloads are safe. */
  replaceAll: (next: Partial<CustomerInfo>) => void;
};

const CustomerInfoContext = createContext<CustomerInfoContextValue | null>(null);

export function CustomerInfoProvider({ children }: { children: React.ReactNode }) {
  const [info, setInfo] = useState<CustomerInfo>(EMPTY_CUSTOMER);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setInfo(getCustomerInfo());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setCustomerInfo(info);
  }, [info, hydrated]);

  const setField = useCallback<CustomerInfoContextValue['setField']>(
    (key, value) => {
      setInfo((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const replaceAll = useCallback<CustomerInfoContextValue['replaceAll']>(
    (next) => {
      setInfo({ ...EMPTY_CUSTOMER, ...next });
    },
    [],
  );

  const value = useMemo<CustomerInfoContextValue>(
    () => ({ info, hydrated, setField, replaceAll }),
    [info, hydrated, setField, replaceAll],
  );

  return (
    <CustomerInfoContext.Provider value={value}>
      {children}
    </CustomerInfoContext.Provider>
  );
}

export function useCustomerInfo(): CustomerInfoContextValue {
  const ctx = useContext(CustomerInfoContext);
  if (!ctx) {
    throw new Error('useCustomerInfo must be used within a CustomerInfoProvider');
  }
  return ctx;
}
