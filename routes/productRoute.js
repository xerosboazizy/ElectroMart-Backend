const express = require("express");
const { createProduct, getaProduct, getAllProduct, updateProduct, deleteProduct, addToWishlist, rating, uploadImages, deleteImages } = require("../controller/productCtrl");
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware");
const { uploadPhoto, productImgResize } = require("../middleware/ImagesUpload");
const router = express.Router();

router.post('/', authMiddleware, isAdmin, createProduct) // only Admin can perform this operation
router.put("/upload/", authMiddleware, isAdmin, uploadPhoto.array('images', 10), productImgResize, uploadImages) // only Admin can perform this operation
router.get('/:id', getaProduct)
router.put('/wishlist', authMiddleware, addToWishlist) // wishlist route
router.put('/rating', authMiddleware, rating)
router.put('/:id', authMiddleware, isAdmin, updateProduct); // only Admin can perform this operation
router.delete('/:id', authMiddleware, isAdmin, deleteProduct); // only Admin can perform this operation
router.delete('/delete-img/:id', authMiddleware, isAdmin, deleteImages); // only Admin can perform this operation

router.get('/', getAllProduct);



module.exports = router;