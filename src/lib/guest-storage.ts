import { useDiagramStore } from "@/store/diagram-store";
import { useFreeStore } from "@/store/free-store";
import { clearHistory } from "@/store/history";
import { applyBoardJSON, boardJSON } from "./board-json";

// Guests have no account, so their board lives in this browser only.
const KEY = "swimflow-guest-board";

export function restoreGuest(): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    applyBoardJSON(raw);
    clearHistory();
    return true;
  } catch {
    return false;
  }
}

// Saves shortly after each change. Returns a function that stops saving.
export function startGuestAutosave() {
  let timer: ReturnType<typeof setTimeout>;
  const queue = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        localStorage.setItem(KEY, boardJSON());
      } catch {
        // storage full or blocked: skip this save
      }
    }, 600);
  };
  const stops = [useDiagramStore.subscribe(queue), useFreeStore.subscribe(queue)];
  return () => {
    clearTimeout(timer);
    stops.forEach((stop) => stop());
  };
}
