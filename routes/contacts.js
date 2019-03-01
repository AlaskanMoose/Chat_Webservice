//express is the framework we're going to use to handle requests
const express = require("express");
//Create connection to Heroku Database
let db = require("../utilities/utils").db;
const bodyParser = require("body-parser");

var router = express.Router();
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

// use this endpoint to pass in two contacts to add to each other
// PASS IN THE BODY member1id AND member2id
router.post("/addContact", (req, res) => {
  let myContacts = [];
  let member1 = req.body["member1id"];
  let member2 = req.body["member2id"];
  if (!member1 || !member2) {
    res.send({
      success: false,
      error: "Need to supply two members"
    });
    return;
  }
  let insert = `INSERT INTO Contacts(memberid_a, memberid_b)
  VALUES ($1, $2)`;
  db.none(insert, [member1, member2])
    .then(() => {
      db.manyOrNone(
        `SELECT Firstname, LastName from members WHERE memberid IN (SELECT memberid_b from contacts where memberid_a = ${member1});`
      )
        .then(rows => {
          rows.forEach(element => {
            myContacts.push(element);
          });
          db.manyOrNone(
            `SELECT Firstname, LastName from members WHERE memberid IN (SELECT memberid_a from contacts where memberid_b = ${member1});`
          ).then(rows => {
            rows.forEach(element => {
              myContacts.push(element);
            });
            res.send({
              success: true,
              myContacts: myContacts
            });
          });
        })
        .catch(err => {
          res.send({
            success: false,
            error: err
          });
        });
    })
    .catch(err => {
      res.send({
        success: false,
        error: err
      });
    });
});

// PASS IN THE BODY memberid
router.post("/myContacts", (req, res) => {
  myContacts = [];
  let myid = req.body["memberid"];
  if (!myid) {
    res.send({
      success: false,
      error: "Need to supply one member"
    });
    return;
  }

  db.manyOrNone(
    `SELECT Firstname, LastName from members WHERE memberid IN (SELECT memberid_b from contacts where memberid_a = ${myid});`
  )
    .then(rows => {
      rows.forEach(element => {
        myContacts.push(element);
      });
      db.manyOrNone(
        `SELECT Firstname, LastName from members WHERE memberid IN (SELECT memberid_a from contacts where memberid_b = ${myid});`
      ).then(rows => {
        rows.forEach(element => {
          myContacts.push(element);
        });
        res.send({
          success: true,
          myContacts: myContacts
        });
      });
    })
    .catch(err => {
      res.send({
        success: false,
        error: err
      });
    });
});
// Takes in memberid and returns an array of members
// that have requested to add you as connection
router.post("/pending", (req, res) => {
  let myRequests = [];
  let myid = req.body["memberid"];
  if (!myid) {
    res.send({
      success: false,
      error: "Need to supply one member"
    });
    return;
  }
  let query = `SELECT Firstname, LastName from members WHERE memberid IN (SELECT memberid_b from contacts where memberid_a = ${myid} and verified = 0);`;
  db.manyOrNone(query, [myid])
    .then(rows => {
      rows.forEach(element => {
        myRequests.push(element);
      });
      res.send({
        success: true,
        myRequests: myRequests
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
