"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const { user, loading, enabled, signInWithGoogle, signInWithGithub } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 text-[#1a1a1a]">
      <div className="w-full max-w-sm rounded-xl border border-[#e4e4e7] bg-[#f4f4f5] p-8 text-center">
        <Link href="/" className="text-[15px] font-medium">SwimFlow</Link>
        <h1 className="mt-6 text-xl font-medium">Welcome back</h1>
        <p className="mt-2 text-sm text-[#71717a]">Sign in to see your boards</p>

        {!enabled && !loading ? (
          <p className="mt-6 text-sm text-[#71717a]">
            Sign-in isn&apos;t configured. Set the Supabase env vars to enable it.
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="rounded-full bg-[#1a1a1a] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black disabled:opacity-50"
            >
              Continue with Google
            </button>
            <button
              onClick={signInWithGithub}
              disabled={loading}
              className="rounded-full border border-[#d4d4d8] bg-white px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[#fafafa] disabled:opacity-50"
            >
              Continue with GitHub
            </button>
          </div>
        )}

        <Link href="/editor" className="mt-6 inline-block text-sm text-[#71717a] hover:text-[#1a1a1a]">
          Or keep working without an account
        </Link>
      </div>
    </div>
  );
}
