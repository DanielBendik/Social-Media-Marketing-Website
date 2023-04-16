const express = require('express');
const session = require('express-session');
var router = express.Router();

router.get('/', async function(req, res) {
  var userId = req.session.auth;
  console.log(req.session.auth);
  return res.render('home', {"passedUserID": userId});
});

router.get('/logout', async function(req, res) {
  req.session.auth = undefined;
  return res.redirect('/');
});

module.exports = router;
