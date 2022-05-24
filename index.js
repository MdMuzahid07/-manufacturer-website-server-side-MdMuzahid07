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



    app.get('/product', async(req, res) => {
      const result = await productCollection.find({}).toArray();
      res.send(result);
    })

    app.get('/product/:id', async(req,res) => {
      const id = req.params;
      const query = {_id: ObjectId(id)};
      const result = await productCollection.findOne(query);
      res.send(result)
    })







  }
  finally {

  }

}

run().catch(console.dir);



app.get('/', async(req, res) => {
    res.send('Server running?')
})

app.listen(port, () => {
    console.log('Server running on port :', port)
})