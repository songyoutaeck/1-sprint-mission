import express from "express" 
import { PrismaClient } from "@prisma/client";
import asyncHandler from "../async-handler.js";

const prisma = new PrismaClient();
const ArticlecommentRoutes = express.Router(); 

ArticlecommentRoutes
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
  }));
  

export default ArticlecommentRoutes