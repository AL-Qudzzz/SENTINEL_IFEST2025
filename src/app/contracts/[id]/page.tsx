// This file is now primarily a Server Component wrapper.
// The main UI and logic are in ContractDetailClientPage below.

import ContractDetailClientPage from './client-page';

export default async function ContractDetailPage({ params }: { params: { id: string } }) {
  // This is a Server Component. It can be async.
  // It receives params from the URL.
  // It then passes the id to the Client Component.
  // This structure resolves the "param property was accessed directly" warning.
  return <ContractDetailClientPage id={params.id} />;
}
