// const launches = require("./launches.mongo");

const launches = new Map();

let latestFlightNumber = 100;

const launch = {
  flightNumber: 100,
  mission: "Destory Tank",
  rocket: "Javelin",
  launchDate: new Date("December 2, 2049"),
  destination: "Kiev",
  customer: ["ZTM", "UAF"],
  upcoming: true,
  success: true
};

launches.set(launch.flightNumber, launch);

function getAllLaunches() {
  return Array.from(launches.values());
}

function addNewLaunch(launch) {
  latestFlightNumber++;
  launches.set(
    latestFlightNumber,
    Object.assign(launch, {
      success: true,
      upcoming: true,
      customers: ["ztm", "NASA"],
      flightNumber: latestFlightNumber
    })
  );
}

module.exports = {
  getAllLaunches,
  addNewLaunch
};
