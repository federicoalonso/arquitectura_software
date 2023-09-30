const Data = require("../data-access/dataSchema");
const {
  UnableToSaveDataException,
  UnableToRetrieveDataException,
  DateIsMissingException,
} = require("../exceptions/exceptions");
const { messageBinder } = require("../locale/locale-binder");
const { MongoClient } = require("mongodb");
const { dbConnectionString } = require("../config/config")();

async function saveToDatabase(data) {
  try {
    const newData = new Data(data);
    const savedData = await newData.save();
    return savedData;
  } catch (err) {
    console.error(err);
    throw new UnableToSaveDataException(messageBinder().UnableToSaveLog);
  }
}

async function retrieveAll() {
  try {
    const dbName = "svc_bitacora";
    const client = await MongoClient.connect(dbConnectionString, {
      useUnifiedTopology: true,
    });
    const db = client.db(dbName);
    const collection = db.collection("datas");
    const data = await collection.find().toArray();
    // Close the MongoDB client
    //client.close()
    return data;
  } catch (err) {
    throw new UnableToRetrieveDataException(messageBinder().UnableToRetrive);
  }
}

async function retrieveData(from, until) {
  if (from === undefined && until === undefined) {
    return retrieveAll();
  } else if (from !== undefined && until !== undefined) {
    return retrieveFromPeriod(from, until);
  } else {
    throw new DateIsMissingException(messageBinder().DateIsMissing);
  }
}

async function retrieveFromPeriod(from, until) {
  try {
    const dbName = "svc_bitacora";
    const client = await MongoClient.connect(dbConnectionString, {
      useUnifiedTopology: true,
    });
    const db = client.db(dbName);
    const collection = db.collection("datas");
    // Filter data based on dates
    const query = {
      producedOn: {
        $gte: new Date(from),
        $lte: new Date(until),
      },
    };
    const data = await collection.find(query).toArray();
    // Close the MongoDB client
    //client.close()
    return data;
  } catch (err) {
    throw new UnableToRetrieveDataException(messageBinder().UnableToRetrive);
  }
}

module.exports = {
  saveToDatabase,
  retrieveData,
};
