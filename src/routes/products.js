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

ProductsRoute
  .route("/:id/comments")
  .post(asyncHandler(async(req,res)=> {
    const { id } = req.params;  // req.prams -> req.params
    const { content } = req.body; // 상품 ID를 받아오기
    
    if (!content) {
      return res.status(400).json({ message: "댓글입력하라고~" });
    }

    // `productId`가 있을 경우, 해당 상품과 연결
    const comment = await prisma.productComment.create({
      data: {
        content,
        product: {
          connect: { id }  // productId를 사용하여 상품과 연결
        } 
      }
    });

    res.status(201).json(comment);
  }))
  .get(asyncHandler(async(req,res)=>{ 
    const comment = await prisma.productComment.findMany({
      select : {
        id : true ,content : true , createdAt : true
      }
    })
    res.send(comment);
  }));
  

ProductsRoute
  .route("/:id/comments/:commentId")
  .patch(asyncHandler(async(req,res)=>{
    const { commentId } = req.params;
    const comment = await prisma.productComment.update({
      where : {id : commentId}
      ,data : req.body
    })
    res.send(comment);
  }))
  .delete(asyncHandler(async(req,res)=>{
    const { commentId} = req.params;
    const comment = await prisma.productComment.delete({
      where : {id : commentId}
    })
    res.status(200).json({ message: "댓글이 삭제되었습니다." });
  }))
   
  

export default ProductsRoute   