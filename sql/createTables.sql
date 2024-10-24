CREATE TABLE IF NOT EXISTS accounts (
  username VARCHAR(50) PRIMARY KEY,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL,
  accountStatus VARCHAR(10) NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS usergroup (
	user_group VARCHAR(20) NOT NULL,
	username VARCHAR(50) DEFAULT(""),
	PRIMARY KEY (user_group,username) 
);

INSERT INTO usergroup (`user_group`,`username`)
VALUES ("admin");

INSERT INTO usergroup (`user_group`)
VALUES ("user");