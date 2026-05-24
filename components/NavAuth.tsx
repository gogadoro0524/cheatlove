'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginModal } from './LoginModal';
import { signOutAction } from '@/lib/auth-actions';

// Nav auth control: opens the login modal when logged out, or shows the
// account + a log-out action when logged in. Receives the current email from
// the server-rendered Nav so it reflects the session immediately.
export function NavAuth({ email }: { email?: string | null }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (email) {
    return (
      <form action={signOutAction} className="nav-auth">
        <span className="nav-user" title={email}>{email}</span>
        <button type="submit" className="nav-logout">Log out</button>
      </form>
    );
  }

  return (
    <>
      <a
        href="#login"
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
      >
        Login
      </a>
      <LoginModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => {
          setOpen(false);
          // Re-render server components (Nav) so admin links + logout appear.
          router.refresh();
        }}
      />
    </>
  );
}
