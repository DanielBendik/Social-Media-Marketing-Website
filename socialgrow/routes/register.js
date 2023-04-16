var express = require('express');
var router = express.Router();
const db = require('../db.js')


router.get('/', async function(req, res)
{
  if (req.session.auth > 0) return res.redirect("/dashboard")

  return res.render('register', {"success": true});
});

async function registerUser(email, password)
{
    const sql = await db.query('INSERT INTO users (email, password) VALUES (?, ?);', [email, password]);
    return sql;
}

async function checkEmail(email)
{
    const sql = await db.query('SELECT * FROM users WHERE email = ?;', [email]);
    return sql;
}

async function getUserId(email)
{
    const sql = await db.query('SELECT userId FROM users WHERE email = ?;', [email]);
    return sql;
}

router.post('/', async function(req, res) {

  var email = req.body.email;
  var password = req.body.password;
  var confirm = req.body.confirm;

  if (email.length < 6 || email.length > 255)  // a@a.io is 6 chars
  {
    return res.status(400).json({"status": "Email must be between 6 and 255 characters (inclusive)."});
  }

  if (password != confirm)
  {
    return res.status(400).json({"status": "Passwords do not match."})
  }

  if (password.length < 8 || password.length > 255)
  {
    return res.status(400).json({"status": "Password must be between 8 and 255 characters (inclusive)."});
  }

  var emailExists = await checkEmail(email);

  if (emailExists[0].length > 0)
  {
    return res.status(400).json({"status": "Email already exists."});
  }

  var registerResponse = await registerUser(email, password);
  var sessionGrab = await getUserId(email)

  req.session.auth = sessionGrab[0][0].userId;

  return res.status(200).json({"status": "Successfully registered!"});
})


module.exports = router;
