const express = require('express');
const router = express.Router();
const services = require('../services');
const path = require('path');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "../uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});
const uploadDisk = multer({ storage: storage });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'CEP to Latitude and Longitude' });
});

router.post('/upload', uploadDisk.any(), function(req, res, next) {
  var ceps = req.files[0];
  services.convert_csv_with_cep_to_latitude_longitude(ceps, (result) => {
    console.log(result);
    return res.sendFile(path.join(process.cwd(), result));
  });
});

module.exports = router;
