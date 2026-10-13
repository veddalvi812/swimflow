"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { displayName } from "@/hooks/use-auth";
import { deleteMyAccount, exportAllBoards } from "@/lib/cloud";
import { downloadText } from "@/lib/board-json";
import { confirmDialog, toast } from "@/store/ui";

export default function SettingsPage() {
  const { user, loading, signOut } = useRequireAuth();
  const router = useRouter();

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center text-sm text-[#71717a]">Loading...</div>;
  }

  const download = async () => {
    const boards = await exportAllBoards();
    downloadText(JSON.stringify({ exportedAt: new Date().toISOString(), boards }, null, 2), "swimflow-my-boards.json");
    toast(`Downloaded ${boards.length} board${boards.length === 1 ? "" : "s"}`);
  };

  const remove = async () => {
    const ok = await confirmDialog({
      title: "Delete your account?",
      message: "This permanently deletes your account and every board you own. Download your boards first if you want a copy.",
      confirmLabel: "Delete my account",
      danger: true,
    });
    if (!ok) return;
    if (await deleteMyAccount()) {
      await signOut();
      router.push("/");
    } else {
      toast("Couldn't delete your account. Try again, or contact support.", "error");
    }
  };

  const section = "rounded-xl border border-[#e4e4e7] bg-white p-5";

  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-10 text-[#1a1a1a]">
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <Link href="/dashboard" className="text-sm text-[#71717a] hover:text-[#1a1a1a]">
          ← My boards
        </Link>
        <h1 className="text-2xl font-medium tracking-tight">Settings</h1>

        <section className={section}>
          <h2 className="text-sm font-medium">Profile</h2>
          <p className="mt-2 text-sm">{displayName(user)}</p>
          <p className="text-sm text-[#71717a]">{user.email}</p>
          <p className="mt-2 text-xs text-[#a1a1aa]">Your name comes from your Google or GitHub account. It shows on the sticky notes you add.</p>
        </section>

        <section className={section}>
          <h2 className="text-sm font-medium">Your data</h2>
          <p className="mt-1 text-sm text-[#71717a]">Download every board you own as one JSON file.</p>
          <button onClick={download} className="mt-3 rounded-full bg-[#1a1a1a] px-4 py-1.5 text-sm font-medium text-white hover:bg-black">
            Download all my boards
          </button>
        </section>

        <section className={`${section} border-[#fecaca]`}>
          <h2 className="text-sm font-medium text-[#b91c1c]">Delete account</h2>
          <p className="mt-1 text-sm text-[#71717a]">Removes your account and all your boards for good.</p>
          <button onClick={remove} className="mt-3 rounded-full border border-[#fecaca] px-4 py-1.5 text-sm font-medium text-[#b91c1c] hover:bg-[#fef2f2]">
            Delete my account
          </button>
        </section>
      </div>
    </div>
  );
}
