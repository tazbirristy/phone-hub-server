const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();
// middle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.suu4fk2.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    const usersCollections = client.db("phoneHub").collection("users");
    const categoriesCollection = client.db("phoneHub").collection("categories");
    const productsCollection = client.db("phoneHub").collection("products");

    // user collection api
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updatedDoc = {
        $set: user,
      };
      const result = await usersCollections.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
    // Admin api for dashboard
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollections.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });
    // seller api for dashboard
    app.get("/users/seller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollections.findOne(query);
      res.send({ isSeller: user?.role === "seller" });
    });

    // product categories
    app.get("/categories", async (req, res) => {
      const query = {};
      const result = await categoriesCollection.find(query).toArray();
      res.send(result);
    });
    // get products by its category
    app.get("/category/:id", async (req, res) => {
      const id = req.params.id;
      const query = { category_id: id };
      const categoryProduct = await productsCollection.find(query).toArray();
      res.send(categoryProduct);
    });
  } finally {
  }
}

run().catch((err) => console.error(err));

app.get("/", async (req, res) => {
  res.send("Phone-hub server is running");
});

app.listen(port, () => {
  console.log(`Phone-hub is running on port ${port}`);
});
