import express from "express" 
import { PrismaClient } from "@prisma/client";
import asyncHandler from "../async-handler.js"; 


const prisma = new PrismaClient();
const articleRoute = express.Router();     
  
articleRoute
  .route("/")
  .post(asyncHandler(async(req,res)=>{
    const {title, content } = req.body
    const newdata = await prisma.article.create({
      data : {title, content }
    });
    res.status(201).json( {data : newdata});
  }))
  .get(asyncHandler(async(req,res)=>{
    const { offset = 0, limit = 10 , search } = req.query;
    const orderBy = {createdAt : "des"};
    let where = {};
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
  }));


articleRoute 
  .route("/:id")
  .get(asyncHandler(async(req,res)=>{
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
  .patch(asyncHandler(async(req,res)=>{
  const {id} = req.params
  const article = await prisma.article.update({
    where : {id},
    data :  req.body
  });
  res.send(article);
  }))
  .delete(asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const article = await prisma.article.delete({
      where : {id}, 
    });
    res.send("article");
  }));

articleRoute
  .route("/:id/comments")
  .post(asyncHandler(async(req,res)=>{
    const { id } = req.params;
    const { content } = req.body
    if(!content){
      return res.status(400).json({message : "댓글입력하라고~"})
    }
    const comment = await prisma.articleComment.create({
      data : {
        content,
        article : {
          connect : {id}
        },
      }
    });
    res.status(201).send(comment);
  }))  
  .get(asyncHandler(async(req,res)=>{ 
    const comment = await prisma.articleComment.findMany({
      select : {
        id : true ,content : true , createdAt : true
      }
    })
    res.send(comment);
  }));


articleRoute
  .route("/:id/comments/:commentId")
  .patch(asyncHandler(async(req,res)=>{
    const { commentId } = req.params;
    const comment = await prisma.articleComment.update({
      where : {id : commentId}
      ,data : req.body
    })
    res.send(comment);
  }))
  .delete(asyncHandler(async(req,res)=>{
    const { commentId} = req.params;
    const comment = await prisma.articleComment.delete({
      where : {id : commentId}
    })
    res.status(200).json({ message: "댓글이 삭제되었습니다." });
  }))
 
  

  export default  articleRoute