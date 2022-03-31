const launchesDb = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;

const launch = {
  flightNumber: 100,
  mission: "Destory Tank",
  rocket: "Javelin",
  launchDate: new Date("December 2, 2049"),
  target: "Kiev",
  customer: ["ZTM", "UAF"],
  upcoming: true,
  success: true
};

// launches.set(launch.flightNumber, launch);

saveLaunch(launch);

async function getAllLaunches() {
  return await launchesDb.find({}, { _id: 0, __v: 0 });
}

async function existsLaunchWithId(launchId) {
  return await launchesDb.findOne({
    flightNumber: launchId
  });
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDb.findOne({}).sort("-flightNumber");

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}

async function abortLaunchById(launchId) {
  const aborted = await launchesDb.UpdateOne(
    {
      flightNumber: launchId
    },
    {
      upcoming: false,
      success: false
    }
  );

  return aborted.modifiedCount === 1;
}

async function saveLaunch(launch) {
  const planet = await planets.find({
    keplerName: launch.target
  });

  if (!planet) {
    throw new Error("No matching planet was found");
  }

  await launchesDb.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber
    },
    launch,
    {
      upsert: true
    }
  );
}

async function scheduleNewLaunch(launch) {
  const newFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["Zero to mastery", "NASA"],
    flightNumber: newFlightNumber
  });

  await saveLaunch(newLaunch);
}

// function addNewLaunch(launch) {
//   latestFlightNumber++;
//   launches.set(
//     latestFlightNumber,
//     Object.assign(launch, {
//       success: true,
//       upcoming: true,
//       customers: ["ztm", "NASA"],
//       flightNumber: latestFlightNumber,
//     })
//   );
// }

module.exports = {
  getAllLaunches,
  existsLaunchWithId,
  scheduleNewLaunch,
  abortLaunchById
};
