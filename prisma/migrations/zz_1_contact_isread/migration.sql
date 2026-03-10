-- Add isRead and readAt columns to contact_submissions table
-- Note: Using quoted identifiers to match Prisma schema camelCase
ALTER TABLE "contact_submissions" 
ADD COLUMN IF NOT EXISTS "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMP(3);

-- Create index on isRead for better query performance
CREATE INDEX IF NOT EXISTS "contact_submissions_isRead_idx" ON "contact_submissions"("isRead");

-- Clean up any duplicate lowercase columns if they exist
ALTER TABLE "contact_submissions" DROP COLUMN IF EXISTS "isread";
ALTER TABLE "contact_submissions" DROP COLUMN IF EXISTS "readat";
