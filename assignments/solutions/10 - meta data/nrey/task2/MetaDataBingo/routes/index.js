var express = require('express');
var path = require('path');
var router = express.Router();

/* GET home page. */
router.use('/', function(req,res){
  res.sendFile(path.resolve(__dirname, '../public/metadata-bingo.html'));
});

module.exports = router;
