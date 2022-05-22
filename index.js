const express = require('express');
const app = express();
require("dotenv").config();
const cors = require('cors');
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());





const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5yfca.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");

  console.log("DB connected?")



  // perform actions on the collection object
  client.close();
});




app.get('/', async(req, res) => {
    res.send('Server running?')
})

app.listen(port, () => {
    console.log('Server running on port :', port)
})