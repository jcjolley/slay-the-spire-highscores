var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://jcjolley.com:27017/slay-the-spire";
import express = require('express');
import bodyParser = require('body-parser');
import uuid = require('uuidv4');

export function setupServer() {


  const app = express();

  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
  });

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.get('/', (req, res) => {
    res.send(`
      <html>
        <head>
          <title>Slay The Spire</title>
        </head>
        <body>
          <h1> Welcome to the Slay the Spire Score Server</h1>
          <div>
            <h3>API</h3>
            <ul>
              <li>POST <a href="/createUser">/createUser</a></li>
              <li>POST <a href="/login">/login</a></li>
            </ul>

            <p> Enjoy! </p>
          </div>
        </body>
      </html> 
    `)
  })

  app.post('/createUser', async (req, res, next) => {
    const { username, password } = req.body;
    console.log(`Creating new user: ${username}`);
    res.send(await createUser(username, password));
  })

  app.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
    console.log(`Logging in user: ${username}`);
    res.send(await login(username, password));
  })

  app.post('/slay-the-spire/add-score', async (req, res, next) => {
    const { username, score, character, level, daily } = req.body;
    res.send(await addScore(username, score, character, level, daily));
  })

  app.get('/slay-the-spire/get-scores', async (req, res, next) => {
    res.send(await getScores())
  })
  return app;
}

async function addScore(username, score, character, level = 0, daily = false) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, async function (err, db) {
      if (err) throw err;
      const dbo = db.db("slay-the-spire");
      const dbScore = {
        username,
        score,
        character,
        level,
        daily,
        timestamp: Date.now()
      }
      dbo.collection("scores").insertOne(dbScore, (err, res) => {
        if (err) reject(err);
        console.log(`Added score: ${JSON.stringify(dbScore)} `);
        resolve(res);
        db.close();
      })
    })
  })
}

async function createUser(username: string, password: string) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, async function (err, db) {
      if (err) throw err;
      const dbo = db.db("users")
      const userExists = await new Promise(resolve => {
        dbo.collection("users").findOne({ username }, (err, res) => {
          if (err) reject(err);
          console.log("checking if user exists: ", res);
          resolve(res);
        })
      });
      if (!userExists) {
        dbo.collection("users").insertOne({ username, password }, (err, res) => {
          if (err) reject(err);
          console.log(`Created user: ${username} ${JSON.stringify(res)} `)
          db.close();
          resolve(true);
        })
      } else {
        resolve(false);
      }
    });
  })
}

async function login(username: string, password: string) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      const dbo = db.db("users")
      dbo.collection("users").findOne({ username, password }, (err, res) => {
        if (err) reject(err);
        console.log(`Result of Login attempt:  ${JSON.stringify(res)} `)
        db.close();
        resolve(res);
      })
    });
  })
}

async function getScores() {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      const dbo = db.db('slay-the-spire');
      dbo.collection("scores").find({}).toArray((err, res) => {
        if (err) throw err;
        console.log(`Scores:  ${JSON.stringify(res)}`)
        resolve(res);
        db.close();
      })
    })
  })
}
