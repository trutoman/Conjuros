ALTER TABLE "collection_items" DROP CONSTRAINT "collection_items_kind_fields_check";--> statement-breakpoint
ALTER TYPE "public"."item_kind" RENAME VALUE 'spell' TO 'command';--> statement-breakpoint
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_kind_fields_check" CHECK ((
        ("collection_items"."kind" = 'command' AND "collection_items"."command" IS NOT NULL AND "collection_items"."url" IS NULL AND "collection_items"."content" IS NULL AND "collection_items"."filename" IS NULL)
        OR ("collection_items"."kind" = 'web-link' AND "collection_items"."url" IS NOT NULL AND "collection_items"."command" IS NULL AND "collection_items"."content" IS NULL AND "collection_items"."filename" IS NULL)
        OR ("collection_items"."kind" IN ('markdown', 'file') AND "collection_items"."content" IS NOT NULL AND "collection_items"."command" IS NULL AND "collection_items"."url" IS NULL)
      ));--> statement-breakpoint
UPDATE "themes"
SET "kind_colors" = CASE
  WHEN "kind_colors" ? 'command' THEN "kind_colors" - 'spell'
  ELSE ("kind_colors" - 'spell') || jsonb_build_object('command', "kind_colors" -> 'spell')
END
WHERE "kind_colors" ? 'spell';--> statement-breakpoint
UPDATE "themes"
SET "icon_assets" = CASE
  WHEN "icon_assets" ? 'command' THEN "icon_assets" - 'spell'
  ELSE ("icon_assets" - 'spell') || jsonb_build_object('command', "icon_assets" -> 'spell')
END
WHERE jsonb_typeof("icon_assets") = 'object' AND "icon_assets" ? 'spell';--> statement-breakpoint
UPDATE "themes"
SET "icon_assets" = (
  SELECT jsonb_agg(CASE WHEN element = '"spell"'::jsonb THEN '"command"'::jsonb ELSE element END)
  FROM jsonb_array_elements("icon_assets") AS element
)
WHERE jsonb_typeof("icon_assets") = 'array' AND "icon_assets" @> '["spell"]'::jsonb;
