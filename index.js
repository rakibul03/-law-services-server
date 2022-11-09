const express = require("express");
const cors = require("cors");
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
async function run() {
  try {
    const servicesCollection = client.db("allServices").collection("services");
    const reviewsCollection = client.db("allServices").collection("reviews");

    // Created an API endpoint for get limited amount of data
    app.get("/", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
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
    // app.post("/services", async (req, res) => {
    //   const service = req.body;
    //   const result = await servicesCollection.insertOne(service);
    //   res.send(result);
    // });

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
    app.get("/my-review", async (req, res) => {
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
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Services reviews server running on ${port}`);
});
