## REMOVED Requirements

### Requirement: Item form replaces entire main content frame

**Reason**: Replaced by the floating modal pattern. The item list must stay visible at all times, so no window is allowed to replace the main content frame anymore.

**Migration**: The Add/Edit item form now opens as a floating modal over the persistent item list. See the `floating-modal-dialogs` capability for the shared modal contract (overlay, backdrop-click and Escape dismissal, focus management).
