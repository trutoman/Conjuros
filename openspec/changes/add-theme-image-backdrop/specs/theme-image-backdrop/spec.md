## Purpose

Lets each theme choose between the generated `backdrop` page background and a tiled image background stored with the theme, and falls back to the `backdrop` when the image cannot be used.

## ADDED Requirements

### Requirement: Each theme selects its background mode with a boolean

A theme SHALL carry a boolean `useImageBackdrop`. When it is `false`, the page background is rendered from the theme's `backdrop` settings. When it is `true`, the page background is rendered from the theme's `imageBackdrop` image. `useImageBackdrop` SHALL default to `false` for every theme that predates this capability.

#### Scenario: A theme without the flag keeps the backdrop mode

- **WHEN** a stored theme has `useImageBackdrop` set to `false`
- **THEN** the page background is rendered from its `backdrop` settings
- **AND** no texture variable is applied

#### Scenario: A pre-existing theme defaults to the backdrop mode

- **WHEN** a theme created before this capability is read
- **THEN** `useImageBackdrop` is `false`
- **AND** its appearance is unchanged

### Requirement: Image mode requires an image reference

When `useImageBackdrop` is `true`, the theme SHALL carry an `imageBackdrop` reference to a stored image. The contract SHALL reject a theme with `useImageBackdrop` set to `true` and no `imageBackdrop` reference. When `useImageBackdrop` is `false`, `imageBackdrop` MAY be `null` or present; a present reference SHALL be kept without being rendered.

#### Scenario: Image mode without an image is rejected

- **WHEN** an admin saves a theme with `useImageBackdrop` set to `true` and no image reference
- **THEN** the save is rejected with a validation error
- **AND** the stored theme is unchanged

#### Scenario: Image mode is enabled after the image is uploaded

- **WHEN** an administrator uploads an image for an existing theme and then sets `useImageBackdrop` to `true` and saves
- **THEN** the save succeeds because the reference already exists
- **AND** the checkbox cannot be enabled while the theme has no image reference

#### Scenario: Backdrop mode may keep an image reference

- **WHEN** an admin switches a theme with an image reference back to `useImageBackdrop` set to `false`
- **THEN** the save succeeds
- **AND** the image reference remains stored on the theme

### Requirement: Image mode tiles the image over the page

In image mode the page background SHALL show the theme's image as a repeated mosaic tile at its natural size, over the theme's page background color used as fallback while the image loads. No vignette or other gradient layer SHALL be drawn. The texture layer SHALL repeat in every direction and scroll with the page. The `backdrop` settings SHALL NOT affect the rendering in image mode.

#### Scenario: The image repeats across the whole page

- **WHEN** a theme in image mode is active and the image is loaded
- **THEN** the image is repeated in both horizontal and vertical directions at its natural size
- **AND** the page background color is visible behind the image tile wherever the tile is transparent

#### Scenario: The backdrop is shown until the image is confirmed

- **WHEN** a theme in image mode is activated and its image has not finished loading
- **THEN** the page renders the theme's `backdrop` settings until the image loads
- **AND** the page switches to the image tile once the image loads

#### Scenario: Backdrop settings are ignored in image mode

- **WHEN** a theme in image mode has backdrop settings that differ from the defaults
- **THEN** the page renders the image tile and no pattern or glow from the backdrop settings

### Requirement: The page falls back to the backdrop mode when the image is unusable

If the image referenced by an image-mode theme cannot be found or cannot be decoded as an image, the page SHALL render the theme's `backdrop` settings instead. The fallback SHALL NOT change the stored theme and SHALL NOT produce an error message for the user.

#### Scenario: Missing image falls back to the backdrop

- **WHEN** a theme in image mode references an image that the browser cannot load with a 404 or network failure
- **THEN** the page renders the theme's `backdrop` settings
- **AND** the stored `useImageBackdrop` value remains `true`

#### Scenario: Corrupt image falls back to the backdrop

- **WHEN** the referenced file is not a decodable image
- **THEN** the page renders the theme's `backdrop` settings
- **AND** no error is shown to the user

#### Scenario: A valid image is rendered without fallback

- **WHEN** the referenced image loads successfully
- **THEN** the page renders the image tile
- **AND** the backdrop settings are not rendered
