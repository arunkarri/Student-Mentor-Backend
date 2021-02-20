var express = require('express');
var router = express.Router();
const mongo = require('../db');
const dbName = 'guviclass';
let collectionName = 'mentors';

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

router.post('/create-mentor', async function (req, res, next) {
  const client = new mongo.client(mongo.url, { useNewUrlParser: true, useUnifiedTopology: true });

  client.connect(async (err) => {
    const db = await client.db(dbName);
    const emailMatch = await db.collection(collectionName).findOne({ email: req.body.email });

    if (!!emailMatch) {
      res.json({ message: 'Email already exists.', statusCode: 300 });
    } else {
      const mentors = await db.collection(collectionName).find().toArray();
      const result = await db.collection(collectionName).insertOne({ id: mentors.length + 1, name: req.body.name, email: req.body.email });
      console.log(`result: ${result}`);
      res.json({ message: `New mentor created successfully!!`, statusCode: 200 });
    }
    client.close();
  });
});

router.get('/get-students/:id', async function (req, res, next) {
  const client = new mongo.client(mongo.url, { useNewUrlParser: true, useUnifiedTopology: true });

  client.connect(async (err) => {
    const db = await client.db(dbName);
    console.log(req.params.id, typeof req.params.id);
    const studentList = await db.collection(collectionName).find({ id: req.params.id }).project({ students: 1, _id: 0 }).toArray();
    console.log(`result: ${JSON.stringify(studentList)}`);
    res.json(studentList);
    client.close();
  });
});

router.post('/assign-students/:id', function (req, res, next) {
  const client = new mongo.client(mongo.url, { useNewUrlParser: true, useUnifiedTopology: true });
  if (Array.isArray(req.body.students)) {
    client.connect(async (err) => {
      const db = await client.db(dbName);
      const mentor = await db.collection(collectionName).findOne({ id: req.params.id });
      await db.collection(collectionName).updateOne({ id: req.params.id }, { $set: { students: req.body.students } });
      res.json({ message: `Students Mapped to mentor: ${mentor.name} successfully!!`, statusCode: 200 });
      client.close();
    });
  } else {
    res.status(500).json({ error: 'Students should be an array of objects', statusCode: 500 });
    client.close();
  }
});

module.exports = router;
