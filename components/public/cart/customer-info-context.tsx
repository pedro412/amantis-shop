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
  setName: (name: string) => void;
  setZone: (zone: string) => void;
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

  const setName = useCallback((name: string) => {
    setInfo((prev) => ({ ...prev, name }));
  }, []);

  const setZone = useCallback((zone: string) => {
    setInfo((prev) => ({ ...prev, zone }));
  }, []);

  const value = useMemo<CustomerInfoContextValue>(
    () => ({ info, hydrated, setName, setZone }),
    [info, hydrated, setName, setZone],
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
