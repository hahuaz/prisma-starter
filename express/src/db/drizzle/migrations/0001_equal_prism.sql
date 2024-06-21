ALTER TABLE "users" ADD COLUMN "created_at" timestamp (3) DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp (3);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "update_counter" integer DEFAULT 1;