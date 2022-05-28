const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
require("dotenv").config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// jwt token verify function
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: 'Unauthorized access!' })
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access!' })
    }
    req.decoded = decoded
    next()
  });

}



const { ObjectID } = require('bson');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5yfca.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const run = async () => {

  console.log("Db connected?")

  try {



    await client.connect();

    const productCollection = client.db("allproducts").collection("products");
    const orderCollection = client.db("allorders").collection("orders");
    const orderPaymentCollections = client.db("allpayments").collection("payment");
    const userCollections = client.db("allusers").collection("users");


    // is admin
    app.get('/admin/:email', async(req, res) => {
      const email = req.params.email;
      const user = await userCollections.findOne({email: email});
      const isAdmin = user.role === 'admin';
      res.send(isAdmin);
    })




    // to make admin
    app.put('/user/admin/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;

      const requester = req.decoded.email;
      const requesterAccount = await userCollections.findOne({ email: requester });

      if (requesterAccount.role === 'admin') {
        const filter = { email: email };
        const updatedDoc = {
          $set: { role: 'admin' }
        };
        const result = await userCollections.updateOne(filter, updatedDoc);
        res.send(result);
      }
      else {
        res.status(403).send({ message: 'Forbidden!' })
      }
    })


    // make or update user
    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updatedDoc = {
        $set: user
      };

      const result = await userCollections.updateOne(filter, updatedDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7h' });

      res.send({ result, token });
    })



    // to get add user
    app.get('/user', verifyJWT, async (req, res) => {
      const users = await userCollections.find({}).toArray();
      res.send(users);
    })



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

    // to delete a product
    app.delete('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result)
    })

    // to get all orders
    app.get('/order', verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;

      if (email === decodedEmail) {
        const query = { email: email };
        const result = await orderCollection.find(query).toArray();
        return res.send(result);
      }
      else {
        return res.status(404).send({ message: 'Forbidden access!' })
      }

    })


    // to manage order for admin
    app.get('/adminOrderManage', async (req, res) => {
      const result = await orderCollection.find({}).toArray();
      return res.send(result);

    })

    // to get order by id
    app.get('/order/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.findOne(query);
      res.send(result)
    })

    // to delete a order by id
    app.delete('/order/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result)
    })


    // to post purchase order to database
    app.post('/order', async (req, res) => {
      const data = req.body;
      // const query = {productId: data.productId, name: data.name}

      // console.log(query)
      // const exists = await orderCollection.findOne(query);
      // if(exists) {
      //   return res.send({success: false, order: exists})
      // }
      // try to make it better ###################################################

      const result = await orderCollection.insertOne(data);
      res.send(result);
    })



    // to update payment info
    app.patch('/order/:id', async (req, res) => {
      const id = req.params.id;
      const payment = req.body;
      const filter = { _id: ObjectID(id) };
      const updatedDoc = {
        $set: {
          paid: true,
          transactionId: payment.transactionId
        }
      };

      const result = await orderPaymentCollections.insertOne(payment);
      const updatedOrder = await orderCollection.updateOne(filter, updatedDoc);
      res.send(updatedOrder);

    })

    // stripe backend config

    app.post('/create-payment-intent', async (req, res) => {
      const order = req.body;
      const price = order.price;
      const amount = price * 100;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      });

      res.send({ clientSecret: paymentIntent.client_secret })
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