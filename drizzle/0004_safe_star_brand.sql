CREATE TABLE "catalog"."rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"seat_layout" jsonb NOT NULL,
	"seat_count" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "catalog"."rooms" ADD CONSTRAINT "rooms_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "iam"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "catalog_rooms_tenant_id_idx" ON "catalog"."rooms" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "catalog_rooms_tenant_name_uq" ON "catalog"."rooms" USING btree ("tenant_id","name");