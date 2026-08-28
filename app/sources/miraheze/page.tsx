import { redirect } from 'next/navigation';

export default function LegacyDirectoryRedirect() {
  redirect('/wiki');
}
