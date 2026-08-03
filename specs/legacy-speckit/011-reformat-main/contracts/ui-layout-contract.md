# UI Layout Contract: Boxed Application Shell

## Overview
This contract defines the component structure, CSS classes, responsive breakpoints, and animation specifications for the Boxed Application Shell.

## Component Layout Contract

### CSS Class Contracts

| Element / Region | Selector | Responsibilities | Breakpoint Rules |
|------------------|----------|------------------|------------------|
| Outer Container | `.app-shell` | Bounded centered shell | Desktop (>650px): `width: min(1440px, calc(100% - 2rem)); margin: 0 auto;`<br/>Mobile (<=650px): `width: min(100% - 1rem, 1120px); padding-top: 1rem;` |
| Main Body Layout | `.app-shell-body` | Flex layout container for sidebar, main, and log panels | `display: flex; gap: 1.5rem; align-items: flex-start;` |
| Collapsible Sidebar | `.app-sidebar` | In-flow collapsible container for search & tag categories | Expanded: `max-width: 260px; width: 100%; opacity: 1;`<br/>Collapsed: `max-width: 0; opacity: 0; overflow: hidden;` |
| Sidebar Animation | `.app-sidebar` transition | Smooth collapse/expand transition | `transition: max-width 200ms ease, opacity 150ms ease;` |
| Main Collection Frame | `.main-content-frame` | Flex-grow 1 main panel housing card grid | `flex: 1 1 0%; min-width: 0;` |
| Collection Card Grid | `.collection-grid` | Responsive grid for item cards | `display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem;` |
| Log Panel | `.log-panel-frame` | Auxiliary activity panel inside app-shell | Rendered in-bounds inside `.app-shell-body` |

## Visual Stability Guarantees
1. Collapsing `.app-sidebar` MUST NOT trigger card displacement or layout line jumps in `.collection-grid`.
2. `.app-shell` MUST remain horizontally centered at all times on viewports >650px.
