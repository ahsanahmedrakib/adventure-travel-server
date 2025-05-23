const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;
const ObjectId = require("mongodb").ObjectId;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@travel.jqpxez7.mongodb.net/travel?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // databae connection
    await client.connect();
    const database = client.db("travel");
    const destinationsCollection = await database.collection("destinations");
    const ordersCollection = await database.collection("orders");

    // get api for all destinations

    app.get("/destinations", async (req, res) => {
      const cursor = destinationsCollection.find({});
      const allDestinations = await cursor.toArray();
      res.send(allDestinations);
    });

    // get api for a single destination

    app.get("/placeorder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const destination = await destinationsCollection.findOne(query);
      res.send(destination);
    });

    // post api for insert booking of an user

    app.post("/placeorder", async (req, res) => {
      const orderInfo = req.body;
      const result = await ordersCollection.insertOne(orderInfo);
      res.json(result);
    });

    // post api for add a new destination

    app.post("/addDestination", async (req, res) => {
      const destionationsInfo = req.body;
      const result = await destinationsCollection.insertOne(destionationsInfo);
      res.json(result);
    });

    // get api for all orders

    app.get("/orders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const allOrders = await cursor.toArray();
      res.send(allOrders);
    });

    // get api for a single order

    app.get("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.findOne(query);
      res.send(result);
    });

    // update status pendig to approve

    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "Approved",
        },
      };
      const result = await ordersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // delete a order

    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);

      console.log("Deleting user with id: ", result);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("This is my server of Adventure Travel");
});

app.get("/hello", (req, res) => {
  res.send("This is hello world");
});

app.listen(port, () => {
  console.log("Server of Adventure Travel runnig on: ", port);
});
