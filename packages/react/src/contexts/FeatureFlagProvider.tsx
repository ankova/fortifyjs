import { createContext, useContext, type ReactNode } from 'react';
import { FeatureFlags } from '@fortifyjs/core';
import type { FlagMap } from '@fortifyjs/core';

type FeatureFlagContextValue = {
  flags: FeatureFlags;
};

const FeatureFlagContext = createContext<FeatureFlagContextValue | undefined>(undefined);

type FeatureFlagProviderProps = {
  flags: FeatureFlags | FlagMap;
  children: ReactNode;
};

export const FeatureFlagProvider = ({ flags, children }: FeatureFlagProviderProps) => {
  const instance = flags instanceof FeatureFlags ? flags : new FeatureFlags(flags);

  return (
    <FeatureFlagContext.Provider value={{ flags: instance }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlag = (name: string): boolean => {
  const ctx = useContext(FeatureFlagContext);
  if (!ctx) return false;
  return ctx.flags.isOn(name);
};
