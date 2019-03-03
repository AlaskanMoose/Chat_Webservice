//express is the framework we're going to use to handle requests
const express = require("express");
//Create connection to Heroku Database
let db = require("../utilities/utils").db;
const bodyParser = require("body-parser");
//module used to make http calls
var request = require("request");

var router = express.Router();
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

const API_KEY = process.env.WEATHERBIT_API_KEY;

// This endpoint takes in either a lat lon, or a zipcode
// and returns the current weather conditions
router.post("/currentConditions", (req, res) => {
  let lat = req.body["lat"];
  let lon = req.body["lon"];
  let zipcode = req.body["zipcode"];
  let url;
  let weatherData;
  if (!((lat && lon) || zipcode)) {
    res.send({
      success: false,
      error: "Please supply atleast a lat lon, or a zipcode"
    });
    return;
  } else if (lat && lon) {
    url = `https://api.weatherbit.io/v2.0/current?lat=${lat}&lon=${lon}&NC&key=${API_KEY}`;
  } else {
    url = `https://api.weatherbit.io/v2.0/current?postal_code=${zipcode}&NC&key=${API_KEY}`;
  }

  request(url, function(error, response, body) {
    if (response.statusCode == 200) {
      weatherData = JSON.parse(body).data;
      res.send({
        success: true,
        weatherData
      });
    } else {
      res.send({
        success: false,
        error: error
      });
    }
  });
});

router.post("/24HourForecast", (req, res) => {
  let lat = req.body["lat"];
  let lon = req.body["lon"];
  let zipcode = req.body["zipcode"];
  let url;
  let weatherData;
  if (!((lat && lon) || zipcode)) {
    res.send({
      success: false,
      error: "Please supply atleast a lat lon, or a zipcode"
    });
    return;
  } else if (lat && lon) {
    url = `https://api.weatherbit.io/v2.0/forecast/hourly?lat=${lat}&lon=${lon}&NC&key=${API_KEY}&hours=24`;
  } else {
    url = `https://api.weatherbit.io/v2.0/forecast/hourly?postal_code=${zipcode}&NC&key=${API_KEY}&hours=24`;
  }
  // This endpoint takes in either a lat lon, or a zipcode
  // and returns the hourly forecast in 1 hour intervals
  request(url, function(error, response, body) {
    if (response.statusCode == 200) {
      weatherData = JSON.parse(body);
      res.send({
        success: true,
        weatherData
      });
    } else {
      res.send({
        success: false,
        error: error
      });
    }
  });
});

// This endpoint takes in either a lat lon, or a zipcode
// and returns a 10 day forecast in 1 day intervals
router.post("/10DayForecast", (req, res) => {
  let lat = req.body["lat"];
  let lon = req.body["lon"];
  let zipcode = req.body["zipcode"];
  let url;
  let weatherData;
  if (!((lat && lon) || zipcode)) {
    res.send({
      success: false,
      error: "Please supply atleast a lat lon, or a zipcode"
    });
    return;
  } else if (lat && lon) {
    url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&days=10&NC&key=${API_KEY}`;
  } else {
    url = `https://api.weatherbit.io/v2.0/forecast/daily?postal_code=${zipcode}&days=10&NC&key=${API_KEY}`;
  }

  request(url, function(error, response, body) {
    if (response.statusCode == 200) {
      weatherData = JSON.parse(body);
      res.send({
        success: true,
        weatherData
      });
    } else {
      res.send({
        success: false,
        error: error
      });
    }
  });
});

module.exports = router;
