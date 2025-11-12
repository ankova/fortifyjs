import { useFeatureFlags } from '../contexts/FeatureFlagProvider';
export const useFeatureFlag = (name: string) => useFeatureFlags().isOn(name);
