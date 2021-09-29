const express = require("express");
var router = express.Router();
const Logo = require("../../controller/design/Logo");
const Auth = require("../../middleware/Auth");

const multer = require('multer');
const path = require('path');

// SET STORAGE Upload Logo
var storageLogo = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/upload/logo')
    },
    filename: function (req, file, cb) {
      
      cb(null, 'logo-'+req.body.kod_logo+'-'+ Date.now()+path.extname(file.originalname))
    }
  })
  
var upload = multer({
    storage: storageLogo,
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
  


router.post('/design/logo/create', Auth.verifyToken,upload.single('filepicture'),  Logo.create);
router.post('/design/logo/list',  Auth.verifyToken, Logo.getList);
router.get('/design/logo/details/:id',  Auth.verifyToken, Logo.getDetails);



module.exports = router;