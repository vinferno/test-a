import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import * as socketIO from "socket.io";
import http from 'http';
import dotenv from "dotenv";
import path from 'path';
import { UserModel } from "./schemas/user.schema.js";
import { ProductModel } from "./schemas/product.schema.js";
import { InventoryItemModel } from "./schemas/inventoryItem.schema.js";
import { CartItemModel } from "./schemas/cartItem.schema.js";
import { User } from "../shared/models/user.model.js";



dotenv.config();

const __dirname = path.resolve();

dotenv.config();
const app = express();
const server = http.createServer(app);
const clientPath = path.join(__dirname, '/dist/client');
app.use(express.static(clientPath));

const io = new socketIO.Server(server,  { cors: {
  origin: '*'
}});

const PORT = process.env.PORT || 3000;

mongoose
  .connect(`${process.env.MONGO_URI}`)
  .then(() => {
    console.log("Connected to DB Successfully");
  })
  .catch((err) => console.log("Failed to Connect to DB", err));

app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: ['http://localhost:3000', 'http://localhost:4200', 'http://localhost:3501', 'http://localhost:8080']
}));
app.use(express.json());

app.get("/api/test", function (req, res) {
  res.json({message: "Hello World!"});
});


app.post("/api/create-user", async function (req, res) {
  const { username } = req.body;
  const user = await new UserModel({ username });
  await user.save();
  res.json({ message: "User Created" , user});
});

app.get("/api/users", async function (req, res) {
  const users = await UserModel.find();
  res.json({ message: "Users Retrieved" , users});
});

app.post("/api/create-product", async function (req, res) {
  const { name, price, description } = req.body;
  const product = await new ProductModel({ name, price, description });
  await product.save();
  res.json({ message: "Product Created" , product});
});

app.get("/api/products", async function (req, res) {
  const products = await ProductModel.find();
  res.json({ message: "Products Retrieved" , products});
});

app.post("/api/create-inventory-item", async function (req, res) {
  const { 
    product,
    condition,
    status,
    location,
    salePrice,
    dateSold,
   } = req.body;
  const inventoryItem = await new InventoryItemModel({
    product,
    condition,
    status,
    location,
  });

  await inventoryItem.save();
  res.json({ message: "Inventory Item Created" , inventoryItem});
});


app.get("/api/inventory-items", async function (req, res) {
  const inventoryItems = await InventoryItemModel.find().populate('product');
  res.json({ message: "Inventory Item Retrieved" , inventoryItems});
});


app.post("/api/create-cart-item", async function (req, res) {
    const {inventoryItem, user} = req.body;
    const cartItem = await new CartItemModel({inventoryItem, user});
    await cartItem.save();
    res.json({ message: "Cart Item Created" , cartItem});
});

app.get("/api/cart-items", async function (req, res) {
  const cartItems = await CartItemModel.find();
  res.json({ message: "Cart Item Retrieved" , cartItems});
});

app.post("/api/user-cart-agg", async function (req, res) {
  const {user} = req.body;
  console.log(user);
  const cartItems = await CartItemModel
    .aggregate([
      {$match: {user: new mongoose.Types.ObjectId(user)}},
      { $lookup: {
        from: "inventoryitems",
        localField: "inventoryItem",
        foreignField: "_id",
        as: "inventoryItems"
      }}, 
      { $project: { 
        inventoryItem: { $arrayElemAt: [ "$inventoryItems", 0 ] },
      }},
      { $lookup: {
        from: "products",
        localField: "inventoryItem.product",
        foreignField: "_id",
        as: "product"
      }},
      { $project: { 
        product: { $arrayElemAt: [ "$product", 0 ] } 
      }},
    
      { $group: {
        _id: { product: '$product'},
        count: { $sum: 1 },
      }},
      { $project: {
        product: '$_id.product',
        count: 1,
        _id: 0
      } },
      { $sort: { count: 1 } }
    ]);


  res.json({ 
    message: "Cart Item Retrieved" ,
    cartItems: cartItems
  });
});


app.post("/api/user-cart-ag", async function (req, res) {
  const {user} = req.body;
  console.log(user);
  const cartItems = await CartItemModel
    .aggregate([
      {$match: {user: new mongoose.Types.ObjectId(user)}},
      { $lookup: {
        from: InventoryItemModel.collection.name,
        localField: "inventoryItem",
        foreignField: "_id",
        as: "inventoryItem"
      }},
      { $project: {
        inventoryItem: { $arrayElemAt: [ "$inventoryItem", 0 ] },
      }},
      { $lookup: {
        from: ProductModel.collection.name,
        localField: "inventoryItem.product",
        foreignField: "_id",
        as: "product"
      }},
      { $project: {
        product: { $arrayElemAt: [ "$product", 0 ] },
        _id: 0,
      } },
      { $group: {
        _id: { product: '$product'},
        count: { $sum: 1 },
      }},
      { $project: {
        product: '$_id.product',
        count: 1,
        _id: 0
      }}

    
    ]);


  res.json({ 
    message: "Cart Item Retrieved" ,
    cartItems: cartItems
  });
});





