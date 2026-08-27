import { verificationLabels, type Verification } from '../lib/wiki-data';

export function VerificationBadge({ verification, compact = false }: { verification: Verification; compact?: boolean }) {
  const item = verificationLabels[verification];
  return (
    <span className={`verification-badge verification-${verification}${compact ? ' compact' : ''}`} title={item.description}>
      <i aria-hidden="true" />
      {item.label}
    </span>
  );
}
