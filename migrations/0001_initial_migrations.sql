-- Migration number: 0001 	 2025-03-18T10:00:00.000Z

CREATE TABLE articles
(
	id         TEXT PRIMARY KEY,
	topic      TEXT                                NOT NULL,
	status     INTEGER                             NOT NULL, -- 1: Running, 2: Complete, 3: Error
	content    TEXT,
	sources    TEXT, -- Store sources as JSON string
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
	user       TEXT      DEFAULT 'unknown'         NOT NULL
);
