CREATE TABLE `usage_events` (
	`id` text PRIMARY KEY NOT NULL,
	`faculty` text NOT NULL,
	`department` text NOT NULL,
	`stage` text NOT NULL,
	`workflow` text NOT NULL,
	`assessment_profile` text NOT NULL,
	`assessment_format` text NOT NULL,
	`academic_period` text NOT NULL,
	`created_at` text NOT NULL,
	`month` text NOT NULL
);
