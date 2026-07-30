# Research: Redesigned Item Card Layout

## Decisions

- Use the existing React component tree in `src/web/components/ItemCard.tsx` and `src/web/components/CollectionList.tsx` as the implementation surface.
- Keep the feature fully in the web UI layer; no backend or contract changes are needed because the current API already exposes the required item, tag, and theme data.
- Reuse the existing theme preference hook and the current `data-theme` root attribute so the new card styling works in both light and dark modes without introducing new state management.
- Use lightweight inline SVG assets for the item-type icon, copy/edit/delete/open/reorder theme controls, and keep the visual treatment aligned with the existing CSS variables.

## Rationale

The current collection UI already supports items, tags, copy action feedback, theme persistence, and reorder controls. The requested redesign is primarily a visual/layout refinement and interaction polish rather than a new domain feature. Implementing it in the existing component and stylesheet layers provides the most direct path to the requested experience while preserving the constitution's constraints.

## Alternatives considered

- Introduce a new component library or animation system: rejected because the project explicitly prefers lightweight, purpose-built UI changes and does not need new dependencies.
- Add backend endpoints for card metadata or icon mapping: rejected because the API already provides enough data and the change is presentation-only.
- Rebuild the collection UI from scratch: rejected because it would increase scope and risk without improving the outcome for this feature.
