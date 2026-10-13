"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, displayName } from "@/hooks/use-auth";

export function AccountMenu() {
  const { user, enabled, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (!enabled) return null;
  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-1.5 text-sm text-[var(--foreground)] shadow-sm hover:bg-[var(--surface)]"
      >
        Log in
      </Link>
    );
  }

  const name = displayName(user) || "Account";
  const item = "block w-full rounded-md px-3 py-1.5 text-left text-sm hover:bg-[var(--surface)]";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex size-8 items-center justify-center rounded-full bg-[#1a1a1a] text-sm font-medium uppercase text-white shadow-sm"
      >
        {name[0]}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-1.5 shadow-lg">
            <div className="px-3 py-2">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="truncate text-xs text-[var(--muted-foreground)]">{user.email}</p>
            </div>
            <Link href="/dashboard" className={item}>My boards</Link>
            <Link href="/settings" className={item}>Settings</Link>
            <button
              className={item}
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
