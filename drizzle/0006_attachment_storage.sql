ALTER TABLE "collection_items" ADD COLUMN "storage_path" text;--> statement-breakpoint
ALTER TABLE "collection_items" DROP CONSTRAINT "collection_items_kind_fields_check";--> statement-breakpoint
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_kind_fields_check" CHECK ((
        ("collection_items"."kind"::text = 'command' AND "collection_items"."command" IS NOT NULL AND "collection_items"."url" IS NULL AND "collection_items"."content" IS NULL AND "collection_items"."filename" IS NULL AND "collection_items"."storage_path" IS NULL)
        OR ("collection_items"."kind"::text = 'web-link' AND "collection_items"."url" IS NOT NULL AND "collection_items"."command" IS NULL AND "collection_items"."content" IS NULL AND "collection_items"."filename" IS NULL AND "collection_items"."storage_path" IS NULL)
        OR ("collection_items"."kind"::text IN ('markdown', 'file') AND "collection_items"."content" IS NOT NULL AND "collection_items"."command" IS NULL AND "collection_items"."url" IS NULL AND "collection_items"."storage_path" IS NULL)
        OR ("collection_items"."kind"::text = 'attachment' AND "collection_items"."command" IS NULL AND "collection_items"."url" IS NULL AND "collection_items"."content" IS NULL)
      ));--> statement-breakpoint
UPDATE "themes"
SET "kind_colors" = "kind_colors" || '{"attachment":"#be123c"}'::jsonb
WHERE NOT ("kind_colors" ? 'attachment');
