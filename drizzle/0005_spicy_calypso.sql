CREATE TYPE "public"."session_status" AS ENUM('SCHEDULED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "catalog"."sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"movie_id" uuid NOT NULL,
	"room_id" uuid NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"status" "session_status" DEFAULT 'SCHEDULED' NOT NULL,
	"room_layout_snapshot" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "catalog"."sessions" ADD CONSTRAINT "sessions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "iam"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."sessions" ADD CONSTRAINT "sessions_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "catalog"."movies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."sessions" ADD CONSTRAINT "sessions_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "catalog"."rooms"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "catalog_sessions_tenant_id_idx" ON "catalog"."sessions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "catalog_sessions_room_id_idx" ON "catalog"."sessions" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "catalog_sessions_tenant_room_starts_at_idx" ON "catalog"."sessions" USING btree ("tenant_id","room_id","starts_at");--> statement-breakpoint
CREATE INDEX "catalog_sessions_tenant_starts_at_idx" ON "catalog"."sessions" USING btree ("tenant_id","starts_at");