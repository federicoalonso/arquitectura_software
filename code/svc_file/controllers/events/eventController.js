const multer = require("multer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const {
  HttpErrorCodes,
  evalException,
} = require("../../exceptions/exceptions");
const uploadServiceProvider = require("../../services/uploads/uploadServiceProvider");
const { webServer, domain, authUrl } = require("../../conf/config")();
const jwt_decode = require("jwt-decode");

var eventLogic;

const startEventsRoutes = async function startEventsRoutes(router, logic) {
  eventLogic = logic;

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      // Generate a random number between 001 and 999
      const randomNumber = Math.floor(Math.random() * 999) + 1;
      const formattedNumber = String(randomNumber).padStart(3, "0");

      cb(null, Date.now() + "-" + formattedNumber + "-" + file.originalname);
    },
  });

  const upload = multer({ storage: storage });

  let videoData = {};

  router.use(async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const permissions = ["proveedor", "user"];

      if (!token) {
        return res.status(403).send("Forbidden");
      }

      const userCan = await axios({
        method: "post",
        url: `${authUrl}`,
        data: {
          token: token,
        },
      });

      let can = false;
      permissions.forEach((element) => {
        if (userCan.data.role === element) {
          can = true;
        }
      });

      if (!can) {
        return res.status(403).send("Forbidden");
      }

      if (userCan.data.role === "proveedor") {
        const event_id = parseInt(req.originalUrl.match(/\d+/)[0]);
        const isProviderFromEvent = await eventLogic.checkProviderEvent(
          event_id,
          userCan.data.email
        );
        if (!isProviderFromEvent) {
          return res
            .status(HttpErrorCodes.ERROR_403_FORBIDDEN)
            .send("Forbidden");
        }
      }

      next();
    } catch (error) {
      if (error.response) {
        if (error.response.data === "El token ha expirado") {
          return res.status(403).send("El token ha expirado");
        } else {
          return res.status(error.response.status).send(error.response.data);
        }
      } else {
        return evalException(error, res);
      }
    }
  });

  router.get(webServer.routes.viewVideo, async (req, res) => {
    try {
      const token = req.headers.authorization;
      const { email } = jwt_decode(token);
      const fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
      const userCan = await eventLogic.chekUserPayEvent(fullUrl, email);
      if (!userCan) {
        return res.status(HttpErrorCodes.ERROR_403_FORBIDDEN).send("Forbidden");
      }
      const videoName = req.params.videoName;
      const videoPath = path.join(__dirname, "../../uploads/", videoName);
      if (!videoData[videoName]) {
        videoData[videoName] = {
          viewers: 0,
        };
      }
      videoData[videoName].viewers++;
      console.log(videoData);

      fs.stat(videoPath, (err, stats) => {
        if (err) {
          console.log(err);
          return evalException(err, res);
        }

        const range = req.headers.range;
        if (!range) {
          const videoStream = fs.createReadStream(videoPath);
          res.writeHead(200, {
            "Content-Length": stats.size,
            "Content-Type": "video/mp4",
          });
          videoStream.pipe(res);
          return;
        }
        const positions = range.replace(/bytes=/, "").split("-");
        const start = parseInt(positions[0], 10);
        const total = stats.size;
        const end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        const chunksize = end - start + 1;

        if (start >= total || end < start) {
          res.writeHead(416, {
            "Content-Range": `bytes */${total}`,
          });
          return res.end();
        }

        res.writeHead(206, {
          "Content-Range": "bytes " + start + "-" + end + "/" + total,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": "video/mp4",
        });

        const stream = fs.createReadStream(videoPath, { start, end });
        stream.on("open", () => {
          stream.pipe(res);
        });
        stream.on("error", (err) => {
          res.end(err);
        });
      });
    } catch (e) {
      console.log(e.data);
      return evalException(e, res);
    }
  });

  router.get(webServer.routes.viewImage, async (req, res) => {
    const token = req.headers.authorization;
    const { email } = jwt_decode(token);
    const fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
    const userCan = await eventLogic.chekUserPayEvent(fullUrl, email);
    if (!userCan) {
      return res.status(HttpErrorCodes.ERROR_403_FORBIDDEN).send("Forbidden");
    }

    const imageName = req.params.imageName;
    const imagePath = path.join(__dirname, "../../uploads/", imageName);

    res.sendFile(imagePath, (err) => {
      if (err) {
        console.log(err);
        res.status(404).send("Image not found");
      }
    });
  });

  router.post(
    webServer.routes.uploadFiles,
    upload.fields([
      { name: "video", maxCount: 1 },
      { name: "imageMin", maxCount: 1 },
      { name: "imagePrin", maxCount: 1 },
    ]),
    async (req, res) => {
      const uploadService = uploadServiceProvider.getUploadService();
      let targetPathVideo, targetPathImageMin, targetPathImagePrin;
      let event_id = req.params.event_id;
      if (!event_id) {
        return evalException(new Error("Event id is required"), res);
      }

      try {
        const videoFile = req.files.video[0];
        const imageMinFile = req.files.imageMin[0];
        const imagePrinFile = req.files.imagePrin[0];

        targetPathVideo = await uploadService.save(videoFile);
        targetPathImageMin = await uploadService.save(imageMinFile);
        targetPathImagePrin = await uploadService.save(imagePrinFile);

        const videoPath = targetPathVideo.split("svc_file/uploads/");
        const videoName = videoPath[1];
        const videoUrl =
          domain +
          ":" +
          webServer.port +
          webServer.baseUrl +
          "/video/" +
          videoName;
        const imageMinPath = targetPathImageMin.split("svc_file/uploads/");
        const imageMinName = imageMinPath[1];
        const imageMinUrl =
          domain +
          ":" +
          webServer.port +
          webServer.baseUrl +
          "/image/" +
          imageMinName;
        const imagePrinPath = targetPathImagePrin.split("svc_file/uploads/");
        const imagePrinName = imagePrinPath[1];
        const imagePrinUrl =
          domain +
          ":" +
          webServer.port +
          webServer.baseUrl +
          "/image/" +
          imagePrinName;

        let eventToUpdate = await eventLogic.getEvent(parseInt(event_id));

        let updatedRecord = await eventLogic.update(parseInt(event_id), {
          nombre: eventToUpdate.nombre,
          descripcion: eventToUpdate.descripcion,
          f_inicio: eventToUpdate.f_inicio,
          f_fin: eventToUpdate.f_fin,
          imagen_min_url: imageMinUrl,
          imagen_prin_url: imagePrinUrl,
          video_url: videoUrl,
          video_size: videoFile.size,
          categoria: eventToUpdate.categoria,
          proveedor_email: eventToUpdate.proveedor_email,
          tipo_aut: eventToUpdate.tipo_aut,
          autorizado: eventToUpdate.autorizado,
          evento_url: eventToUpdate.evento_url,
        });

        res.json({ updatedRecord });
      } catch (err) {
        console.log(
          `[service: eventController] [function: startEventsRoutes] [type:E] ${err}`
        );
        await uploadService.delete(targetPathVideo);
        await uploadService.delete(targetPathImageMin);
        await uploadService.delete(targetPathImagePrin);

        return evalException(err, res);
      }
    }
  );
};

module.exports = {
  startEventsRoutes,
};
