CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "Birthday" (
  id uuid UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  member varchar(100) NOT NULL,
  date timestamp with time zone NOT NULL,
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL
);

ALTER TABLE ONLY "Birthday"
  ADD CONSTRAINT "Birthday_pkey" PRIMARY KEY (id);
