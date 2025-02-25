import express from "express" 

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
  }));
  
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