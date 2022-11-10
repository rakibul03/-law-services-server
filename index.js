const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@services-reviews.9yl2yvh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// Verify JWT token
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log(authHeader);

  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const servicesCollection = client.db("allServices").collection("services");
    const reviewsCollection = client.db("allServices").collection("reviews");

    // Create JWT token when hit this API endpoint
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    // Created an API endpoint for get limited amount of data
    app.get("/", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query).sort({ dateAndTime: -1 });
      const result = await cursor.limit(3).toArray();
      res.send(result);
    });

    // Created an API endpoint for getting all of services data
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get single products by services id
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.findOne(query);
      res.send(result);
    });

    // Create an api endpoint for add SERVICES
    app.post("/add-services", async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.send(result);
    });

    // Create an API endpoint for services reviews
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    // Getting review for specific services
    app.get("/reviews", async (req, res) => {
      let query = {};
      if (req.query.id) {
        query = {
          service_id: req.query.id,
        };
      }
      const cursor = reviewsCollection.find(query).sort({ dateAndTime: -1 });
      const review = await cursor.toArray();
      res.send(review);
    });

    // Gettin all for specific user
    app.get("/my-review", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.query.email) {
        return res.status(403).send({ message: "Forbiden access" });
      }
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = reviewsCollection.find(query);
      const review = await cursor.toArray();
      res.send(review);
    });

    app.delete("/my-review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewsCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Services reviews server running on ${port}`);
});
