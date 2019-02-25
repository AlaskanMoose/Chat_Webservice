//express is the framework we're going to use to handle requests
const express = require("express");

//We use this create the SHA256 hash
const crypto = require("crypto");

//Create connection to Heroku Database
let db = require("../utilities/utils").db;

let getHash = require("../utilities/utils").getHash;

let sendEmail = require("../utilities/utils").sendEmail;

var router = express.Router();

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

router.post("/", (req, res) => {
  res.type("application/json");

  //Retrieve data from query params
  var first = req.body["first"];
  var last = req.body["last"];
  var username = req.body["username"];
  var email = req.body["email"];
  var password = req.body["password"];
  //Verify that the caller supplied all the parameters
  //In js, empty strings or null values evaluate to false
  if (first && last && username && email && password) {
    //We're storing salted hashes to make our application more secure
    //If you're interested as to what that is, and why we should use it
    //watch this youtube video: https://www.youtube.com/watch?v=8ZtInClXe1Q
    let salt = crypto.randomBytes(32).toString("hex");
    let salted_hash = getHash(password, salt);

    //Use .none() since no result gets returned from an INSERT in SQL
    //We're using placeholders ($1, $2, $3) in the SQL query string to avoid SQL Injection
    //If you want to read more: https://stackoverflow.com/a/8265319
    let params = [first, last, username, email, salted_hash, salt];
    db.none(
      "INSERT INTO MEMBERS(FirstName, LastName, Username, Email, Password, Salt) VALUES ($1, $2, $3, $4, $5, $6)",
      params
    )
      .then(() => {
        //We successfully added the user, let the user know
        res.send({
          success: true
        });

        sendEmail(
          "uwnetid@uw.edu",
          email,
          "welcome to your new aMessage Account!",
          `<img src="https://res.cloudinary.com/dq5kixztw/image/upload/v1551050178/logo.png"><strong> Thanks for choosing aMessage for your chat needs! Click <a href=https://chat450.herokuapp.com/register/verify?name=${email}>HERE</a> to verifiy your account.</strong>`
        );
      })
      .catch(err => {
        //log the error
        console.log(err);
        //If we get an error, it most likely means the account already exists
        //Therefore, let the requester know they tried to create an account that already exists
        res.send({
          success: false,
          error: err
        });
      });
  } else {
    res.send({
      success: false,
      input: req.body,
      error: "Missing required user information"
    });
  }
});

router.get("/verify", (req, res) => {
  let email = req.query["name"];
  db.one("UPDATE Members SET Verification=1 WHERE Email=$1", [email]).then(
    //TODO Handle promise
    row => {}
  );

  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(`<h1> ${email} verified! </h1>`);
});

module.exports = router;
