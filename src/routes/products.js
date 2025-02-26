import express from "express" 
import { PrismaClient } from "@prisma/client";
import asyncHandler from "../async-handler.js";
 


const prisma = new PrismaClient();
const ProductsRoute = express.Router();     
  
ProductsRoute
  .route('/')
  .post(asyncHandler(async(req,res)=>{
    const {name,description,price,tags} = req.body
    const Newdata = await prisma.product.create({
      data :{
      name, description,price, tags}
    })
    res.status(201).json({
      message : "products created successfully",
      data : Newdata
    }) 
  }))
  //추가해야할 내용 title,content에 포함된 단어로 검색할수 있어야함.
  .get(asyncHandler(async (req, res) => {
      const { offset = 0, limit = 10 , search } = req.query;
      const orderBy = {createdAt : "desc"}; 
      let where = {};
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
  
ProductsRoute
  .route("/:id")
  .get(asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const product = await prisma.product.findUnique({
      where : {
        id :id
      },
      select : {
        id: true,
        name: true,
        description: true,
        price: true,
        tags: true,
        createdAt: true,
      }
    });
    res.json( {data: product});
  }))
  
  .patch(asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const product = await prisma.product.update({
      where : {id},
      data : req.body,
    });
    res.send(product);
  }))

  .delete(asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const product = await prisma.product.delete({
      where:{id}, 
    })
    res.send("Success delete");
  }))  
  
  

export default ProductsRoute   