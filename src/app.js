import express from "express";
import { Prisma,PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import cors from 'cors';
import ProductsRoute from "./routes/products.js"; 
import articleRoute from "./routes/articles.js"; 
import multer from "multer";

dotenv.config();
 
const app = express(); 
app.use(cors());
app.use(express.json()); 
 
const prisma = new PrismaClient();
  
app.use("/products",ProductsRoute); 
app.use("/articles",articleRoute); 
const uploadDir = "./uploads";   
//추가해야할 내용 title,content에 포함된 단어로 검색할수 있어야함.
 
////////////////////Articles///////////////////////
 
 
/////////////////////comment//////////////////////

 
const upload = multer({dest : "./uploads"}); 
app.use("/files",express.static("uploads"));

app.post("/files",upload.single("attachment"),(req,res)=>{
  console.log(req.file);
  const path = `/files/${req.file.filename}`;
  res.json({path});
}) 

app.get("/files", (req, res) => {
  const fileName = req.query.filename;
  const  path = `${uploadDir}/${fileName}`;

  // 파일이 존재하는지 확인
  if (!fs.existsSync(path)) {
    return res.status(404).json({ error: "파일이 존재하지 않습니다." });
  }

  // 파일 내용 읽기
  const content = fs.readFileSync(path, "utf8");
  res.json({ content });
});


app.listen(3000,()=>{
  console.log("Server is listening on port 3000");
});

 