# Research & Architectural Decisions: New Tag Column Icon

## 1. Icon Component Design

- **Decision**: Create a dedicated React component `TagColumnIcon` in `src/web/components/TagColumnIcon.tsx`.
- **Rationale**: Encapsulates the SVG markup, `viewBox="0 0 64 64"`, `fill="currentColor"`, and aria attributes in a clean, reusable component that can be placed in both the topbar button and sidebar header.
- **Alternatives considered**:
  - Inlining the raw `<svg>` block in multiple components: rejected to prevent duplication and ensure consistent SVG path rendering.
  - Using an external icon library: rejected because the user supplied a custom, specific SVG definition.

## 2. Layout & Alignment

- **Decision**: Use CSS flexbox with `flex-direction: column` and `align-items: center` for both the topbar Tags button and the sidebar header title (`<h2>`).
- **Rationale**: Satisfies the user clarification requirement that text appears at top centered, with the soft bar bookmark icon directly below text.
- **Alternatives considered**:
  - Horizontal inline layout (icon next to text): rejected based on explicit user decision during `/speckit-clarify`.

## 3. Accessibility & Theme Integration

- **Decision**: Set `aria-hidden="true"` on the icon when rendered alongside visual text "Tags", and use `fill="currentColor"` for seamless dark/light theme switching.
- **Rationale**: Ensures screen readers announce "Tags" without duplicating visual-only icon descriptions, and preserves dark/light theme CSS color variables without hardcoded hex colors.
