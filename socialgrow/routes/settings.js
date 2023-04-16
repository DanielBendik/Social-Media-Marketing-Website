var express = require('express');
var router = express.Router();
const db = require('../db.js')


router.get('/', async function(req, res) {

  return res.render('settings', {"success": true});
});


// Email reset post request

async function updateEmail(newEmail, userIdentification)
{
    const sql = await db.query('UPDATE users SET email = ? WHERE userId = ?;', [newEmail, userIdentification]);
    return sql;
}

async function checkEmail(email)
{
    const sql = await db.query('SELECT * FROM users WHERE email = ?;', [email]);
    return sql;
}

router.post('/changeEmail', async function(req, res)
{

  var enteredEmail = req.body.email;
  var userID = req.session.auth;

  try {

      if (enteredEmail.length < 6 || enteredEmail.length > 255)  // a@a.io is 6 chars
      {
        return res.status(400).json({"status": "Email must be between 6 and 255 characters (inclusive)."});
      }

      var emailExists = await checkEmail(enteredEmail)
      if (emailExists.length > 0)
      {
        return res.status(400).json({"status": "Email already associated with another account."});
      }

      var upd = await updateEmail(enteredEmail, userID)
      return res.status(200).json({"status": "Email successfully updated."});

  } catch (e) {

    return res.status(400).json({"status": "Error changing email."});
  }

});


// Password reset post request

async function checkPassword(userID)
{
    const sql = await db.query('SELECT password FROM users WHERE userId = ?;', [userID]);
    return sql;
}

async function updatePassword(newPassword, userIdentification)
{
    const sql = await db.query('UPDATE users SET password = ? WHERE userId = ?;', [newPassword, userIdentification]);
    return sql;
}

router.post('/changePassword', async function(req, res) {

  var userID = req.session.auth;
  var currentPassword = req.body.currentPassword;
  var newPassword = req.body.newPassword;
  var newPasswordConfirm = req.body.newPasswordConfirm;

  try {

    var passwordOnFile = await checkPassword(userID);
    var enteredPassword = passwordOnFile[0].password;

    if (enteredPassword == currentPassword)
    {

      // Optional minimum length
      // if (newPassword.length < 8)
      // {
      //   return res.status(400).json({"status": "New password must be more than 8 characters."});
      // }

      if (currentPassword.length > 255)  // Shouldn't be possible in registration
      {
        return res.status(400).json({"status": "Stop trying to break the website."});
      }

      if (newPassword.length > 255)
      {
        return res.status(400).json({"status": "New password must be less than 256 characters."});
      }

      if (newPassword == newPasswordConfirm)
      {
        updatePassword(newPassword, userID)
        return res.status(200).json({"status": "Password successfully updated."});
      }
      else
      {
        return res.status(400).json({"status": "Passwords do not match."});
      }

    }
    else
    {
      return res.status(400).json({"status": "Wrong current password."});
    }

  } catch (e) {

    return res.status(400).json({"status": "Error changing password."});
  }

});



module.exports = router;
