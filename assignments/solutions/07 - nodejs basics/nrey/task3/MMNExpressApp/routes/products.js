var express = require('express');
var router = express.Router();

var products = [
{ "name": "ProductA", "price": 30, "id": "id_A" },
{ "name": "ProductB", "price": 50, "id": "id_B" },
{ "name": "ProductC", "price": 80, "id": "id_C" }];

/* GET home page. */
router.get('/', function(req, res, next) {
  var body = {"code":200, "products": products};
  res.json(body);
});

router.post('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
