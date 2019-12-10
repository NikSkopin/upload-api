const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const app = express();
app.use("/static", express.static(path.join(__dirname, "static")));

const fileFilter = function(req, file, cb) {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error("Wrong file type");
    error.code = "LIMIT_FILE_TYPES";
    return cb(error, false);
  }

  cb(null, true);
};

const MAX_SIZE = 200000;
const upload = multer({
  dest: "./uploads/",
  fileFilter,
  limits: {
    fileSize: MAX_SIZE
  }
});

app.post("/upload", upload.array("files"), (req, res) => {
  // req.files.map(file => {
  //   sharp(file.path)
  //     .resize(300)
  //     .background("white")
  //     // .embed()
  //     .toFile(`./static/${file.originalname}`, function(err) {
  //       console.log(err);
  //     });

  // fs.unlink(file.path);
  res.json({ files: req.files });
  // });
});

// } catch (error) {
//   res.status(422).json({ error });
// }

app.use(function(err, req, res, next) {
  if (err.code === "LIMIT_FILE_TYPES") {
    res.status(422).json({ error: "Only images are allowed" });
    return;
  } else if (err.code === "LIMIT_FILE_SIZE") {
    res
      .status(422)
      .json({ error: `Too large. Max size is ${MAX_SIZE / 1000} Kb` });
    return;
  }
});

// app.listen(8081, () => console.log("Running on localhost:8081"));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(__dirname + "/public/"));

  app.get(/.*/, (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
  });
}

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8081;
}
app.listen(port);
