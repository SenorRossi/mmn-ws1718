/**
 * Created by Tobi on 19/12/2016.
 */
var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');

// TODO make sure the dependencies already exist --> npm install --save stegosaurus uuid
var stego = require('stegosaurus');
var uuid = require('uuid');

// TODO set the correct directory (static) for the stegano module that you have to create first.
// put an index.html in there. (see skeleton)
var steganoDir = path.join(__dirname, '../stegano');
var secretImagesDir = path.join(steganoDir, 'watermarked');

// change this to anything you like. make sure the image exists and is a PNG!
var hostImage = path.join(__dirname, '../public/images/', 'merry-x-mas.png');


// make sure the folder exists.
if (!fs.existsSync(secretImagesDir)) {
  fs.mkdirSync(secretImagesDir);
}

// serves the content (index.html and watermarked images)
router.use(express.static(steganoDir));

// hides or seeks the secret messages.
router.use('/:method', function(req, res, next) {
  /**
   * generates a valid path for the image that contains the message.
   *
   * @param id of the image. Either created or read from the request.
   */
  console.log('incoming request', req.params.method);
  var id;
  var size;

  function makeImagePath(id) {
    var name = '/' + id + '.png';
    return secretImagesDir + name;
  }

  // what do we want to do?
  // hide --> encode
  if(req.params.method == 'hide') {
    // required parameter: message. Either as GET query or POST parameter.
    id = uuid.v1();
    var path = makeImagePath(id);
    var message = req.body.message? req.body.message : null;
    size = message.length;
    stego.encodeString(hostImage,path,message,function(err){
      if (err) {
        throw err;
      }
      console.log("Wrote png to: ",path);
      var responseJson = {
        id: id,
        path: path,
        size: size
      };
      res.send(JSON.stringify(responseJson));
    });
  }
  // seek --> decode the image.
  else if(req.params.method == 'seek') {
    // the mandatory parameter is the id of the image.
    console.log('seeking image');
    id = req.query.id;
    size = req.query.size;
    stego.decode(makeImagePath(id),size,function(payload){
      console.log("Decoded message: ",payload);
      var responseJson = {
        status: 'successfully decoded message',
        message: payload
      };
      res.send(JSON.stringify(responseJson));
    });
  } else {
    // method did not match anything that we can handle.
    next();
  }
});

module.exports = router;
