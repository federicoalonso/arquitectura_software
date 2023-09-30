const Data = require("../data-access/dataSchema");
const {
  UnableToSaveDataException,
  UnableToRetrieveDataException,
  DateIsMissingException,
} = require("../exceptions/exceptions");
const { messageBinder } = require("../locale/locale-binder");
const Redis = require("ioredis");
const redis = new Redis();

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

async function retrieveByURL(url) {
  try {
    // rmove the firs http: and the :port
    url = url.replace(/:[0-9]+/, "");
    const data = await redis.hgetall(url);

    // Si el objeto está vacío, devolvemos null
    if (Object.keys(data).length === 0) {
      return await crearDesdeBDConUrl(url);
    }

    // Convertimos la concurrencia de string a array
    data.concurrencia = JSON.parse(data.concurrencia);

    return data;
  } catch (err) {
    console.error(err);
    throw new UnableToRetrieveDataException(messageBinder().UnableToRetrive);
  }
}

const crearDesdeBDConUrl = async (url) => {
  const logs = await Data.find({ level: "statistics", url: url });
  const concurrencia = new Array(24 * 60).fill(0);
  const cantidad_de_reproducciones = logs.length;
  let tiempo_total = 0;
  let tiempo_maximo = 0;
  let tiempo_minimo = 0;
  let tiempo_promedio = 0;
  for (let j = 0; j < logs.length; j++) {
    const log = logs[j];
    const minuteOfDay =
      moment(log.timestamp).hours() * 60 + moment(log.timestamp).minutes();
    concurrencia[minuteOfDay]++;
    tiempo_total += log.duration;
    if (log.duration > tiempo_maximo) {
      tiempo_maximo = log.duration;
    }
    if (tiempo_minimo == 0 || log.duration < tiempo_minimo) {
      tiempo_minimo = log.duration;
    }
  }
  tiempo_promedio = tiempo_total / cantidad_de_reproducciones;
  let maximo_concurrencia = Math.max(...concurrencia);

  return {
    bloqueo: "0",
    concurrencia_maxima: maximo_concurrencia,
    tiempo_promedio: tiempo_promedio,
    tiempo_maximo: tiempo_maximo,
    tiempo_minimo: tiempo_minimo,
    tiempo_total: tiempo_total,
    cantidad_de_reproducciones: cantidad_de_reproducciones,
    concurrencia: JSON.stringify(concurrencia),
  };
};

async function retrieveEmailDataByEvent(id) {
  try {
    const data = await Data.aggregate([
      {
        $match: {
          service: "svc_email",
          message: `${id}`,
        },
      },
      {
        $group: {
          _id: "$level",
          count: { $sum: 1 },
        },
      },
    ]);

    // Transformamos los datos en un formato más útil
    const result = {};
    data.forEach((item) => {
      result[item._id] = item.count;
    });

    return result;
  } catch (err) {
    console.error(err);
    throw new UnableToRetrieveDataException(messageBinder().UnableToRetrive);
  }
}

async function retrieveAuthLevelDataByTime(from, to) {
  try {
    if (from === undefined && to === undefined) {
      return retrieveFAllAuth();
    } else if (from !== undefined && to !== undefined) {
      return retrieveFromPeriod(from, to);
    } else {
      throw new DateIsMissingException(messageBinder().DateIsMissing);
    }
  } catch (err) {
    console.error(err);
    throw new UnableToRetrieveDataException(messageBinder().UnableToRetrive);
  }
}

async function retrieveFromPeriod(from, until) {
  try {
    const logs = await Data.find({
      level: "auth",
      timestamp: { $gte: from, $lte: until },
    });
    return logs;
  } catch (err) {
    throw new UnableToRetrieveDataException(messageBinder().UnableToRetrive);
  }
}

async function retrieveFAllAuth() {
  try {
    const logs = await Data.find({ level: "auth" });
    return logs;
  } catch (err) {
    throw new UnableToRetrieveDataException(messageBinder().UnableToRetrive);
  }
}

module.exports = {
  saveToDatabase,
  retrieveByURL,
  retrieveEmailDataByEvent,
  retrieveAuthLevelDataByTime,
};
