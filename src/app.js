import express from "express";
import { Prisma,PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import cors from 'cors';
import ProductsRoute from "./routes/products.js"; 
import articleRoute from "./routes/articles.js";
import commentRoutes from "./routes/comment.js";

dotenv.config();
 
const app = express(); 
app.use(cors());
app.use(express.json()); 
 
const prisma = new PrismaClient();
  
app.use("/products",ProductsRoute); 
app.use("/articles",articleRoute);
app.use("/comment",commentRoutes);
   
//추가해야할 내용 title,content에 포함된 단어로 검색할수 있어야함.
 
////////////////////Articles///////////////////////
 
 
/////////////////////comment//////////////////////

 

app.listen(3000,()=>{
  console.log("Server is listening on port 3000");
});

 