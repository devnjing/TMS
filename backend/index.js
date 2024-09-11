const express = require("express");
const cors = require("cors");
const accounts = require("./routes/accounts");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/api", accounts);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
