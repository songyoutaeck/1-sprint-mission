import axios from 'axios';

// ✅ Axios 인스턴스 생성
const instance = axios.create({
    baseURL: "https://panda-market-api-crud.vercel.app/articles",  
    timeout: 10000,
});

// ✅ 게시글 목록 가져오기
export async function getArticleList(page = 1 , pageSize  = 10, keyword = "") {
    try {
        const res = await instance.get("/", { params: { page, pageSize, keyword } });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

// ✅ 개별 게시글 가져오기
export async function getArticle(id) {
    try {
        const res = await instance.get(`/${id}`);  // ⬅️ `/` 추가
        return res.data;
    } catch (err) {  // ⬅️ `Err` → `err` 오타 수정
        handleError(err);
    }
}

// ✅ 게시글 생성
export async function createArticle(title, content, image) {
    try {
        const res = await instance.post("/", { title, content, image });
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

// ✅ 게시글 수정
export async function patchArticle(id, title, content, image) {
    try {
        const res = await instance.patch(`/${id}`, { title, content, image });  // ⬅️ `id`는 URL에 추가해야 함
        return res.data;
    } catch (err) {
        handleError(err);
    }
}

// ✅ 게시글 삭제 (오타 수정: `DeletArticle` → `deleteArticle`)
export async function deleteArticle(id) {
    try {
        const res = await instance.delete(`/${id}`);
        return res.data;
    } catch (err) {
        handleError(err);
    } 
}

// ✅ 서비스 객체로 묶어서 내보내기 (오타 수정)
const articleService = {
    getArticleList,
    getArticle,
    createArticle,
    patchArticle,
    deleteArticle, // ⬅️ `DeletArticle` → `deleteArticle`
};

export default articleService;

// ✅ 공통 에러 핸들링 함수
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
