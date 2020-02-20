'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');

// Return index view at url root
router.get('', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/index.html'));
});

module.exports = router;
