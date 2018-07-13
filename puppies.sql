DROP DATABASE IF EXISTS hercules_node;
CREATE DATABASE hercules_node;

\c hercules_node;

CREATE TABLE pups (
  ID SERIAL PRIMARY KEY,
  name VARCHAR,
  breed VARCHAR,
  age INTEGER,
  sex VARCHAR
);

INSERT INTO pups (name, breed, age, sex)
  VALUES ('Tyler', 'Retrieved', 3, 'M');

CREATE TABLE identity (
  ID SERIAL PRIMARY KEY,
  edge_account VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  zip_code INTEGER NOT NULL,
  DOB VARCHAR,
  city VARCHAR(255),
  state VARCHAR(255),
  ssn4 INTEGER,
  date_received TIMESTAMP(4)
);

INSERT INTO identity (edge_account, first_name, last_name, address, zip_code, date_received)
  VALUES ('hercstack', 'JOHN', 'SMITH', '222333 PEACHTREE PLACE', 30318, '2005-05-13 07:15:31.123456789');
