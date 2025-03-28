UPDATE users
  SET raw_app_meta_data = '{}'::json
  WHERE raw_app_meta_data = '';

UPDATE users
  SET raw_user_meta_data = '{}'::json
  WHERE raw_user_meta_data = '';

ALTER TABLE users
  ALTER COLUMN raw_app_meta_data TYPE json USING raw_app_meta_data::json,
  ALTER COLUMN raw_user_meta_data TYPE json USING raw_user_meta_data::json;
