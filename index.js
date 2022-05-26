const express = require('express');
const app = express();
require("dotenv").config();
const cors = require('cors');
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());





const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5yfca.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const run = async () => {

  console.log("Db connected?")

  try {



    await client.connect();

    const productCollection = client.db("allproducts").collection("products");
    const orderCollection = client.db("allorders").collection("orders");




    // to get all product
    app.get('/product', async (req, res) => {
      const result = await productCollection.find({}).toArray();
      res.send(result);
    })

    // to add product on mongoDB
    app.post('/product', async (req, res) => {
      const data = req.body;
      const result = await productCollection.insertOne(data);
      res.send(result);
    })


    // to get product by id
    app.get('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result)
    })

    // to get all orders
    app.get('/order', async (req, res) => {
      const result = await orderCollection.find({}).toArray();
      res.send(result);
    })

    // to get order by id
    app.get('/order/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.findOne(query);
      res.send(result)
    })


    // to post purchase order to database
    app.post('/order', async (req, res) => {
      const data = req.body;
      const result = await orderCollection.insertOne(data);
      res.send(result);
    })






  }
  finally {

  }

}

run().catch(console.dir);



app.get('/', async (req, res) => {
  res.send('Server running?')
})

app.listen(port, () => {
  console.log('Server running on port :', port)
})