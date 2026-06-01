CREATE TABLE `audience_data` (
	`id` text PRIMARY KEY NOT NULL,
	`influencer_id` text NOT NULL,
	`age_group` text NOT NULL,
	`percentage` real NOT NULL,
	`gender` text,
	`country` text,
	`recorded_at` integer NOT NULL,
	FOREIGN KEY (`influencer_id`) REFERENCES `influencer_profiles`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `brand_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`company_name` text NOT NULL,
	`website` text DEFAULT '' NOT NULL,
	`logo` text,
	`category` text DEFAULT 'General' NOT NULL,
	`description` text,
	`instagram_page` text,
	`brand_size` text DEFAULT 'smb',
	`budget_range` text DEFAULT 'mid',
	`status` text DEFAULT 'pending' NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`verified_at` integer,
	`verified_by` text,
	`verification_note` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `creator_services` (
	`id` text PRIMARY KEY NOT NULL,
	`influencer_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`price` integer NOT NULL,
	`delivery_time` text,
	`example_url` text,
	FOREIGN KEY (`influencer_id`) REFERENCES `influencer_profiles`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `influencer_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`instagram_handle` text NOT NULL,
	`followers` integer DEFAULT 0 NOT NULL,
	`engagement_rate` real DEFAULT 0 NOT NULL,
	`avg_views` integer DEFAULT 0 NOT NULL,
	`avg_likes` integer DEFAULT 0 NOT NULL,
	`niche` text DEFAULT 'Lifestyle' NOT NULL,
	`pricing` integer DEFAULT 0 NOT NULL,
	`level` text DEFAULT 'nano' NOT NULL,
	`country` text,
	`bio` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`verified_at` integer,
	`verified_by` text,
	`verification_note` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `influencer_accounts_instagram_handle_unique` ON `influencer_accounts` (`instagram_handle`);--> statement-breakpoint
CREATE TABLE `otps` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`code` text NOT NULL,
	`method` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reach_scores` (
	`id` text PRIMARY KEY NOT NULL,
	`influencer_id` text NOT NULL,
	`score` real NOT NULL,
	`breakdown` text,
	`recorded_at` integer NOT NULL,
	FOREIGN KEY (`influencer_id`) REFERENCES `influencer_profiles`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `saved_influencers` (
	`id` text PRIMARY KEY NOT NULL,
	`brand_id` text NOT NULL,
	`influencer_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`brand_id`) REFERENCES `brand_profiles`(`user_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`influencer_id`) REFERENCES `influencer_profiles`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `wallet_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`amount` integer NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`reference` text,
	`status` text DEFAULT 'completed' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `brand_profiles` ADD `instagram_page` text;--> statement-breakpoint
ALTER TABLE `brand_profiles` ADD `brand_size` text DEFAULT 'smb';--> statement-breakpoint
ALTER TABLE `brand_profiles` ADD `budget_range` text DEFAULT 'mid';--> statement-breakpoint
ALTER TABLE `brand_profiles` ADD `social_links` text;--> statement-breakpoint
ALTER TABLE `brand_profiles` ADD `verified` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `campaign_applications` ADD `influencer_account_id` text REFERENCES influencer_accounts(id);--> statement-breakpoint
ALTER TABLE `campaigns` ADD `brand_account_id` text REFERENCES brand_accounts(id);--> statement-breakpoint
ALTER TABLE `campaigns` ADD `allow_fraction` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `influencer_profiles` ADD `avg_likes` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `influencer_profiles` ADD `reach_score` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `influencer_profiles` ADD `country` text;--> statement-breakpoint
ALTER TABLE `influencer_profiles` ADD `social_links` text;--> statement-breakpoint
ALTER TABLE `influencer_profiles` ADD `audience_demographics` text;--> statement-breakpoint
ALTER TABLE `influencer_profiles` ADD `posting_frequency` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `influencer_profiles` ADD `growth_rate` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `wallet_balance` integer DEFAULT 50000 NOT NULL;