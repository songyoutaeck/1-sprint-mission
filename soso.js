import express from "express";
import { Prisma , PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
 
const app = express();
app.use(express.json());

const prisma = new PrismaClient();
dotenv.config();

app.post("/products",async(req,res)=>{
  const { name , description , price , tags , createAt ,updatedAt} = req.body;
  const product = await prisma.product.create({
    data : {
     name , description , price , tags  
  }});
  res.status(201).send(product);
})

app.get("/products/:id",async(req,res)=>{
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where : {id :id},
    select : {
      name : true, description: true,
      price: true, tags: true
    }
  });
  res.json( {data: product});
})

app.patch("/products/:id",async(req,res)=>{
  const id = req.params;
  const product = await prisma.product.update({
    where : {id},
    data : { name : true, description: true, price: true, tags: true }
  })
  res.send(product);
})


app.listen(3000,()=>{
  console.log("successful");
})