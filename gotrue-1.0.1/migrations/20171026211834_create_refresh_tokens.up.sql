DROP TABLE IF EXISTS refresh_tokens;
CREATE TABLE refresh_tokens (
    instance_id varchar(255) DEFAULT NULL,
    id bigserial NOT NULL,
    token varchar(255) DEFAULT NULL,
    user_id varchar(255) DEFAULT NULL,
    revoked boolean DEFAULT NULL,
    created_at timestamp DEFAULT NULL,
    PRIMARY KEY (id)
);

CREATE INDEX refresh_tokens_instance_id_idx ON refresh_tokens(instance_id);
CREATE INDEX refresh_tokens_instance_id_user_id_idx ON refresh_tokens(instance_id, user_id);
CREATE INDEX refresh_tokens_token_idx ON refresh_tokens(token);
