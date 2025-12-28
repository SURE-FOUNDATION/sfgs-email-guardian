-- Add 'class' column to students table
ALTER TABLE students ADD COLUMN class VARCHAR(16);
-- Optionally, set NOT NULL and a default if you want:
-- ALTER TABLE students ALTER COLUMN class SET DEFAULT '';
-- ALTER TABLE students ALTER COLUMN class SET NOT NULL;
