const http = require("http");
const mongoose = require("mongoose");

const app = require("./app");

const { loadPlanetsData } = require("./models/planets.model");

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

mongoose.connection.once("open", () => {
  console.log("MongoDB conntection ready");
});

mongoose.connection.on("error", err => {
  console.error(err);
});

const MONGO_URL = "mongodb+srv://bartekbjj:Ostry1234@nasacluster.2u7ec.mongodb.net/nasa?retryWrites=true&w=majority";

async function startServer() {
  await mongoose.connect(MONGO_URL);

  await loadPlanetsData();

  server.listen(PORT, () => {
    console.log(`Listen on ${PORT}...`);
  });
}

startServer();
