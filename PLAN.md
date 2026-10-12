# SwimFlow: board workspace implementation plan

Goal: a free whiteboard (FigJam-style) where any LLM can draw your process. Shell = login + projects + boards. Board = one infinite canvas with basic objects and smart blocks (swimlane, kanban, timeline, table).

Principles: reuse ReactFlow, the Zustand store, and the Supabase code. Guest mode stays (`/editor` works without login, saves to the browser). Each phase ships on its own.

## Data model (Supabase)

```sql
projects(id uuid pk, user_id uuid, name text, created_at, updated_at)
boards(id uuid pk, project_id uuid fk, user_id uuid, title text,
       content jsonb,      -- { nodes, edges, viewport }
       starred bool, is_public bool, created_at, updated_at)
```
RLS: owner CRUD; public read when `is_public`. The existing `diagrams` table is migrated to `boards` (swimlane becomes one block in `content`) or dropped, since nothing is live yet.

## Phase 1: Shell and auth (ships first)

| Step | Work | Files |
|---|---|---|
| 1.1 | Supabase project, Google + GitHub providers, env vars local and Vercel (user task) | `.env.local`, Vercel |
| 1.2 | New schema SQL | `supabase/schema.sql` |
| 1.3 | `/login` page; OAuth redirect to `/dashboard` | `src/app/login/page.tsx`, `use-auth.ts` |
| 1.4 | Data layer: projects and boards CRUD, star, rename, delete | `src/lib/cloud.ts` |
| 1.5 | `/dashboard`: sidebar (Home, Recent, Starred, Projects), board grid, "New board" with template picker | `src/app/dashboard/page.tsx`, `src/components/dashboard/*` |
| 1.6 | Auth guard: redirect to `/login` if signed out | `src/hooks/use-require-auth.ts` |
| 1.7 | Landing CTAs: Log in / Get started | `src/app/page.tsx` |
| 1.8 | Route `/board/[id]` loads a board, debounced autosave, "Saved" indicator | `src/app/board/[id]/page.tsx`, `Editor.tsx` |

Done when: sign in with Google, create a project and board, edit, reload, and the work is still there.

## Phase 2: Freeform canvas

| Step | Work |
|---|---|
| 2.1 | Generalize the store: `diagram` becomes `board { nodes, edges }`; swimlane data moves into a `swimlane` block node. Keep undo/redo. |
| 2.2 | Left tool rail: select, sticky, text, shape (rect/ellipse/diamond), arrow, frame. Click-to-place first, drag later. |
| 2.3 | Polka-dot background (ReactFlow `Background variant="dots"`), light theme. |
| 2.4 | Right panel tabs: Properties and JSON (live, editable, with Apply). |
| 2.5 | Copy/paste, duplicate, multi-select delete, z-order. |
| 2.6 | Move the clipboard prompt and paste flow to a per-block "Generate" action. |

Done when: stickies, shapes, and arrows can be mixed with the existing swimlane on one canvas and survive reload.

## Phase 3: Smart blocks

Each block is a ReactFlow custom node with `{ type, data, schema, prompt }`, registered in one `blocks.ts` map. Adding a block = one component + one registry entry.

1. **Kanban:** columns, draggable cards (dnd-kit or native drag), JSON in/out.
2. **Timeline:** dated rows or milestones, horizontal axis.
3. **Table:** simple grid, editable cells.
4. **Flowchart:** decision diamonds and Dagre auto-layout (reuse `layout.ts`).

Done when: each block can be added from the rail, edited, generated from pasted JSON, and saved.

## Phase 4: Sharing

1. Read-only public link `/view/[id]` (real read-only: `nodesDraggable={false}`, no panels).
2. Invite by email with viewer/editor roles (`board_members` table).
3. Comments (later).

## Not in scope (cut for now)

Pen drawing, image upload, real-time cursors and presence, mobile editing, billing. Revisit after Phase 3.

## Risks

- Containment (cards inside swimlane lanes) is hard. Phase 3 ships blocks as self-contained; lane containment comes later if wanted.
- ReactFlow performance with several hundred nodes. Measure at Phase 2.
- Autosave conflicts if one board opens in two tabs. Last-write-wins for now; add `updated_at` checking later.

## Order of work

1.1 to 1.8, then verify, commit, deploy. Then Phase 2, and so on. Typecheck with `node node_modules/typescript/bin/tsc --noEmit`.
