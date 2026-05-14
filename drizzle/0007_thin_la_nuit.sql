CREATE TYPE "public"."reservation_status" AS ENUM('HOLD', 'CONFIRMED', 'CANCELLED', 'EXPIRED');--> statement-breakpoint
ALTER TYPE "public"."session_seat_status" ADD VALUE 'HELD' BEFORE 'RESERVED';--> statement-breakpoint
CREATE TABLE "catalog"."reservation_seats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"reservation_id" uuid NOT NULL,
	"session_seat_id" uuid NOT NULL,
	"seat_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catalog"."reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"status" "reservation_status" DEFAULT 'HOLD' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "catalog"."reservation_seats" ADD CONSTRAINT "reservation_seats_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "iam"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."reservation_seats" ADD CONSTRAINT "reservation_seats_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "catalog"."reservations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."reservation_seats" ADD CONSTRAINT "reservation_seats_session_seat_id_session_seats_id_fk" FOREIGN KEY ("session_seat_id") REFERENCES "catalog"."session_seats"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."reservations" ADD CONSTRAINT "reservations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "iam"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."reservations" ADD CONSTRAINT "reservations_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "catalog"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."reservations" ADD CONSTRAINT "reservations_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "iam"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "catalog_reservation_seats_reservation_seat_uq" ON "catalog"."reservation_seats" USING btree ("reservation_id","session_seat_id");--> statement-breakpoint
CREATE INDEX "catalog_reservation_seats_tenant_id_idx" ON "catalog"."reservation_seats" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "catalog_reservation_seats_reservation_id_idx" ON "catalog"."reservation_seats" USING btree ("reservation_id");--> statement-breakpoint
CREATE INDEX "catalog_reservation_seats_session_seat_id_idx" ON "catalog"."reservation_seats" USING btree ("session_seat_id");--> statement-breakpoint
CREATE INDEX "catalog_reservations_tenant_id_idx" ON "catalog"."reservations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "catalog_reservations_session_id_idx" ON "catalog"."reservations" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "catalog_reservations_created_by_user_id_idx" ON "catalog"."reservations" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "catalog_reservations_tenant_status_idx" ON "catalog"."reservations" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "catalog_reservations_tenant_session_status_idx" ON "catalog"."reservations" USING btree ("tenant_id","session_id","status");--> statement-breakpoint
CREATE INDEX "catalog_reservations_expires_at_idx" ON "catalog"."reservations" USING btree ("expires_at");