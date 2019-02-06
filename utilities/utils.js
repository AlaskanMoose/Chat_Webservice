//Get the connection to Heroku Database
let db = require("./sql_conn.js");
// const nodemailer = require("nodemailer");

//We use this create the SHA256 hash
const crypto = require("crypto");

function sendEmail(from, receiver, subj, message) {
  console.log("MESSAGE: " + message);
  //research nodemailer for sending email from node.
  // https://nodemailer.com/about/
  // https://www.w3schools.com/nodejs/nodejs_email.asp
  //create a burner gmail account
  //make sure you add the password to the environmental variables
  //similar to the DATABASE_URL and PHISH_DOT_NET_KEY (later section of the lab)

  // var transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   auth: {
  //     user: "ratchetskaterjd@gmail.com",
  //     pass: process.env.EMAIL_PASSWORD
  //   }
  // });

  // const mailOptions = {
  //   from: "ratchetskater@gmail.com", // sender address
  //   to: receiver, // list of receivers
  //   subject: subj, // Subject line
  //   html: message // plain text body
  // };

  // transporter.sendMail(mailOptions, function(err, info) {
  //   if (err) console.log(err);
  //   else console.log(info);
  // });
}

/**
 * Method to get a salted hash.
 * We put this in its own method to keep consistency
 * @param {string} pw the password to hash
 * @param {string} salt the salt to use when hashing
 */
function getHash(pw, salt) {
  return crypto
    .createHash("sha256")
    .update(pw + salt)
    .digest("hex");
}

module.exports = {
  db,
  getHash,
  sendEmail
};
