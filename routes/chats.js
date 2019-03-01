//express is the framework we're going to use to handle requests
const express = require("express");
//Create connection to Heroku Database
let db = require("../utilities/utils").db;
const bodyParser = require("body-parser");

var router = express.Router();
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

// This endpoint takes in a memberID and returns
// all the chatroom ID's and chatroom names they are in, and all the chatMembers
// in those rooms, excluding the input member

router.post("/getChats", (req, res) => {
  let chats = [];
  let result = [];
  let memberid = req.body["memberid"];
  if (!memberid) {
    res.send({
      success: false,
      error: "Need to one memberid"
    });
    return;
  }

  db.manyOrNone(
    `select chats.chatid, chats.name from chats, members, chatmembers where members.memberid = chatmembers.memberid AND chatmembers.chatid = chats.chatid and chatmembers.memberid = ${memberid};`
  )
    .then(rows => {
      if (rows.length == 0) {
        res.send({
          success: false,
          error: "No results"
        });
      }
      rows.forEach(element => {
        let chatid = element["chatid"];
        let chatname = element["name"];
        chats.push(chatid);
        let members = [];
        db.manyOrNone(
          `Select username, firstname, email from members, chatmembers, chats where members.memberid = chatmembers.memberid AND chatmembers.chatid = chats.chatid AND chats.chatid = ${chatid} AND chatmembers.memberid != ${memberid};`
        )
          .then(rows => {
            rows.forEach(element => {
              members.push(element);
            });

            result.push({
              chatid: chatid,
              chatname,
              members
            });
            if (result.length == chats.length) {
              res.send({
                success: true,
                result: result
              });
              return;
            }
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
        error: err
      });
    });
});

module.exports = router;
