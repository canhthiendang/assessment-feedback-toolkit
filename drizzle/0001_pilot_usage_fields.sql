ALTER TABLE `usage_events` ADD `institution` text NOT NULL DEFAULT 'Not supplied';
ALTER TABLE `usage_events` ADD `module_level` text NOT NULL DEFAULT 'Not supplied';
ALTER TABLE `usage_events` ADD `output_type` text NOT NULL DEFAULT 'guide';
