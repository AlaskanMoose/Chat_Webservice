//express is the framework we're going to use to handle requests
const express = require("express");
//Create connection to Heroku Database
let db = require("../utilities/utils").db;
const bodyParser = require("body-parser");

var router = express.Router();
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

// This endpoint takes in an email, nickname, or a full name
// and returns an array of member(s) that match information
router.post("/", (req, res) => {
  let email = req.body["email"];
  let nickname = req.body["nickname"];
  let fullname = req.body["fullname"];

  let query;
  members = [];

  if (!email && !nickname && !fullname) {
    res.send({
      success: false,
      error:
        "Please supply atleast on of the following: email, nickname, fullname"
    });
    return;
  }

  if (email != undefined) {
    query = `SELECT Firstname, LastName, username from members WHERE email = '${email}';`;
  } else if (fullname != undefined) {
    fullname = fullname.split(" ");
    query = `SELECT Firstname, LastName, username from members WHERE Firstname = '${
      fullname[0]
    }' AND Lastname = '${fullname[1]}';`;
  }

  db.manyOrNone(query)
    .then(rows => {
      if (rows.length == 0) {
        res.send({
          success: false,
          error: "No matching results"
        });
        return;
      }
      rows.forEach(element => {
        members.push(element);
      });
      res.send({
        success: true,
        members
      });
    })
    .catch(err => {
      res.send({
        success: false,
        error: err
      });
    });
});

module.exports = router;
