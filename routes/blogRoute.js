const express = require('express')
const router = express.Router()
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");
const { uploadPhoto, blogImgResize } = require("../middleware/ImagesUpload");
const { createBlog, updateBlog, getBlog, getAllBlogs, deleteBlog, liketheBlog, disliketheBlog, uploadImages } = require("../controller/BlogCtrl");

router.post("/", authMiddleware, isAdmin, createBlog);
// always put likesand dislikes after blog post/create, if not it will not work.
router.put('/likes', authMiddleware, isAdmin, liketheBlog)
router.put('/dislikes', authMiddleware, isAdmin, disliketheBlog)
router.put("/upload/:id", authMiddleware, isAdmin, uploadPhoto.array('images', 10), blogImgResize, uploadImages) // only Admin can perform this operation
router.put("/:id", authMiddleware, isAdmin, updateBlog);
router.get("/:id", getBlog);
router.get("/", getAllBlogs);
router.delete("/:id", authMiddleware, isAdmin, deleteBlog);


module.exports = router;