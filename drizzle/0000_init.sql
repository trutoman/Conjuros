CREATE TYPE "public"."item_kind" AS ENUM('spell', 'web-link', 'markdown', 'file');--> statement-breakpoint
CREATE TYPE "public"."theme_preference" AS ENUM('light', 'dark');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "collection_items" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"kind" "item_kind" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"related_item_ids" text[] DEFAULT '{}' NOT NULL,
	"position" integer NOT NULL,
	"command" text,
	"url" text,
	"content" text,
	"filename" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "collection_items_kind_fields_check" CHECK ((
        ("collection_items"."kind" = 'spell' AND "collection_items"."command" IS NOT NULL AND "collection_items"."url" IS NULL AND "collection_items"."content" IS NULL AND "collection_items"."filename" IS NULL)
        OR ("collection_items"."kind" = 'web-link' AND "collection_items"."url" IS NOT NULL AND "collection_items"."command" IS NULL AND "collection_items"."content" IS NULL AND "collection_items"."filename" IS NULL)
        OR ("collection_items"."kind" IN ('markdown', 'file') AND "collection_items"."content" IS NOT NULL AND "collection_items"."command" IS NULL AND "collection_items"."url" IS NULL)
      ))
);
--> statement-breakpoint
CREATE TABLE "tag_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"name_normalized" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"tag_ids" text[] DEFAULT '{}' NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"tag_name" text NOT NULL,
	"tag_name_normalized" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"color" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "themes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"label" text NOT NULL,
	"colors" jsonb NOT NULL,
	"font_sizes" jsonb NOT NULL,
	"fonts" jsonb NOT NULL,
	"icon_assets" jsonb NOT NULL,
	"kind_colors" jsonb NOT NULL,
	"tag_color_palette" text[] NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "themes_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"theme" "theme_preference" DEFAULT 'light' NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag_categories" ADD CONSTRAINT "tag_categories_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "collection_items_owner_position_idx" ON "collection_items" USING btree ("owner_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "tag_categories_owner_name_normalized_idx" ON "tag_categories" USING btree ("owner_id","name_normalized");--> statement-breakpoint
CREATE INDEX "tags_owner_name_normalized_idx" ON "tags" USING btree ("owner_id","tag_name_normalized");--> statement-breakpoint
CREATE INDEX "tags_owner_position_idx" ON "tags" USING btree ("owner_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "themes_single_default_idx" ON "themes" USING btree ("is_default") WHERE "themes"."is_default";