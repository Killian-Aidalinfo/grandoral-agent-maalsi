ALTER TABLE users
  ALTER COLUMN raw_app_meta_data TYPE text USING raw_app_meta_data::text,
  ALTER COLUMN raw_app_meta_data DROP DEFAULT,
  ALTER COLUMN raw_user_meta_data TYPE text USING raw_user_meta_data::text,
  ALTER COLUMN raw_user_meta_data DROP DEFAULT;
