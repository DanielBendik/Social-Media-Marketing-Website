var express = require('express');
// const session = require('express-session');
var router = express.Router();

router.get('/', async function(req, res) {
  console.log(req.session.auth);
  return res.render('faq', {"success": true});
});

module.exports = router;
