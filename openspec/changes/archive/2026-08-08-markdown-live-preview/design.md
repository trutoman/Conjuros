## Context

See proposal.md - Why.

Current state that shapes this design:

- `ItemForm.tsx` renders the markdown Content field as two `.content-pane` textareas (Content - Edit and Content - View), both bound to the same `content` state; a `useLayoutEffect` auto-resizes both to their `scrollHeight` on mount and on input, and `.content-pane textarea` has `min-height: 8rem`.
- `marked` and `dompurify` are not yet dependencies (`package.json` has no Markdown/HTML sanitization libraries).
- The existing markdown card (`ItemCard.tsx`) shows `content` as plain text in a `<code>` block; no component renders Markdown today, so the form preview is the first rendered Markdown surface.
- Vitest runs jsdom, where `Element.prototype.scrollHeight` is a configurable getter returning `0` by default (the existing ItemForm tests already define it per-instance).

## Goals / Non-Goals

**Goals:**
- Replace the "Content - View" textarea with a live Markdown preview that renders sanitized HTML as the user types in "Content - Edit".
- Keep the preview inert: never execute scripts or active content embedded in the Markdown.
- Preserve the 50/50 split, the doubled initial height, the pane labels, and the shared growth behavior between panes.

**Non-Goals:**
- No server-side rendering of Markdown; the preview is display-only on the client.
- No change to how saved markdown items are displayed in the collection (`ItemCard` stays plain text).
- No uploads, external images, or link-target customization.

## Decisions

### D1: Render with `marked` and sanitize with `dompurify`

Use `marked` to parse the content into HTML and `DOMPurify.sanitize` on the result before inserting it into the DOM via `dangerouslySetInnerHTML`.

Alternatives considered:
- Custom mini-renderer (headings/bold/links only) — rejected: reimplements Markdown poorly and drifts from the saved source.
- `dangerouslySetInnerHTML` with `marked` only — rejected: would execute raw HTML/scripts from the content.

`marked` is chosen as the parser and `dompurify` as the sanitizer because they are the standard, purpose-built pair for this task and keep the rendered output faithful to the stored source while guaranteeing inert HTML.

### D2: Preview pane is a `div`, not a textarea

The "Content - View" pane becomes a read-only `<div className="content-pane-preview" aria-label="Content - View">` styled with the same `min-height: 8rem`. It is no longer editable, so only "Content - Edit" writes to `content`.

Rationale: an editable textarea cannot show formatted HTML; the preview must be an HTML container. Keeping the `aria-label` preserves the accessible label used by tests and screen readers.

### D3: Height sync copies the edit textarea's computed height to the preview

Keep the existing `useLayoutEffect` (deps `[kind, content]`): compute the edit textarea's target height from its `scrollHeight` and assign that height to both the edit textarea and the preview `div`, so both panes start at `min-height: 8rem` and grow together as lines are added.

Rationale: reuses the proven auto-resize mechanism; the preview mirrors the edit pane exactly instead of independently measuring the rendered content (which would diverge from the typed lines).

### D4: Render inside the existing `useLayoutEffect`/render cycle

Compute `const previewHtml = useMemo(() => DOMPurify.sanitize(marked.parse(content) as string), [content])` and inject it with `dangerouslySetInnerHTML={{ __html: previewHtml }}`. Sanitization runs on every content change, so the preview always reflects the current edit-pane value and stays safe.

Alternative considered: rendering only on blur/debounce — rejected, the spec requires live updates while typing.

## Risks / Trade-offs

- [`dangerouslySetInnerHTML` reintroduces XSS if sanitization is bypassed] → Mitigation: every render path goes through `DOMPurify.sanitize`; content never reaches the DOM raw. A test asserts embedded `<script>` does not execute.
- [Sanitization cost on each keystroke] → Acceptable: content sizes in this app are small; `marked` + DOMPurify run in microseconds for typical note length.
- [Preview may render elements with default browser styles] → Mitigation: add `.content-pane-preview` typography CSS (headings, code, links) scoped to the preview pane, matching the app's visual language.
