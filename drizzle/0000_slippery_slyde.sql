CREATE TYPE "public"."status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"email" varchar(255),
	"full_name" varchar(255) NOT NULL,
	"profile_image" text,
	"user_type" "role" NOT NULL,
	"is_verified" boolean DEFAULT false,
	"password" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"language_preference" varchar(5) DEFAULT 'en',
	"last_seen" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE INDEX "users_phone_idx" ON "users" USING btree ("phone_number");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");