app.post("/api/user-cart", async function (req, res) {
  const {user} = req.body;
  console.log(user);
  const cartItems = await CartItemModel
    .find({
      user
    })
  .populate(
    {path: 'inventoryItem', 
    populate: [
        {path: 'product'}
    ]}).lean();;


  res.json({ 
    message: "Cart Item Retrieved" ,
    cartItems: cartItems.reduce((acc: any, item: any) => {
      console.log(acc);
      const found = acc.find( (i: any) => i._id === item.inventoryItem.product._id)
      if(found) {
        found.quantity += 1;
      } else {
        acc.push({
          ...item.inventoryItem.product,
          quantity: 1
        });
      }
      return acc;
    }, [])
  });
});

app.post("/api/user-cart-agg-pipe", async function (req, res) {
  const {user} = req.body;
  console.log(user);
  const cartItems = await CartItemModel
    .aggregate([
      {$match: {user: new mongoose.Types.ObjectId(user)}},
      { $lookup: {
        from: InventoryItemModel.collection.name,
        let: { inventoryItem: '$inventoryItem' },
        pipeline: [
          { $match: { $expr: { $eq: [ '$_id', '$$inventoryItem' ] } } },
          { $lookup: {
            from: ProductModel.collection.name,
            localField: 'product',
            foreignField: '_id',
            as: 'product',
          }},
        ],
        as: 'inventoryItem'
       }},
       { $project: { 
        product: { $arrayElemAt: [ "$inventoryItem.product", 0 ] } 
      }},
      { $project: { 
        product: { $arrayElemAt: [ "$product", 0 ] } 
      }},
      { $group: {
        _id: { product: '$product'},
        count: { $sum: 1 },
      }},
      { $project: { 
        product: '$_id.product',
        count: 1,
        _id: 0
      }},
    ]);


  res.json({ 
    message: "Cart Item Retrieved" ,
    cartItems: cartItems
  });
});

app.post("/api/user-cart-pipe", async function (req, res) {
  const {user} = req.body;
  console.log(user);
  const cartItems = await CartItemModel
    .aggregate([
      {$match: {user: new mongoose.Types.ObjectId(user)}},
      { $lookup: {
        from: InventoryItemModel.collection.name,
        let: { inventoryItem: '$inventoryItem' },
        pipeline: [
          { $match: { $expr: { $eq: [ '$_id', '$$inventoryItem' ] } } },
          { $lookup: {
            from: ProductModel.collection.name,
            localField: 'product',
            foreignField: '_id',
            as: 'product',
          }},
        ],
        as: 'inventoryItem'
       }},
        { $project: {
          product: { $arrayElemAt: [ "$inventoryItem.product", 0 ] },
          _id: 0,
          user: 1,
        } },
        { $project: {
          product: { $arrayElemAt: [ "$product", 0 ] },
          _id: 0,
          user: 1,
        } },
        {
          $project: {
            name: '$product.name',
            price: '$product.price',
            description: '$product.description',
            user: 1,
          }
        },
      { $group: {
        _id: { name: '$name', price: '$price', description: '$description'},
        count: { $sum: 1 },
        user: { $first: '$user'},
      } },
      { $lookup: {
        from: UserModel.collection.name,
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      }},
      { $project: {
        name: '$_id.name',
        price: '$_id.price',
        description: '$_id.description',
        count: 1,
        _id: 0,
        user: { $arrayElemAt: [ "$user", 0 ] },
      }},
      { $project: {
        name: 1,
        price: 1,
        description: 1,
        count: 1,
        _id: 0,
        user: "$user.username"
      }}
    
    ]);


  res.json({ 
    message: "Cart Item Retrieved" ,
    cartItems: cartItems
  });
});




app.all("/api/*", function (req, res) {
  res.sendStatus(404);
});


server.listen(PORT, function () {
  console.log(`starting at localhost http://localhost:${PORT}`);
});


io.on('connection', function(socket){
  console.log('a user connected');
  socket.emit('message', 'work')
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

app.all("*", function (req, res) {
  const filePath = path.join(__dirname, '/dist/client/index.html');
  console.log(filePath);
  res.sendFile(filePath);
});