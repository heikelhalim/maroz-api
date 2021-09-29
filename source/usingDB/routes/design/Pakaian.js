const express = require("express");
var router = express.Router();
const Pakaian = require("../../controller/design/Pakaian");
const Auth = require("../../middleware/Auth");

const multer = require('multer');
const path = require('path');

// SET STORAGE Upload Pakaian
var storagePakaian = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/upload/pakaian')
    },
    filename: function (req, file, cb) {
      
      cb(null, 'pkn-'+req.body.kod_design+'-'+ Date.now()+path.extname(file.originalname))
    }
  })
  
var upload = multer({
    storage: storagePakaian,
    limits: { fieldSize: 10 * 1024 * 1024 }, //10MB
  
    fileFilter: (req, file, cb) => {
      if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/gif") {
          cb(null, true);
      } else {
          cb(null, false);
          return cb(new Error('Allowed only .png, .jpg, .jpeg and .gif'));
      }
  }
});
  


router.post('/design/pakaian/create',Auth.verifyToken,upload.single('filepicture'),  Pakaian.create);
router.post('/design/pakaian/list', Auth.verifyToken, Pakaian.getList);
router.get('/design/pakaian/details/:id', Auth.verifyToken, Pakaian.getDetails);



module.exports = router;