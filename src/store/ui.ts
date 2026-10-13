"use client";

import { create } from "zustand";

// Small in-app replacements for alert, confirm, and prompt, plus toasts. Rendered by <UiHost />.

export interface DialogState {
  kind: "confirm" | "prompt" | "choose";
  options?: { value: string; label: string }[];
  title: string;
  message?: string;
  defaultValue?: string;
  placeholder?: string;
  confirmLabel: string;
  danger?: boolean;
  resolve: (value: string | boolean | null) => void;
}

export interface Toast {
  id: number;
  message: string;
  tone: "info" | "error";
}

interface UiStore {
  dialog: DialogState | null;
  toasts: Toast[];
  shortcuts: boolean;
  searching: boolean;
  requestTab: string | null;
}

export const useUi = create<UiStore>(() => ({ dialog: null, toasts: [], shortcuts: false, searching: false, requestTab: null }));

type Common = { title: string; message?: string; confirmLabel?: string };

export function confirmDialog(o: Common & { danger?: boolean }): Promise<boolean> {
  return new Promise((resolve) =>
    useUi.setState({
      dialog: {
        kind: "confirm",
        title: o.title,
        message: o.message,
        confirmLabel: o.confirmLabel ?? "Confirm",
        danger: o.danger,
        resolve: (v) => resolve(v === true),
      },
    })
  );
}

export function promptDialog(o: Common & { defaultValue?: string; placeholder?: string }): Promise<string | null> {
  return new Promise((resolve) =>
    useUi.setState({
      dialog: {
        kind: "prompt",
        title: o.title,
        message: o.message,
        defaultValue: o.defaultValue,
        placeholder: o.placeholder,
        confirmLabel: o.confirmLabel ?? "Save",
        resolve: (v) => resolve(typeof v === "string" ? v : null),
      },
    })
  );
}

let toastId = 0;
export function toast(message: string, tone: Toast["tone"] = "info") {
  const id = ++toastId;
  useUi.setState((s) => ({ toasts: [...s.toasts, { id, message, tone }] }));
  setTimeout(() => useUi.setState((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500);
}

export function chooseDialog(o: Common & { options: { value: string; label: string }[]; defaultValue?: string }): Promise<string | null> {
  return new Promise((resolve) =>
    useUi.setState({
      dialog: {
        kind: "choose",
        title: o.title,
        message: o.message,
        options: o.options,
        defaultValue: o.defaultValue,
        confirmLabel: o.confirmLabel ?? "Choose",
        resolve: (v) => resolve(typeof v === "string" ? v : null),
      },
    })
  );
}
