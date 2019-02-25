//express is the framework we're going to use to handle requests
const express = require("express");
//Create connection to Heroku Database
let db = require("../utilities/utils").db;

var router = express.Router();
// return all the members in the DB

router.get("/", (req, res) => {
  let members = [];
  db.manyOrNone(`SELECT email, Firstname, Lastname, username, MemberID FROM Members`)
    .then(rows => {
      rows.forEach(element => {
        members.push(element);
      });
      res.send({
        success: true,
        members: members
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