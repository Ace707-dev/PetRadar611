CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS lost_pets (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR NOT NULL,
  species      VARCHAR NOT NULL,
  breed        VARCHAR NOT NULL,
  color        VARCHAR NOT NULL,
  size         VARCHAR NOT NULL,
  description  TEXT NOT NULL,
  photo_url    VARCHAR,
  owner_name   VARCHAR NOT NULL,
  owner_email  VARCHAR NOT NULL,
  owner_phone  VARCHAR NOT NULL,
  location     GEOMETRY(Point, 4326) NOT NULL,
  address      VARCHAR NOT NULL,
  lost_date    TIMESTAMP NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lost_pets_location
  ON lost_pets USING GIST (location);

CREATE INDEX IF NOT EXISTS idx_lost_pets_is_active
  ON lost_pets (is_active);

CREATE TABLE IF NOT EXISTS found_pets (
  id           SERIAL PRIMARY KEY,
  species      VARCHAR NOT NULL,
  breed        VARCHAR,
  color        VARCHAR NOT NULL,
  size         VARCHAR NOT NULL,
  description  TEXT NOT NULL,
  photo_url    VARCHAR,
  finder_name  VARCHAR NOT NULL,
  finder_email VARCHAR NOT NULL,
  finder_phone VARCHAR NOT NULL,
  location     GEOMETRY(Point, 4326) NOT NULL,
  address      VARCHAR NOT NULL,
  found_date   TIMESTAMP NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_found_pets_location
  ON found_pets USING GIST (location);
