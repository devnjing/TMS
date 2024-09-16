const express = require("express");
const cors = require("cors");
const accounts = require("./routes/accounts");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: "http://localhost:5173", // or a list of trusted domains
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

app.use("/api", accounts);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
