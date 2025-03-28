DROP TABLE IF EXISTS audit_log_entries;
CREATE TABLE audit_log_entries (
  instance_id varchar(255),
  id varchar(255) NOT NULL,
  payload json,
  created_at timestamp,
  PRIMARY KEY (id)
);

CREATE INDEX audit_logs_instance_id_idx ON audit_log_entries(instance_id);
