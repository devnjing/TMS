const express = require("express");
const cors = require("cors");
const auth = require("./routes/auth");
const accounts = require("./routes/accounts");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/", auth);
app.use("/users", accounts);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
