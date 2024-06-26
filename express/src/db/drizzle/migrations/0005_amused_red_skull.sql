ALTER TABLE "authentications" DROP CONSTRAINT "authentications_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "authentications" ADD COLUMN "is_revoked" integer DEFAULT 0;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "authentications" ADD CONSTRAINT "authentications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
