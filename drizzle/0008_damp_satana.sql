ALTER TABLE "themes" ADD COLUMN "backdrop" jsonb;--> statement-breakpoint
UPDATE "themes" SET "backdrop" = '{"pattern":"lines","gridSize":"40px","lineWidth":"1px","glowPosition":"top-right","glowSize":"30%","glowColor":"rgba(148, 163, 184, 0.08)"}'::jsonb WHERE "name" = 'dark';--> statement-breakpoint
UPDATE "themes" SET "backdrop" = '{"pattern":"lines","gridSize":"40px","lineWidth":"1px","glowPosition":"top-right","glowSize":"30%","glowColor":"rgba(15, 23, 42, 0.04)"}'::jsonb WHERE "backdrop" IS NULL;--> statement-breakpoint
ALTER TABLE "themes" ALTER COLUMN "backdrop" SET NOT NULL;
