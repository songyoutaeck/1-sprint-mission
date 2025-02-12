import axios from 'axios';

const instance = axios.create({
    baseURL : "https://panda-market-api-crud.vercel.app/products",
    timeout : 10000,
});

//상품 목록 가져오기기
async function getProductList(page = 1 , pageSize = 10,keyword = ""){
    try{
        const res = await instance.get("/",{params : {page,pageSize,keyword}});
        return res.data;
    }
    catch (err){
        handleError(err);
    }
}

//개별상품 가져오기-> 특정 id를 가진 정보를 가져오는 함수!
async function getProduct(id){
    try{
        const res = await instance.get(`/${id}`);
        return res.data;
    }
    catch (err){
        handleError(err);
    }
}

async function createProduct(name,description,price,tags,images){
    try{
        const res = await instance.post("/",{name,description,price,tags,images})
        return res.data;
    }
    catch (err){
        handleError(err);
    }
}

async function patchProduct(id,name,description,price,tags,images){
    try{
        const res = await instance.patch(`${id}`,{name,description,price,tags,images});
        return res.data;
    }
    catch (err){
        handleError(err);
    }
}


async function deleteProduct(id){
    try{
        const res = await instance.delet(`${id}`);
        return res.data;
    }
    catch (err){
        handleError(err);
    }
}

function handleError(err) {
    if (err.response) {
      console.log("statusCode:", err.response.status);
      console.log("response data:", err.response.data);
    } else if (err.request) {
      console.log("No response received:", err.request);
    } else {
      console.log("Error:", err.message);
    }
}

const productService = {
    getProductList,
    getProduct,
    createProduct,
    patchProduct,
    deleteProduct,
};
export default productService;










