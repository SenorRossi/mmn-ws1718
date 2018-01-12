var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.use('/', express.static(path.join(__dirname, '../spotifysearch')));

module.exports = router;
