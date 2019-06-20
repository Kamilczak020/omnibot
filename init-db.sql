CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "Message" (
  id varchar(255) UNIQUE NOT NULL,
  author varchar(100) NOT NULL,
  body varchar(2000),
  channel varchar(100),
  guild varchar(100),
  reactions varchar(100) [],
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE "Command" (
  id uuid UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  name varchar(100),
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL,
  "MessageId" varchar(255)
);

CREATE TABLE "CommandData" (
  id uuid UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  key varchar(100),
  value varchar(2000),
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL,
  "CommandId" uuid
);

ALTER TABLE ONLY "CommandData"
  ADD CONSTRAINT "CommandData_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY "Command"
  ADD CONSTRAINT "Command_pkey" PRIMARY KEY (id);


ALTER TABLE ONLY "Message"
  ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id); 

ALTER TABLE ONLY "CommandData"
  ADD CONSTRAINT "CommandData_CommandId_fkey" FOREIGN KEY ("CommandId") REFERENCES "Command"(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "Command"
    ADD CONSTRAINT "Command_MessageId_fkey" FOREIGN KEY ("MessageId") REFERENCES "Message"(id) ON UPDATE CASCADE ON DELETE SET NULL;