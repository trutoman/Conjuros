ALTER TABLE "themes" ADD COLUMN "use_image_backdrop" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "image_backdrop" jsonb;