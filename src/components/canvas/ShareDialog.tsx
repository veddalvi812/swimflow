"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, Share2, Trash2, X } from "lucide-react";
import { addMember, listMembers, removeMember, updateBoard, type Member } from "@/lib/cloud";
import { Button } from "@/components/ui/button";

const field =
  "h-8 rounded-md border border-[#d4d4d8] bg-white px-2.5 text-sm outline-none focus:border-[#3b82f6]";

export function ShareDialog({ boardId, isPublic }: { boardId: string; isPublic: boolean }) {
  const [open, setOpen] = useState(false);
  const [pub, setPub] = useState(isPublic);
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Member["role"]>("viewer");
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

  const refresh = useCallback(async () => setMembers(await listMembers(boardId)), [boardId]);
  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const togglePublic = async () => {
    const next = !pub;
    if (await updateBoard(boardId, { is_public: next })) setPub(next);
    else setMsg("Couldn't update the link setting");
  };

  const copy = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/view/${boardId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const copyEmbed = async () => {
    const src = `${window.location.origin}/view/${boardId}`;
    await navigator.clipboard.writeText(`<iframe src="${src}" width="100%" height="520" style="border:0" title="SwimFlow board" loading="lazy"></iframe>`);
    setEmbedCopied(true);
    setTimeout(() => setEmbedCopied(false), 1500);
  };

  const invite = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setMsg("Enter a valid email address");
    setMsg("");
    if (await addMember(boardId, email, role)) {
      setEmail("");
      refresh();
    } else setMsg("Couldn't send the invite");
  };

  return (
    <>
      <Button variant="ghost" size="icon" title="Share" aria-label="Share board" onClick={() => setOpen(true)}>
        <Share2 className="size-4" />
      </Button>

      {open &&
        createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-label="Share board"
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-[#e4e4e7] bg-white p-5 text-[#1a1a1a] shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium">Share board</h2>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-[#71717a] hover:text-[#1a1a1a]">
                <X className="size-4" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg bg-[#f4f4f5] p-3">
              <div>
                <p className="text-sm font-medium">Anyone with the link can view</p>
                <p className="text-xs text-[#71717a]">{pub ? "Link is on" : "Link is off"}</p>
              </div>
              <div className="flex items-center gap-2">
                {pub && (
                  <Button size="sm" variant="secondary" onClick={copy} className="gap-1.5">
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copied ? "Copied" : "Copy link"}
                  </Button>
                )}
                <Button size="sm" variant={pub ? "secondary" : "default"} onClick={togglePublic}>
                  {pub ? "Turn off" : "Turn on"}
                </Button>
              </div>
            </div>

            {pub && (
              <button onClick={copyEmbed} className="self-start text-xs text-[#3b82f6] hover:underline">
                {embedCopied ? "Embed code copied" : "Copy embed code for a website"}
              </button>
            )}

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Invite people</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && invite()}
                  placeholder="name@company.com"
                  className={`${field} flex-1`}
                />
                <select value={role} onChange={(e) => setRole(e.target.value as Member["role"])} className={field}>
                  <option value="viewer">Can view</option>
                  <option value="editor">Can edit</option>
                </select>
                <Button size="sm" onClick={invite}>Invite</Button>
              </div>
              {msg && <p className="text-xs text-[#dc2626]">{msg}</p>}
              <p className="text-xs text-[#71717a]">They see the board under “Shared with me” when they sign in with this email.</p>
            </div>

            {members.length > 0 && (
              <ul className="flex flex-col divide-y divide-[#e4e4e7] rounded-lg border border-[#e4e4e7]">
                {members.map((m) => (
                  <li key={m.email} className="flex items-center gap-2 px-3 py-2 text-sm">
                    <span className="flex-1 truncate">{m.email}</span>
                    <select
                      value={m.role}
                      onChange={async (e) => {
                        await addMember(boardId, m.email, e.target.value as Member["role"]);
                        refresh();
                      }}
                      className="h-7 rounded border border-[#d4d4d8] bg-white px-1.5 text-xs"
                    >
                      <option value="viewer">Can view</option>
                      <option value="editor">Can edit</option>
                    </select>
                    <button
                      aria-label={`Remove ${m.email}`}
                      onClick={async () => {
                        await removeMember(boardId, m.email);
                        refresh();
                      }}
                      className="text-[#a1a1aa] hover:text-[#dc2626]"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
