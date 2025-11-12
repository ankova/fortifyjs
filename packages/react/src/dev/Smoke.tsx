import { useEffect } from 'react';

import { useSafeAsync } from '../hooks/useSafeAsync';
import { FeatureFlagProvider, useFeatureFlag } from '../contexts/FeatureFlagProvider';

function Demo() {
  const isExp = useFeatureFlag('experimentalUI');
  const { data, loading } = useSafeAsync(async () => {
    return 'hello';
  }, []);
  useEffect(() => {
    console.log({ isExp, data, loading });
  }, [isExp, data, loading]);
  return null;
}

export default function Smoke() {
  return (
    <FeatureFlagProvider flags={{ experimentalUI: true }}>
      <Demo />
    </FeatureFlagProvider>
  );
}
