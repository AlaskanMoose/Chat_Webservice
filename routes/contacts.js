//express is the framework we're going to use to handle requests
const express = require("express");
//Create connection to Heroku Database
let db = require("../utilities/utils").db;
const bodyParser = require("body-parser");

var router = express.Router();
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());


router.post("/sendRequest", (req, res) => {
  let senderMemberID = req.body['memberid'];
  let requestuser = req.body['username'];
  if (!senderMemberID || !requestuser) {
    res.send({
      success: false,
      error: "Need sender memberid and request username"
    });
    return;
  }
  db.one(`select memberid from members where username = $1;`, [requestuser])
    .then(row => {
      let requestMemberID = row['memberid'];
      db.one(`select * from contacts where memberid_a = ${senderMemberID} and memberid_b = ${requestMemberID};`)
        .then(row => {
          res.send({
            success: false,
            error: "You already sent this user a request"
          });
        })
        .catch(err => {
          db.none(`insert into contacts(memberid_a, memberid_b, verified) values (${senderMemberID}, ${requestMemberID}, 0);`)
            .then(() => {
              res.send({
                success: true,
                user: requestuser
              });
            })
            .catch(err => {
              res.send({
                success: false,
                error: err
              });
            });
        });

    })
    .catch(err => {
      res.send({
        success: false,
        error: "User does not exist!"
      })
    });
});


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
      `SELECT Firstname, LastName, username, email, memberid from members WHERE memberid IN (SELECT memberid_b from contacts where memberid_a = ${myid} and verified = 1);`
    )
    .then(rows => {
      rows.forEach(element => {
        myContacts.push(element);
      });
      db.manyOrNone(
        `SELECT Firstname, LastName, username, email, memberid from members WHERE memberid IN (SELECT memberid_a from contacts where memberid_b = ${myid} and verified = 1);`
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
  let query = `SELECT memberid, firstname, lastname, username, email from members WHERE memberid IN (SELECT memberid_a from contacts where memberid_b = ${myid} and verified = 0);`;
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

// Returns all the friends request sent by a user
router.post("/sent", (req, res) => {
  let sentlist = [];
  let myid = req.body["memberid"];
  if (!myid) {
    res.send({
      success: false,
      error: "Need to supply one member"
    });
    return;
  }
  let query = `SELECT memberid, firstname, lastname, username, email from members WHERE memberid IN (SELECT memberid_b from contacts where memberid_a = ${myid} and verified = 0);`;
  db.manyOrNone(query, [myid])
    .then(rows => {
      rows.forEach(element => {
        sentlist.push(element);
      });
      res.send({
        success: true,
        sentlist: sentlist
      });
    })
    .catch(err => {
      res.send({
        success: false,
        error: err
      });
    });
});

// Use this enpoint to verify friend requests
// Pass in the sender's memberid
router.post("/verify", (req, res) => {
  let member1 = req.body["memberid_a"];
  let member2 = req.body["memberid_b"];
  if (!member1 || !member2) {
    res.send({
      success: false,
      error: "Need to supply two members"
    });
    return;
  }

  let update = `update contacts set verified = 1 where memberid_a = ${member1} and memberid_b = ${member2}`;

  db.manyOrNone(update, [member1, member2])
    .then(() => {
      res.send({
        success: true,
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