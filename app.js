import express from "express";
import { Prisma,PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';
import cors from 'cors';

const ProductsRoute = express.Router();     
 
const app = express();
app.use(express.json());
app.use(cors());

dotenv.config();


const prisma = new PrismaClient();

// app.post("/products",(req,res)=>{
//   const product =  await prod
// })

function asyncHandler(handler) {
  return async function (req, res) {
    try {
      await handler(req, res);
    } catch (e) {
      console.log("Error occured");
      console.log(e);
      if (
        e.name === "StructError" || // 1.
        (e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2002") || // 2.
        e instanceof Prisma.PrismaClientValidationError // 3.
      ) {
        res.status(400).send({ message: e.message });
      } else if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025"
      ) {
        res.status(404).send({ message: e.message });
      } else {
        res.status(500).send({ message: e.message });
      }
    }
  };
}

app.use('/products',ProductsRoute); 

  

app.delete("/products/:id",asyncHandler(async(req,res)=>{
  const {id} = req.params;
  const product = await prisma.product.delete({
    where:{id}, 
  })
  res.send("Success delete");
}))

//추가해야할 내용 title,content에 포함된 단어로 검색할수 있어야함.
app.get(  "/products",
  asyncHandler(async (req, res) => {
    const { offset = 0, limit = 10 , search } = req.query;
    const orderBy = {createdAt : "desc"}; 
    if(search){
      where = {
        OR : [
          { name : { contains : search , model : "insensitive"}},
          { description : { contains : search , model : "insentive"}}
        ]
      }
    }
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip: parseInt(offset),
      take: parseInt(limit),
      select:{
        id: true,
        name : true,
        price : true,
        createdAt : true
      }
    });
    console.log(products);
    res.send(products);
  })
);
////////////////////Articles///////////////////////
app.post("/articles",asyncHandler(async(req,res)=>{
  const {title, content } = req.body
  const newdata = await prisma.article.create({
    data : {title, content }
  });
  res.status(201).json( {data : newdata});
}))
 
 
app.get("/articles/:id",asyncHandler(async(req,res)=>{
  const { id } = req.params;
  const article = await prisma.article.findUnique({
    where : {id : id},
    select : {
      id : true,
      title : true,
      content : true,
      createdAt : true
    }
  });
  res.send(article);
}))

app.patch("/articles/:id",asyncHandler(async(req,res)=>{
  const {id} = req.params
  const article = await prisma.article.update({
    where : {id},
    data :  req.body
  });
  res.send(article);
}))

app.delete("/articles/:id",asyncHandler(async(req,res)=>{
  const {id} = req.params;
  const article = await prisma.article.delete({
    where : {id}, 
  });
  res.send("article");
}))

app.get("/articles",asyncHandler(async(req,res)=>{
  const { offset = 0, limit = 10 , search } = req.query;
  const orderBy = {createdAt : "des"};
  if(search){
    where = {
      OR : [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
       ]
    }
  }  
  const article = await prisma.article.findMany({
    where,
    orderBy : {createdAt : "asc"},
    skip: parseInt(offset),
    take: parseInt(limit),
    select : {
      id : true,
      title : true,
      content : true,
      createdAt : true
    }
  })
  res.send(article)
})) 
 
/////////////////////comment//////////////////////

app.post("/comments",asyncHandler(async(req,res)=>{
  const {content, productId } = req.body;
  const newdata = await prisma.comment.create({
    data : {content, productId}
  });
  res.status(201).send(newdata);
})) 

app.post("/comments",asyncHandler(async(req,res)=>{
  const {content, articleId } = req.body;
  const newdata = await prisma.comment.create({
    data : {content, articleId}
  });
  res.status(201).send(newdata);
})) 


app.patch("/comments/:id",asyncHandler(async(req,res)=>{
  const {id} = req.params;
  const commit = await prisma.commit.updata({
    where : {id},
    data : { content }
  });
  res.send(commit);
}))

app.delete("/comments/:id",asyncHandler(async(req,res)=>{
  const {id} = req.params;
  const comment = await prisma.comment.delete({
    where : id
  });
}))


app.listen(3000,()=>{
  console.log("Server is listening on port 3000");
});

 