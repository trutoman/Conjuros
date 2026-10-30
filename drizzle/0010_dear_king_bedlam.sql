CREATE TABLE "user_preferences" (
	"user_id" text PRIMARY KEY NOT NULL,
	"theme_id" text,
	"tags_panel_expanded" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_preferences" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
INSERT INTO "user_preferences" ("user_id", "theme_id", "tags_panel_expanded", "updated_at")
SELECT "u"."id", (SELECT "t"."id" FROM "themes" "t" WHERE "t"."name" = "u"."theme"::text), true, now()
FROM "users" "u";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "theme";--> statement-breakpoint
DROP TYPE "public"."theme_preference";