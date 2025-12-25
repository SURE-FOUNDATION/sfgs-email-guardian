-- Migration: Add cron_enabled to system_settings to control email sending
ALTER TABLE system_settings
ADD COLUMN cron_enabled boolean NOT NULL DEFAULT true;