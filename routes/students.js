var express = require('express');
var router = express.Router();
const mongo = require('../db');
const dbName = 'guviclass';
let collectionName = 'students';

router.get('/', async function (req, res, next) {
  const client = new mongo.client(mongo.url, { useNewUrlParser: true, useUnifiedTopology: true });

  client.connect(async (err) => {
    const db = await client.db(dbName);
    const result = await db.collection(collectionName).find().toArray();
    console.log(`result: ${result}`);
    res.json(result);
    client.close();
  });
});

router.post('/create-student', async function (req, res, next) {
  const client = new mongo.client(mongo.url, { useNewUrlParser: true, useUnifiedTopology: true });

  client.connect(async (err) => {
    const db = await client.db(dbName);
    const emailMatch = await db.collection(collectionName).findOne({ email: req.body.email });
    if (!!emailMatch) {
      res.json({ message: 'Email already exists.', statusCode: 300 });
    } else {
      const students = await db.collection(collectionName).find().toArray();
      const result = await db.collection(collectionName).insertOne({ id: students.length + 1, name: req.body.name, email: req.body.email });
      console.log(`result: ${result}`);
      res.json({ message: `New student created successfully!!`, statusCode: 200 });
    }
    client.close();
  });
});

router.post('/assign-mentor/:id', async function (req, res, next) {
  const client = new mongo.client(mongo.url, { useNewUrlParser: true, useUnifiedTopology: true });
  if (typeof req.body.mentor === 'string') {
    client.connect(async (err) => {
      const db = await client.db(dbName);
      const student = await db.collection(collectionName).findOne({ id: req.params.id });
      await db.collection(collectionName).updateOne({ id: req.params.id }, { $set: { mentor: req.body.mentor } });

      res.json({ message: `Mentor Assigned to student: ${student.name} successfully!!`, statusCode: 200 });
      client.close();
    });
  } else {
    res.status(500).json({ statusCode: 500, error: 'Input must be a string' });
  }
});

module.exports = router;
