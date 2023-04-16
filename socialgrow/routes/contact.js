var express = require('express');
var router = express.Router();

router.get('/', async function(req, res) {

  return res.render('contact', {"success": true});
});



module.exports = router;
