CREATE TABLE "attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"item_id" text NOT NULL,
	"bucket_id" text NOT NULL,
	"object_path" text NOT NULL,
	"original_filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" bigint NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "attachments_itemId_unique" UNIQUE("item_id"),
	CONSTRAINT "attachments_objectPath_unique" UNIQUE("object_path"),
	CONSTRAINT "attachments_size_bytes_check" CHECK ("attachments"."size_bytes" > 0),
	CONSTRAINT "attachments_object_path_owner_check" CHECK ("attachments"."object_path" LIKE "attachments"."user_id" || '/%')
);
--> statement-breakpoint
ALTER TABLE "attachments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_item_id_collection_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."collection_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attachments_user_id_idx" ON "attachments" USING btree ("user_id");