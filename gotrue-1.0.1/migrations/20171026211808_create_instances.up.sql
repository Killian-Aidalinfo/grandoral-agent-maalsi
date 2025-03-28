DROP TABLE IF EXISTS instances;
CREATE TABLE instances (
    id varchar(255) NOT NULL,
    uuid varchar(255),
    raw_base_config text,
    created_at timestamp,
    updated_at timestamp,
    deleted_at timestamp,
    PRIMARY KEY (id)
);
