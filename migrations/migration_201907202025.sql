CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "CustomCommand" (
  id uuid UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  name varchar(100) UNIQUE NOT NULL,
  body varchar(2000) NOT NULL,
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL,
  "MessageId" varchar(255)
);

ALTER TABLE ONLY "CustomCommand"
  ADD CONSTRAINT "CustomCommand_pkey" PRIMARY KEY (id);