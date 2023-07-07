const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const  jwt = require('jsonwebtoken');
const express = require('express')
const cors = require('cors')

const app = express()
const port =process.env.PORT||5000;
require('dotenv').config();


// middlewares
app.use(cors());
app.use(express.json());


//  user: imranrifatdev
 // pass: KpFiSlyjfQU4MV3s

const categories=require("./data/Catagories.json"); 
const req = require('express/lib/request');


// Database Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vwmihqp.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);

const client = new MongoClient(uri, {serverApi: {version: ServerApiVersion.v1,strict: true,       deprecationErrors: true,}});

async function run() {

  try {
    const productCollection=client.db("best-buy").collection("products");
    const ordersCollection=client.db("best-buy").collection("orders");
    const usersCollection=client.db("best-buy").collection("users");




    app.get("/products",async(req,res)=>{
      const qurry={};
      const  options=await productCollection.find(qurry).toArray();
      res.send(options);

    });


    app.get('/product/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)}
      const product= await productCollection.findOne(query);
      res.send(product);


    })




    app.post("/orders",async(req,res)=>{
      const order=req.body;
      const result=await ordersCollection.insertOne(order);
      res.send(result);
    });
      


    // get user specific orders //
  app.get('/order',async(req,res)=>{
    // let query={};
    // if(req.query.email){
    //   query={
    //     email:req.query.email
    //   }
    // }
    const email=req.query.email;
    const query={email:email};
    const order=await ordersCollection.find(query).toArray();
    res.send(order);

  })


      // get all order  //
    app.get('/orders',async(req,res)=>{
      const query={};
      const orders=await ordersCollection.find(query).toArray();
      res.send(orders)

    });

    // save user in DB //
    app.post('user',async(req,res)=>{
      const user=req.body;
      const result=await usersCollection.insertOne(user);
      res.send(result);
      
    })





    app.get("/categories",(req,res)=>{
      res.send(categories)
    })





  } 
  
  
  finally {
   
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('Bestbuy server is running ...!')
})




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})