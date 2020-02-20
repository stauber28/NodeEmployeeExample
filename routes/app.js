'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');

const { validationResult, body } = require('express-validator');
const fetch = require("node-fetch");
const employeeRoutes = require('./employee');

router.get('', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/index.html'));
});

router.post('', (req, res) => {
  req.post({url: '/api/employees', headers: req.headers});

  processRequest(req);
  res.setHeader('Content-Type', 'application/json');
  res.send('Req OK');
});

module.exports = router;
