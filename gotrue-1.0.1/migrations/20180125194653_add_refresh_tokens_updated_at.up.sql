ALTER TABLE refresh_tokens ADD COLUMN updated_at timestamp;
UPDATE refresh_tokens SET updated_at = created_at WHERE updated_at IS NULL;
