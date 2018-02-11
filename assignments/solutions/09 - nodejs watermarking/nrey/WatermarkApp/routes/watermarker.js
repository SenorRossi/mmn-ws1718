/**
 * Created by Tobi on 17.12.2016.
 */

var express = require('express');
var router = express.Router();
var path = require('path');
var Jimp = require('jimp');
var fs = require('fs');
var glob = require("glob");
const uuidv1 = require('uuid/v1');

var watermarkedImagesDirectory = path.join(__dirname, '../watermarks');
var publicImagesDirectory = '../public/images';

var watermark; // holds the Jimp image
var watermarkPath = path.join(__dirname, '../public/images/watermark.png');

// first, make sure that the directory exists.
if (!fs.existsSync(watermarkedImagesDirectory)) {
  fs.mkdirSync(watermarkedImagesDirectory);
}


Jimp.read(watermarkPath, function (err, img) {
  watermark = img;

  router.use('/images/all', function(req,res,next){
    console.log('entered all route');

    glob(path.join(__dirname, '../public/images/*.jpg'), function (er, files) {
      console.log('entered glob function');
      // files is an array of filenames.
      // If the `nonull` option is set, and nothing
      // was found, then files is ["**/*.js"]
      // er is an error object or null.
      files.forEach(file => {
        console.log(file);
        var imagePath = file;
        var markedPath = path.join(watermarkedImagesDirectory, 'wm-' + path.basename(file));

        var imageWrittenCallback = function () {
          console.log(file);
        };

        var imageCompositedCallback = function (err, img) {
          if (err) throw err;
          img.write(markedPath, imageWrittenCallback);
        };

        if (fs.existsSync(imagePath)) {
          console.log('image ' + imagePath + ' exists');

          Jimp.read(imagePath, function (err, img) {
            if (err) throw err;
            var x = img.bitmap.width/2 - watermark.bitmap.width/2, y = img.bitmap.height/2 - watermark.bitmap.height/2;
            img.composite(watermark, x, y, imageCompositedCallback)
          });
        } else {
          console.log(imagePath + ' does not exist');
          // don't send the response, just pass it through
          next();
        }
      });
    });
    res.send('done');
  });

  // you actually can register routes within *callbacks*
  router.use('/images/:image', function (req, res, next) {
    var imagePath = path.join(__dirname, publicImagesDirectory, req.params.image);
    var markedPath = path.join(watermarkedImagesDirectory, 'wm-' + req.params.image);

    var imageWrittenCallback = function () {
      res.sendFile(markedPath);
    };

    var imageCompositedCallback = function (err, img) {
      if (err) throw err;
      img.write(markedPath, imageWrittenCallback);
    };

    if (fs.existsSync(imagePath)) {
      console.log('image ' + imagePath + ' exists');

      Jimp.read(imagePath, function (err, img) {
        if (err) throw err;
        var x = img.bitmap.width/2 - watermark.bitmap.width/2, y = img.bitmap.height/2 - watermark.bitmap.height/2;
        img.composite(watermark, x, y, imageCompositedCallback)
      });
    } else {
      console.log(imagePath + ' does not exist');
      // don't send the response, just pass it through
      next();
    }
  });

  router.use('/watermarked', function (req, res, next) {
    var imagePath;
    if(req && req.query && req.query.url){
      imagePath = req.query.url;
      console.log(imagePath);
    } else {
      res.sendFile(path.join(__dirname, publicImagesDirectory, 'sorry.png'));
    }

    var markedPath = path.join(watermarkedImagesDirectory, uuidv1() + ".jpg");

    var imageWrittenCallback = function () {
      res.sendFile(markedPath);
    };

    var imageCompositedCallback = function (err, img) {
      if (err) throw err;
      img.write(markedPath, imageWrittenCallback);
    };

    Jimp.read(imagePath, function (err, img) {
      if (err || typeof img === 'undefined'){
        res.sendFile(path.join(__dirname, publicImagesDirectory, 'sorry.png'));
      } else {
        var x = img.bitmap.width/2 - watermark.bitmap.width/2, y = img.bitmap.height/2 - watermark.bitmap.height/2;
        img.composite(watermark, x, y, imageCompositedCallback);
      }
    });
  });
});

module.exports = router;
