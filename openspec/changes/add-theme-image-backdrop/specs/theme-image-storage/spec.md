## Purpose

Stores theme background images in a public, per-environment Supabase Storage bucket, validated on upload and never deleted by the application, so that every user receives the same theme assets.

## ADDED Requirements

### Requirement: Theme images are stored in a public per-environment bucket

Theme background images SHALL be stored in the Supabase Storage bucket named by the `THEME_ASSET_BUCKET` environment variable, which SHALL default to `assets`. The bucket already exists in each environment and SHALL be public for reads so that the browser can load the image by URL. DEV and PROD SHALL each use their own project's `assets` bucket.

#### Scenario: DEV and PROD use separate buckets

- **WHEN** the DEV and PROD deployments are configured with different `THEME_ASSET_BUCKET` values
- **THEN** an image uploaded in DEV is not visible in PROD

#### Scenario: Missing configuration uses the default bucket

- **WHEN** `THEME_ASSET_BUCKET` is not set
- **THEN** theme images are stored in the `assets` bucket

### Requirement: Uploads are restricted to administrators and validated

Only authenticated administrators SHALL be able to upload a theme image. The server SHALL accept only `png`, `jpeg`, and `webp` files whose content matches the declared type, and SHALL reject files larger than 5 MB. A rejected upload SHALL NOT create a stored object or change the theme.

#### Scenario: Administrator uploads a valid PNG

- **WHEN** an administrator uploads a PNG under 5 MB
- **THEN** the image is stored and the theme references it
- **AND** the response reports the new image reference

#### Scenario: Non-administrator upload is refused

- **WHEN** a non-administrator user attempts to upload a theme image
- **THEN** the request is refused with a 403 response
- **AND** nothing is stored

#### Scenario: Unsupported type is refused

- **WHEN** an administrator uploads an SVG or GIF file
- **THEN** the request is refused with a 415 response
- **AND** nothing is stored

#### Scenario: Oversized file is refused

- **WHEN** an administrator uploads a PNG larger than 5 MB
- **THEN** the request is refused with a 413 response
- **AND** nothing is stored

#### Scenario: Content that does not match the declared type is refused

- **WHEN** a file named `background.png` contains JPEG data
- **THEN** the request is refused with a 415 response
- **AND** nothing is stored

### Requirement: Object paths do not depend on client input

A stored theme image SHALL be saved at `themes/{theme_id}/{uuid}.{ext}`, where `ext` is derived from the validated MIME type. The client file name SHALL NOT appear in the object path.

#### Scenario: Object path ignores the client file name

- **WHEN** an administrator uploads `Fondo final (v2).webp`
- **THEN** the object is stored as `themes/{theme_id}/{uuid}.webp`

### Requirement: Stored theme images are never deleted by the application

The application SHALL NOT delete a theme image object from Storage. Replacing a theme's image SHALL store the new object and leave the previous object in place. Deleting a theme SHALL NOT delete its image objects. A failed replacement SHALL leave the theme's current image reference unchanged.

#### Scenario: Replacing an image keeps the previous object

- **WHEN** an administrator replaces a theme's image with a new valid file
- **THEN** the theme references the new object
- **AND** the previous object remains in Storage

#### Scenario: Deleting a theme keeps its images

- **WHEN** an administrator deletes a theme that has an image
- **THEN** the theme is removed
- **AND** its image objects remain in Storage

#### Scenario: Failed replacement changes nothing

- **WHEN** an administrator's replacement upload fails validation or storage
- **THEN** the theme keeps its previous image reference
- **AND** the previous object remains in Storage
