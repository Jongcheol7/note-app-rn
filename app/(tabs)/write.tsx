import { Redirect } from 'expo-router';

export default function WriteTab() {
  // Write tab redirects to the note write screen
  return <Redirect href="/notes/write" />;
}
