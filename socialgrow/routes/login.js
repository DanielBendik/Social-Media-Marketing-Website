var express = require('express');
var router = express.Router();
const db = require('../db.js')


router.get('/', async function(req, res)
{
  if (req.session.auth > 0) return res.redirect("/dashboard")

  return res.render('login', {"success": true});
});

async function checkLogin(email, password)
{
    const sql = await db.query('SELECT * FROM users WHERE email = ? AND password = ?;', [email, password]);
    return sql;
}

router.post('/', async function(req, res)
{
  var email = req.body.email;
  var password = req.body.password;

  var loginValid = await checkLogin(email, password);

  if (email.length < 6 || email.length > 255)  // a@a.io is 6 chars
  {
    return res.status(400).json({"status": "Email must be between 6 and 255 characters (inclusive)."});
  }

  if (password.length < 8 || password.length > 255)
  {
    return res.status(400).json({"status": "Password must be between 8 and 255 characters (inclusive)."});
  }

  if (loginValid.length > 0)
  {
    req.session.auth = loginValid[0][0].userId;

    return res.status(200).json({"status": "This is a valid login."});
  }
  else
  {
    return res.status(400).json({"status": "Login combination does not exist."});
  }
})


module.exports = router;
