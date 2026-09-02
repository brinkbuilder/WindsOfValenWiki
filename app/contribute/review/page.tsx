import type { Metadata } from 'next';
import { ContributionReviewClient } from '../../components/ContributionReviewClient';

export const metadata: Metadata = {
  title: 'Review contributions',
  description: 'Moderator queue for reviewing community wiki contributions.',
};

export default function ContributionReviewPage() {
  return (
    <main className="inner-page contribution-page contribution-review-page">
      <header className="simple-page-heading">
        <p className="eyebrow">Editor workspace</p>
        <h1>Review contributions</h1>
        <p>Verify community submissions before they are counted on the contributor board. Only moderators can approve or reject entries.</p>
      </header>
      <ContributionReviewClient />
    </main>
  );
}
