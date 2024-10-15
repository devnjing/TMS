const express = require("express");
const cors = require("cors");
const accounts = require("./routes/accounts");
const taskManagement = require("./routes/taskManagement");
const demo = require("./routes/demo");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: "http://localhost:5173", // needs to be in config file, list of trusted domains
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

app.use("/api", accounts, taskManagement);
app.use("/api/demo", demo);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// const http = require("http");

// // Define the port to listen on
// const PORT = process.env.PORT || 3000;

// // Create an HTTP server that responds to all requests
// const server = http.createServer((req, res) => {
//   res.writeHead(200, { "Content-Type": "text/plain" });
//   res.end("Docker container is running\n");
// });

// // Start the server and listen on the defined port
// server.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}/`);
// });
