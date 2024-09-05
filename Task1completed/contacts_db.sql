-- CREATE DATABASE contacts_db;
-- USE contacts_db;
CREATE DATABASE IF NOT EXISTS contacts_db;
USE contacts_db;

CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    lastname VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50)
);
 