'use strict';

const express = require('express');
const router = express.Router();
const { validationResult, body } = require('express-validator');
const { uuid } = require('uuidv4');
const fetch = require("node-fetch");
const DATABASE = {};

class Employee {
  constructor(obj) {
    this.firstName = obj.firstName;
    this.lastName = obj.lastName;
    this.hireDate = obj.hireDate;
    this.role = obj.role;
  }

  loadMedia = async () => {
    this.media = [];

    var sources = randomItems(Object.keys(externalSources), 2);
    for (let i = 0; i < sources.length; ++i) {
      let source = sources[i];
      try {
        let res = await fetch(source, {
          headers: { 
            "Accept": "application/json",
          }
        });
        let json = await res.json();
        let content = await externalSources[source](json);
        this.media.push(content);
      } catch(e) {
        console.error("Unable to fetch content from " + source);
      }
    }
  };
}

const randomItems = (array, count) => {
  count = Math.min(count, array.length); // ensure count does not exceed available elements
  let indices = [...Array(array.length).keys()]; // array of possible indices [0,1,2,3,...]
  let output = [];

  for (let i = 0; i < count; ++i) {
    let index = Math.floor(Math.random() * (indices.length)); // random index of remaining indices
    var indexVal = indices.splice(index, 1)[0]; // remove value from indices[] so it is not selected more than once
    output.push(array[indexVal]); // add array item from indexVal to output
  }

  return output;
}

const role = Object.freeze([
  'CEO',
  'VP',
  'MANAGER',
  'LACKEY'
]);


const externalSources = {
  'https://ron-swanson-quotes.herokuapp.com/v2/quotes': async (json) => {
    return json[0] + ' -Ron Swanson';
  },
  'https://api.kanye.rest': (json) => {
     return json.quote + ' -Kanye West';
  },
  'https://icanhazdadjoke.com': async (json) => {
    return json.joke;
  }
};

const bodyString = (field, msg) => body(field, msg)
  .exists().withMessage(field + ' does not exist')
  .isString().withMessage(field + ' is not String')
  .not().isEmpty().withMessage(field + ' is Empty');

const bodyValidators = [
  // Validators
  bodyString('firstName', 'Invalid First Name'),
  bodyString('lastName', 'Invalid Last Name'),
  body('hireDate', 'Invalid Hire Date')
    .matches(/[0-9]{4}-[0-9]{2}-[0-9]{2}/).withMessage('hireDate format must be YYYY-MM-DD')
    .isBefore().withMessage('hireDate Must be In Past'),
  bodyString('role', 'Invalid Role').isIn(role)
];
  
/* GET /api/employees listing. */
/* Get all saved employees */
router.get('', (req, res) => {
  return res.send(DATABASE);
});

/* POST /api/employees */
/* Create a new employee */
router.post('', bodyValidators, async(req, res) => {
    try {
      // Check Validation
      validationResult(req).throw();

      // Generate uuid for id
      const id = uuid();
      req.body.id = id;

      // Insert to DATABASE if valid
      // Employee class used to verify integrity (prevent extra fields posted from entering DB)
      let employee = new Employee(req.body);
      await employee.loadMedia();
      employee.id = id;
      DATABASE[id] = employee;
      
      // Return Create Status
      res.status(201).json(employee);
    } catch (err) {
      // Return unprocessable entity error with errors
      res.status(422).json(err);
    }
});

/* All /api/employees/id Routes. */
/* Check requests for valid employee id */
router.all('/:id', (req, res, next) => {
  if (!DATABASE.hasOwnProperty(req.params.id)) {
    // Bubble Error Message
    return next("Unknown Identifier Provided");
  } 

  // Forward Execution to Route
  return next();
});

/* GET /api/employees/id */
/* Get a saved employee */
router.get('/:id', (req, res) => {
    return res.send(DATABASE[req.params.id]);
});

/* PUT /api/employees/id */
/* Update an existing employee */
router.put('/:id', bodyValidators, (req, res) => {
  // Update existing model with values supplied in body
  // Employee class used to verify integrity (prevent extra fields posted from entering DB)
  Object.assign(DATABASE[req.params.id], new Employee(req.body));
  let employee = DATABASE[req.params.id];

  return res.status(200).send(employee);
});

/* DELETE /api/employees/id */
/* Delete an existing employee */
router.delete('/:id', (req, res) => {
  var obj = DATABASE[req.params.id];
  delete DATABASE[req.params.id];
  return res.status(200).send(obj);
});

module.exports = router;
