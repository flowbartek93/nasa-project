const launchesDb = require("./launches.mongo");

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

// launches.set(launch.flightNumber, launch);

saveLaunch(launch);

async function getAllLaunches() {
  return await launchesDb.find({}, { _id: 0, __v: 0 });
}

function existsLaunchWithId(launchId) {
  return launches.has(launchId);
}

async function saveLaunch(launch) {
  await launchesDb.updateOne(
    {
      flightNumber: launch.flightNumber
    },
    launch,
    {
      upsert: true
    }
  );
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
