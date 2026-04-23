CREATE TYPE "public"."session_seat_status" AS ENUM('AVAILABLE', 'BLOCKED', 'RESERVED');--> statement-breakpoint
CREATE TABLE "catalog"."session_seats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"seat_key" text NOT NULL,
	"row_label" text NOT NULL,
	"seat_number" integer NOT NULL,
	"seat_type" text NOT NULL,
	"status" "session_seat_status" DEFAULT 'AVAILABLE' NOT NULL,
	"is_accessibility_seat" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "catalog"."session_seats" ADD CONSTRAINT "session_seats_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "iam"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."session_seats" ADD CONSTRAINT "session_seats_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "catalog"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "catalog_session_seats_session_seat_key_uq" ON "catalog"."session_seats" USING btree ("session_id","seat_key");--> statement-breakpoint
CREATE INDEX "catalog_session_seats_tenant_id_idx" ON "catalog"."session_seats" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "catalog_session_seats_session_id_idx" ON "catalog"."session_seats" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "catalog_session_seats_tenant_session_idx" ON "catalog"."session_seats" USING btree ("tenant_id","session_id");--> statement-breakpoint
CREATE INDEX "catalog_session_seats_session_status_idx" ON "catalog"."session_seats" USING btree ("session_id","status");