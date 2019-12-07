const express = require("express");
const multer = require("multer");

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

const app = express();

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ file: req.file });
});

app.post("/multiple", upload.array("files"), (req, res) => {
  res.json({ files: req.files });
});

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

app.listen(8081, () => console.log("Running on localhost:8081"));
