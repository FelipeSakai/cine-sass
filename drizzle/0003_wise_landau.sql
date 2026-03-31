CREATE SCHEMA "catalog";
--> statement-breakpoint
CREATE TYPE "public"."movie_source_provider" AS ENUM('TMDB');--> statement-breakpoint
CREATE TABLE "catalog"."movies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"title" text NOT NULL,
	"original_title" text,
	"synopsis" text,
	"poster_url" text,
	"backdrop_url" text,
	"release_date" date,
	"runtime_minutes" integer,
	"source_provider" "movie_source_provider" NOT NULL,
	"source_movie_id" text NOT NULL,
	"import_metadata" jsonb,
	"imported_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "catalog"."movies" ADD CONSTRAINT "movies_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "iam"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "catalog_movies_tenant_id_idx" ON "catalog"."movies" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "catalog_movies_tenant_source_movie_uq" ON "catalog"."movies" USING btree ("tenant_id","source_provider","source_movie_id");