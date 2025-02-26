import express from "express" 
import { PrismaClient } from "@prisma/client";
import asyncHandler from "../async-handler.js"; 

const prisma = new PrismaClient();
const commentRoutes = express.Router();     
  
commentRoutes
  .route("/")
  .post(asyncHandler(async(req,res)=>{
  const {content, productId } = req.body;
  const newdata = await prisma.comment.create({
    data : {content, productId}
  });
  res.status(201).send(newdata);
  }));


commentRoutes
  .route("/:id")
  .patch(asyncHandler(async(req,res)=>{
  const {id} = req.params;
  const commit = await prisma.comment.update({
    where : {id},
    data : { content , productId }
  });
  res.send(commit);
}))
  .delete(asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const comment = await prisma.comment.delete({
      where : id
    });
  }))

export default commentRoutes