// const Kutt = require("kutt");
var express = require("express");
var app = express();
const axios = require("axios");

async function customHyperlink(req, res) {

  let target = req.body.target;

  let data = JSON.stringify({
    target: target,
    reuse: true
  });

  axios
    .post("https://kutt.it/api/url/submit", data, {
      headers: {
        "x-api-key": "fIiVxGQ8H11xvaBlJcCEFQULwveQ7eXV4OLuthcr",
        "Content-Type": "application/json"
      }
    })
    .then(response => res.send(response.data))
    .catch(err => console.log(err));
}

module.exports = {
  customHyperlink: customHyperlink
};
