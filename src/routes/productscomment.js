import express from "express" 
import { PrismaClient } from "@prisma/client";
import asyncHandler from "../async-handler.js"; 

const prisma = new PrismaClient();
const ProductcommentRoutes = express.Router();     
  
 
ProductcommentRoutes
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
  }));

export default ProductcommentRoutes