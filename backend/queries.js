const queries = {
  // CRU for accounts
  addUser: "INSERT INTO accounts (username, password, email) VALUES (?, ?, ?)",
  getUsers: "SELECT * FROM accounts",
  getUserByName: "SELECT * FROM accounts WHERE username = ?",
  updateUser: "UPDATE accounts SET username = ?, password = ?, email = ?, accountstatus = ? WHERE username = ?",

  // CR for usergroup
  addGroup: "INSERT INTO usergroup (user_group) VALUES (?)",
  getGroups: "SELECT DISTINCT user_group FROM usergroup",
  getGroupByName: "SELECT user_group FROM usergroup WHERE username = ?"
};
