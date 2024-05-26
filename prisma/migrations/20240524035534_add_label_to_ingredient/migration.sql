-- This is an example migration file
-- Adjust the SQL statements as necessary to fit your needs

-- Add the new column with a default value to avoid issues with existing rows
ALTER TABLE "ingredients" ADD COLUMN "label" TEXT NOT NULL DEFAULT 'default label';

-- Optionally, you can set a specific value for existing rows and remove the default constraint
UPDATE "ingredients" SET "label" = 'existing label value' WHERE "label" IS NULL;

-- Remove the default value constraint if it's no longer needed
ALTER TABLE "ingredients" ALTER COLUMN "label" DROP DEFAULT;
