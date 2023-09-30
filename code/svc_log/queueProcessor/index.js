const { queue } = require("../queues/queue-binder");
const { logger, logByLevel } = require("../logger/index");
const { logQueue } = require("../config/config");
const processQueue = queue(logQueue || "logQueue");
const Data = require("../data-access/dataSchema");
const { messageBinder } = require("../locale/locale-binder");
const { saveToDatabase } = require("../data-access-middleware/middlewareDB");
const Redis = require("ioredis");
const redis = new Redis();
const moment = require("moment");

async function processLog(job, done) {
  try {
    let jsonData = job.data;
    const newData = new Data(jsonData);
    logByLevel(newData);
    await saveToDatabase(newData);
    if (newData.level === "statistics") {
      // if url contains compra, we cut the url to get everything but whats after the last /
      if (newData.url.includes("compra")) {
        newData.url = newData.url.substring(0, newData.url.lastIndexOf("/"));
      }
      actualizarEstadisticas(newData);
    }
    setTimeout(done, 0);
  } catch (error) {
    logger.error(`${messageBinder().LogProcessFail} ${error}`);
    done(error);
  }
}

async function actualizarEstadisticas(logObj) {
  const url = logObj.url;
  const duracion = logObj.duration;
  const timestamp = logObj.timestamp;

  const bloqueo = await redis.hget(url, "bloqueo");

  if (bloqueo === null) {
    await redis.hmset(url, {
      bloqueo: "1",
      concurrencia_maxima: "0",
      tiempo_promedio: "0",
      tiempo_maximo: "0",
      tiempo_minimo: "0",
      tiempo_total: "0",
      cantidad_de_reproducciones: "0",
      concurrencia: JSON.stringify(new Array(24 * 60).fill(0)),
    });

    // Como es la primera vez, actualizamos el objeto y lo desbloqueamos
    actualizarObjeto(url, duracion, timestamp);
  } else if (bloqueo == "1") {
    console.log("El objeto está bloqueado. Reintentando...");
    setTimeout(() => actualizarEstadisticas(logObj), 10);
  } else {
    await redis.hset(url, "bloqueo", "1");
    actualizarObjeto(url, duracion, timestamp);
  }
}

async function actualizarObjeto(url, duracion, timestamp) {
  const minuteOfDay =
    moment(timestamp).hours() * 60 + moment(timestamp).minutes();

  const concurrencia = JSON.parse(await redis.hget(url, "concurrencia"));

  concurrencia[minuteOfDay]++;

  const concurrencia_min = concurrencia[minuteOfDay];

  await redis
    .pipeline()
    .hincrby(url, "cantidad_de_reproducciones", 1)
    .hincrby(url, "tiempo_total", duracion)
    .hget(url, "tiempo_maximo")
    .hget(url, "tiempo_minimo")
    .hget(url, "concurrencia_maxima")
    .exec(async (err, results) => {
      const [
        cantidad_de_reproducciones,
        tiempo_total,
        tiempo_maximo,
        tiempo_minimo,
        concurrencia_maxima,
      ] = results;
      const t_max = tiempo_maximo[1];
      const t_min = tiempo_minimo[1];
      const t_prom = tiempo_total[1] / cantidad_de_reproducciones[1];
      const c_max = concurrencia_maxima[1];

      if (duracion > t_max) {
        await redis.hset(url, "tiempo_maximo", duracion);
      }

      if (!t_min == 0 || duracion < t_min) {
        await redis.hset(url, "tiempo_minimo", duracion);
      }

      await redis.hset(url, "tiempo_promedio", t_prom);

      if (concurrencia_min > c_max) {
        await redis.hset(url, "concurrencia_maxima", concurrencia_min);
      }

      await redis.hset(url, "concurrencia", JSON.stringify(concurrencia));

      // Desbloquea el objeto
      await redis.hset(url, "bloqueo", "0");
    });
}

const crearDesdeBD = async () => {
  const urls = await Data.find({ level: "statistics" }).distinct("url");
  for (let i = 0; i < urls.length; i++) {
    const bloqueo = await redis.hget(urls[i], "bloqueo");
    if (bloqueo === null) {
      const obj = await crearDesdeBDConUrl(urls[i]);
      await redis.hmset(urls[i], obj);
    }
  }
};

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

module.exports = {
  start: () => {
    logger.info("Starting log service");
    crearDesdeBD();
    processQueue.process(processLog);
  },
  stop: () => {
    logger.info("Stopping log service");
    processQueue.close();
  },
  crearDesdeBDConUrl: crearDesdeBDConUrl,
};
