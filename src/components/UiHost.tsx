"use client";

import { useEffect, useRef } from "react";
import { useUi } from "@/store/ui";
import { SHORTCUTS } from "@/lib/hotkeys";

export function UiHost() {
  const dialog = useUi((s) => s.dialog);
  const toasts = useUi((s) => s.toasts);
  const shortcuts = useUi((s) => s.shortcuts);
  const input = useRef<HTMLInputElement>(null);

  const close = (value: string | boolean | null) => {
    dialog?.resolve(value);
    useUi.setState({ dialog: null });
  };

  useEffect(() => {
    if (dialog?.kind === "prompt") input.current?.select();
  }, [dialog]);

  return (
    <>
      {dialog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4"
          onClick={() => close(dialog.kind === "confirm" ? false : null)}
        >
          <form
            role="dialog"
            aria-label={dialog.title}
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              close(dialog.kind === "confirm" ? true : input.current?.value ?? "");
            }}
            onKeyDown={(e) => e.key === "Escape" && close(dialog.kind === "confirm" ? false : null)}
            className="flex w-full max-w-sm flex-col gap-3 rounded-xl border border-[#e4e4e7] bg-white p-5 text-[#1a1a1a] shadow-xl"
          >
            <h2 className="text-base font-medium">{dialog.title}</h2>
            {dialog.message && <p className="text-sm text-[#71717a]">{dialog.message}</p>}
            {dialog.kind === "prompt" && (
              <input
                ref={input}
                autoFocus
                defaultValue={dialog.defaultValue}
                placeholder={dialog.placeholder}
                className="h-9 rounded-md border border-[#d4d4d8] px-3 text-sm outline-none focus:border-[#3b82f6]"
              />
            )}
            <div className="mt-1 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => close(dialog.kind === "confirm" ? false : null)}
                className="rounded-full px-4 py-1.5 text-sm text-[#52525b] hover:bg-[#f4f4f5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                autoFocus={dialog.kind === "confirm"}
                className={`rounded-full px-4 py-1.5 text-sm font-medium text-white ${
                  dialog.danger ? "bg-[#dc2626] hover:bg-[#b91c1c]" : "bg-[#1a1a1a] hover:bg-black"
                }`}
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </form>
        </div>
      )}

      {shortcuts && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4" onClick={() => useUi.setState({ shortcuts: false })}>
          <div
            role="dialog"
            aria-label="Keyboard shortcuts"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[#e4e4e7] bg-white p-6 text-[#1a1a1a] shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-medium">Keyboard shortcuts</h2>
              <button onClick={() => useUi.setState({ shortcuts: false })} className="rounded-full px-3 py-1 text-sm text-[#52525b] hover:bg-[#f4f4f5]">
                Close
              </button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {SHORTCUTS.map((g) => (
                <section key={g.group}>
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-[#71717a]">{g.group}</h3>
                  <dl className="flex flex-col gap-1.5 text-sm">
                    {g.items.map(([keys, what]) => (
                      <div key={keys} className="flex items-baseline justify-between gap-3">
                        <dt className="text-[#52525b]">{what}</dt>
                        <dd className="shrink-0 rounded bg-[#f4f4f5] px-1.5 py-0.5 font-mono text-xs">{keys}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[110] flex -translate-x-1/2 flex-col items-center gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-full px-4 py-2 text-sm shadow-lg ${t.tone === "error" ? "bg-[#dc2626] text-white" : "bg-[#1a1a1a] text-white"}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </>
  );
}
