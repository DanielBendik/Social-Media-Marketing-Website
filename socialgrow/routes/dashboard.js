var Express = require('express');
var Webhook = require('coinbase-commerce-node').Webhook;
var webhookSecret = '929fd814-178f-4c18-afcb-aada5534e30b';

var router = Express.Router();
const db = require('../db.js')
const axios = require('axios').default;
var app = Express();

// Main page

async function checkBalance(userID)
{
    const sql = await db.query('SELECT balance FROM users WHERE userId = ?;', [userID]);
    return sql;
}

async function grabOrders(userID)
{
    const sql = await db.query('SELECT * FROM orders WHERE userIdOrder = ?;', [userID]);
    return sql;
}

router.get('/', async function(req, res) {

  try {
    var userID = req.session.auth;

    var bal = await checkBalance(userID);

    if (bal[0][0].balance % 1 == 0)
    {
      var dbalance = bal[0][0].balance + ".00";
    }
    else
    {
      var dbalance = bal[0][0].balance;
    }

    var orderGet = await grabOrders(userID);
    return res.render('dashboard', {"balance": dbalance, "orderGet": orderGet});
  }
  catch (e)
  {
    console.log(e);
    return res.redirect('/');
  }

});


// Orders endpoint

async function addOrder(userId, username, quantity, charge, status)
{
    const sql = await db.query('INSERT INTO orders (userIdOrder, igUsername, quantity, charge, orderStatus) VALUES (?, ?, ?, ?, ?);', [userId, username, quantity, charge, status]);
    return sql;
}

async function checkEmail(userID)
{
    const sql = await db.query('SELECT email FROM users WHERE userId = ?;', [userID]);
    return sql;
}

async function increaseBalance(bal, userID)
{
    const sql = await db.query('UPDATE users SET balance = balance + ? WHERE userId = ?;', [bal, userID]);
    return sql;
}

router.post('/order', async function(req, res)
{

  var grabbedUserID = req.session.auth;                  // Get user session id
  var enteredUsername = req.body.instaUsername;          // Post req username
  var enteredQuantity = req.body.quantity;               // Post req quantity
  var grabbedCharge = (enteredQuantity / 100);           // Get charge
  var grabbedOrderStatus = "Processing";

  console.log("UserId: " + grabbedUserID);
  console.log("Username: " + enteredUsername);
  console.log("Quantity: " + enteredQuantity);
  console.log("Charge: " + grabbedCharge);
  console.log("Status: " + grabbedOrderStatus);

  try {

    if (enteredUsername.length < 1 || enteredUsername.length > 30)
    {
      return res.status(400).json({"status": "Username must be between 1 and 30 characters (inclusive)."});
    }

    if (enteredQuantity < 100 || enteredQuantity > 100000)
    {
      return res.status(400).json({"status": "Quantity must be between 100 and 100,000 (inclusive)."});
    }

    const orderAdd = await addOrder(grabbedUserID, enteredUsername, enteredQuantity, grabbedCharge, grabbedOrderStatus)
    return res.status(200).json({"status": "Order submitted."});

  } catch (e) {

    return res.status(400).json({"status": "Error placing order."});
  }

});

router.post('/addBalance', async function(req, res)         // This is on our end
{

  var grabbedUserID = req.session.auth;      // Current user
  var enteredAmount = req.body.addAmount;    // User enters amount they want to add to their balance

  try
  {
    const grabbedEmail = await checkEmail(grabbedUserID)    // Email grabbed from database

    if (isNaN(enteredAmount))                               // If someone enters text...
    {
      return res.status(400).json({"status": "Amount must be a simple number. (1, 100, 50.5...)"});
    }

    if (enteredAmount < 1 || enteredAmount > 50000)         // Min and max values to add to balance, catches empty field
    {
      return res.status(400).json({"status": "Amount must be between $1 and $50,000 (inclusive)."});
    }

    const objData = {
       "name": "Social Grow - Order",
       "description": "Grow your media today!",
       "local_price": {
         "amount": enteredAmount,
         "currency": "USD"
       },
       "pricing_type": "fixed_price",
       "metadata": {
         "customer_id": grabbedUserID,
         "customer_email": grabbedEmail
       },
       "redirect_url": "https://socialgrow.herokuapp.com/dashboard",
       "cancel_url": "https://socialgrow.herokuapp.com/dashboard"
    }

    let config = {
       headers: {
         "Content-Type": "application/json",
         "X-CC-Api-Key":"2fbd0ff9-77a0-4f6c-8365-6b770b3d499a",
         "X-CC-Version": "2018-03-22"
       }
     }

    const createCharge = await axios.post("https://api.commerce.coinbase.com/charges", objData, config);

    console.log(createCharge.data.data.code)

    return res.status(200).json({"code": createCharge.data.data.code});

  } catch (e) {
    console.log(e);
    return res.status(400).json({"status": "Error adding balance."});
  }

});




function rawBody(req, res, next) {
	req.setEncoding('utf8');

	var data = '';

	req.on('data', function (chunk) {
		data += chunk;
	});

	req.on('end', function () {
		req.rawBody = data;

		next();
	});
}

router.post('/webhook', function (request, response) {
	var event;

  console.log("This doesn't even show up");
	console.log(request.headers);

	try {
		event = Webhook.verifyEventBody(
			request.rawBody,
			request.headers['X-CC-Webhook-Signature'],
			webhookSecret
		);
	} catch (error) {
		console.log('Error occured', error.message);

		return response.status(400).send('Webhook Error:' + error.message);
	}

	console.log(request.body);

	return response.status(200).send('Signed Webhook Received: ' + event.id);
});

app.use(rawBody);
app.use(router);

module.exports = router;
