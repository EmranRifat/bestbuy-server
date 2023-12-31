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
// const req = require('express/lib/request');


// Database Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vwmihqp.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);

const client = new MongoClient(uri, {serverApi: {version: ServerApiVersion.v1,strict: true,       deprecationErrors: true,}});

    // varify jwt function //

    function verifyJWT(req, res, next) {
      // console.log(req.headers.authorization);
      const authHeader = req.headers.authorization;
      if (!authHeader) {
          return res.status(401).send('unauthorized access');
      }
      const token = authHeader.split(' ')[1];
  
      jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
          if (err) {
              return res.status(403).send({ message: 'forbidden access' })
          }
          req.decoded = decoded;
          next();
      })
  
  }




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
  app.get('/order',verifyJWT,async(req,res)=>{

    const email=req.query.email;
    const decodedEmail=req.decoded.email;  
    // console.log('inside',decodedEmail);
    if(email!==decodedEmail){
      return res.status(403).send({message:'forbidden access '})
    }
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
    app.post('/users',async(req,res)=>{
      const user=req.body;
      const result=await usersCollection.insertOne(user);
      res.send(result);
      
    });
    // get allusers //
    app.get('/users',async(req,res)=>{
      const query={};
      const users=await usersCollection.find(query).toArray();
      res.send(users);
    });


    // update a user role
    app.put('/users/admin/:id',async(req,res)=>{
      const id=req.params.id;
      const filter={_id:new ObjectId(id)};
      const options = { upsert: true };
      const updateDoc={
        $set:{
          role:'admin'
        }
      }
      const result=await usersCollection.updateOne(filter,updateDoc,options);
      res.send(result)


    })






    // generate JWT token when user in db //
    app.get('/jwt',async (req,res)=>{
      const email=req.query.email;
      const qurry={email:email};
      const user=await usersCollection.findOne(qurry);
      if(user){
        const token=jwt.sign({email},process.env.ACCESS_TOKEN,{expiresIn:'12h'})
        return res.send({accessToken:token});
      }
  // else jodi user na takhe tahole unothorize dakhabe//
      res.status(403).send({accessToken:''})
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