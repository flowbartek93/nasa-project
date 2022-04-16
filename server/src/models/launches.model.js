const axios = require("axios");
const launchesDb = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;

const launch = {
  flightNumber: 100, //flight_number
  mission: "Destory Tank", //name
  rocket: "Javelin", //rocket.name
  launchDate: new Date("December 2, 2049"), //date_local
  target: "Kiev", // not applicable
  customer: ["ZTM", "UAF"], //payload.cusotmers for each payload
  upcoming: true, //upcoming
  success: true //success
};

// launches.set(launch.flightNumber, launch);

saveLaunch(launch);

async function getAllLaunches(skip, limit) {
  return await launchesDb.find({}, { _id: 0, __v: 0 }).sort({ flightNumber: 1 }).skip(skip).limit(limit);
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({
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
  const planet = await planets.find({
    keplerName: launch.target
  });

  if (!planet) {
    throw new Error("No matching planet was found");
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["Zero to mastery", "NASA"],
    flightNumber: newFlightNumber
  });

  await saveLaunch(newLaunch);
}

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1
          }
        },
        {
          path: "payloads",
          select: {
            customers: 1
          }
        }
      ]
    }
  });

  if (response.status !== 200) {
    console.log("Problem downloading launch data");

    throw new Error("Launch data download failed");
  }

  const launchDocs = response.data.docs;

  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];

    const customers = payloads.flatMap(payload => {
      return payload["customers"];
    });

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers: customers
    };

    await saveLaunch(launch);
  }
}

async function findLaunch(filter) {
  return await launchesDb.findOne(filter);
}

async function loadLaunchData() {
  console.log("downloading data...");

  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat"
  });

  if (firstLaunch) {
    console.log("data already loaded");
    return;
  } else {
    await populateLaunches();
  }
}

module.exports = {
  getAllLaunches,
  existsLaunchWithId,
  scheduleNewLaunch,
  abortLaunchById,
  loadLaunchData
};
