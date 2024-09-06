/* CREATE TABLE IF NOT EXISTS accounts (
  username VARCHAR(50) PRIMARY KEY,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL,
  accountStatus VARCHAR(10) NOT NULL DEFAULT 'active'
);

INSERT INTO accounts (`username`,`password`,`email`)
VALUES ('admin','admin', '123@abc.com');

CREATE TABLE IF NOT EXISTS usergroup (
	username VARCHAR(50),
    user_group VARCHAR(20) NOT NULL,
	PRIMARY KEY (username, user_group) 
);

INSERT INTO usergroup (`username`,`user_group`)
VALUES ("admin","admin") */
