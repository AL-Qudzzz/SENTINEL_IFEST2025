// This file is now primarily a Server Component wrapper.
// The main UI and logic are in ChangelogClientPage below.

import ChangelogClientPage from './client-page';

export default async function ChangelogPage() {
  // This is a Server Component. It can be async.
  // It then renders the Client Component.
  return <ChangelogClientPage />;
}
