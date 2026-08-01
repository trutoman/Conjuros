# Research: Tag Categories

## Decision: Keep categories implicit on tag records rather than creating a separate category entity

**Rationale**: The specification requires categories to exist only through tags and forbids standalone category management. Storing `tagCategory` directly on each tag keeps the model aligned with that rule and avoids a second ownership, CRUD, and cleanup surface.

**Alternatives considered**:

- Create a dedicated `tagCategories` collection: rejected because it introduces independent category lifecycle and management operations the spec explicitly excludes.
- Store categories only in frontend state: rejected because category validation and duplicate detection must be enforced server-side.

## Decision: Use the normalized pair (`ownerId`, `tagNameNormalized`, `tagCategoryNormalized`) as the uniqueness key

**Rationale**: The feature requires duplicate detection to treat the combination of name and category as existence, while still allowing the same visible tag name in different categories. Persisting normalized comparison fields preserves user display casing while enforcing deterministic conflict checks.

**Alternatives considered**:

- Keep uniqueness on normalized tag name only: rejected because it blocks the required reuse of the same name across categories.
- Use raw display values for uniqueness: rejected because it would allow duplicates that differ only by case or surrounding whitespace.

## Decision: Keep collection item tags as tag-name strings and decouple category changes from item-tag storage

**Rationale**: Existing items already store tag references as strings. Category assignment organizes tags for management, but item membership still depends on tag names, so changing only the category must not require rewriting item tag arrays. Renaming the tag name remains the only tag change that should cascade to stored item tag values.

**Alternatives considered**:

- Migrate items to tag IDs in this feature: rejected because it broadens scope beyond tag categorization and creates a larger contract change.
- Encode category into item tag values: rejected because it would break existing item contracts and over-couple item storage to display organization.

## Decision: Backfill legacy tags without categories to `General`

**Rationale**: Existing persisted tags must remain usable once category becomes required. A deterministic `General` default preserves compatibility for current users, keeps migration behavior explicit, and matches the approved clarification.

**Alternatives considered**:

- Require manual user reassignment before tags are usable: rejected because it creates a blocking migration and degrades existing collections.
- Use `Uncategorized`: rejected because the approved clarification selected `General`.

## Decision: Treat category cleanup as the absence of remaining tag references, not as an explicit delete operation

**Rationale**: Because categories are implicit, cleanup happens automatically when no tags remain with the same normalized category for a user. The system does not need a separate category delete command or stored tombstone; later category reuse simply creates that category again through a new tag.

**Alternatives considered**:

- Add explicit category deletion logic and API endpoints: rejected because it violates the no-standalone-category-management requirement.
- Preserve empty historical categories: rejected because the spec requires empty categories to cease to exist.

## Decision: Reuse the existing tags management UI and make category visible there

**Rationale**: The repository already has tag form and tag list surfaces. Extending those views with required category input and visible category display satisfies the feature while preserving the product's focused management flow.

**Alternatives considered**:

- Build a dedicated category page or modal: rejected because it adds management surface area not required by the spec.
- Hide category until a later release: rejected because visible category context is a direct requirement.
