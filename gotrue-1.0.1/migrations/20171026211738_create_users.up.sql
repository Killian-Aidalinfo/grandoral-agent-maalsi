DROP TABLE IF EXISTS users;
CREATE TABLE users (
  instance_id varchar(255) DEFAULT NULL,
  id varchar(255) NOT NULL,
  aud varchar(255) DEFAULT NULL,
  role varchar(255) DEFAULT NULL,
  email varchar(255) DEFAULT NULL,
  encrypted_password varchar(255) DEFAULT NULL,
  confirmed_at timestamp NULL DEFAULT NULL,
  invited_at timestamp NULL DEFAULT NULL,
  confirmation_token varchar(255) DEFAULT NULL,
  confirmation_sent_at timestamp NULL DEFAULT NULL,
  recovery_token varchar(255) DEFAULT NULL,
  recovery_sent_at timestamp NULL DEFAULT NULL,
  email_change_token varchar(255) DEFAULT NULL,
  email_change varchar(255) DEFAULT NULL,
  email_change_sent_at timestamp NULL DEFAULT NULL,
  last_sign_in_at timestamp NULL DEFAULT NULL,
  raw_app_meta_data text DEFAULT NULL,
  raw_user_meta_data text DEFAULT NULL,
  is_super_admin boolean DEFAULT NULL,
  created_at timestamp NULL DEFAULT NULL,
  updated_at timestamp NULL DEFAULT NULL,
  PRIMARY KEY (id)
);

CREATE INDEX users_instance_id_idx ON users(instance_id);
CREATE INDEX users_instance_id_email_idx ON users(instance_id, email);
