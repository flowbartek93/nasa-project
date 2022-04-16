const http = require("http");
const mongoose = require("mongoose");
require("dotenv").config();
const app = require("./app");

const { loadPlanetsData } = require("./models/planets.model");
const { loadLaunchData } = require("./models/launches.model");

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

mongoose.connection.once("open", () => {
  console.log("MongoDB conntection ready");
});

mongoose.connection.on("error", err => {
  console.error(err);
});

const MONGO_URL = process.env.MONGO_URL;

async function startServer() {
  await mongoose.connect(MONGO_URL);

  await loadPlanetsData();

  await loadLaunchData();

  server.listen(PORT, () => {
    console.log(`Listen on ${PORT}...`);
  });
}

startServer();
