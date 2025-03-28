-- Dump adapté à PostgreSQL pour la base gotrue_development

-- Table audit_log_entries
DROP TABLE IF EXISTS audit_log_entries;
CREATE TABLE audit_log_entries (
    instance_id varchar(255),
    id varchar(255) NOT NULL,
    payload json,
    created_at timestamp,
    PRIMARY KEY (id)
);
-- Index sur instance_id
CREATE INDEX audit_logs_instance_id_idx ON audit_log_entries(instance_id);

-- Table instances
DROP TABLE IF EXISTS instances;
CREATE TABLE instances (
    id varchar(255) NOT NULL,
    uuid varchar(255),
    raw_base_config text,
    created_at timestamp,
    updated_at timestamp,
    PRIMARY KEY (id)
);

-- Table refresh_tokens
DROP TABLE IF EXISTS refresh_tokens;
CREATE TABLE refresh_tokens (
    instance_id varchar(255),
    id bigserial NOT NULL,
    token varchar(255),
    user_id varchar(255),
    revoked boolean,
    created_at timestamp,
    updated_at timestamp,
    PRIMARY KEY (id)
);
CREATE INDEX refresh_tokens_instance_id_idx ON refresh_tokens(instance_id);
CREATE INDEX refresh_tokens_instance_id_user_id_idx ON refresh_tokens(instance_id, user_id);
CREATE INDEX refresh_tokens_token_idx ON refresh_tokens(token);

-- Table schema_migration
DROP TABLE IF EXISTS schema_migration;
CREATE TABLE schema_migration (
    version varchar(255) NOT NULL,
    CONSTRAINT schema_migration_version_idx UNIQUE (version)
);

-- Table users
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    instance_id varchar(255),
    id varchar(255) NOT NULL,
    aud varchar(255),
    role varchar(255),
    email varchar(255),
    encrypted_password varchar(255),
    confirmed_at timestamp,
    invited_at timestamp,
    confirmation_token varchar(255),
    confirmation_sent_at timestamp,
    recovery_token varchar(255),
    recovery_sent_at timestamp,
    email_change_token varchar(255),
    email_change varchar(255),
    email_change_sent_at timestamp,
    last_sign_in_at timestamp,
    raw_app_meta_data json,
    raw_user_meta_data json,
    is_super_admin boolean,
    created_at timestamp,
    updated_at timestamp,
    PRIMARY KEY (id)
);
CREATE INDEX users_instance_id_idx ON users(instance_id);
CREATE INDEX users_instance_id_email_idx ON users(instance_id, email);
