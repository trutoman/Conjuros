# Item Card UI Contract

## Overview

The collection item card UI presents a single collection item using a two-row layout with a type indicator, title, compact tags, an item value block, and a right-aligned action cluster.

## Rendering Contract

- The first row MUST show an item-type indicator, the item title, and the associated tags.
- The second row MUST show the item value in a code-style presentation alongside the action buttons.
- The action cluster MUST include copy, edit, delete, and reorder affordances in a consistent order.
- The card MUST preserve the existing item data shape and remain compatible with the current API responses.

## Interaction Contract

- Copy actions MUST return visible success or failure feedback through the existing action-message behavior.
- Web-link actions MUST remain explicit user-triggered actions that open only after activation.
- The theme toggle MUST continue to switch the `data-theme` attribute on the root element.
