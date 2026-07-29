# Research: Item Collection UI Refresh

## 1. Theme Preference Persistence

- **Decision**: Persist the selected theme per authenticated user and sync it across devices.
- **Rationale**: The clarified requirement explicitly requires user-scoped persistence, not browser-only persistence. This preserves the same preference after sign-in on a second device.
- **Alternatives considered**:
  - Browser-only storage. Rejected because it would not satisfy cross-device persistence.
  - Hybrid browser fallback only. Rejected because the product requirement is user-scoped, not profile-scoped.

## 2. Default Theme

- **Decision**: Use the light theme as the default when no preference has been saved.
- **Rationale**: This matches the specification assumptions and gives a predictable baseline for new or returning users without a saved preference.
- **Alternatives considered**:
  - Dark as the default. Rejected because it conflicts with the spec assumption and would change the first-visit experience.
  - Let the browser decide automatically. Rejected because the feature needs a stable, testable default.

## 3. Tag Color Presentation

- **Decision**: Reuse the existing validated tag color model and surface it as both a visible swatch during editing and colored tag text in item views.
- **Rationale**: The current contracts already validate tag colors as `#RRGGBB`, so the refresh should emphasize presentation rather than invent a second color model.
- **Alternatives considered**:
  - Introduce a new palette or color picker format. Rejected because it would duplicate the existing tag model without adding user value.
  - Show tag colors only in edit forms. Rejected because the requirement also calls for visible color treatment in item views.

## 4. Item Actions and Feedback

- **Decision**: Keep copy, open, edit, and delete as direct actions on the card, with brief success/failure feedback and de-emphasized secondary actions until hover or focus.
- **Rationale**: This preserves fast retrieval and quick actions while reducing visual noise and preserving accessibility.
- **Alternatives considered**:
  - Modal-heavy action flows. Rejected because they slow down the collection's primary quick-action workflow.
  - Always-visible secondary action buttons. Rejected because they increase visual clutter and weaken scanning speed.
