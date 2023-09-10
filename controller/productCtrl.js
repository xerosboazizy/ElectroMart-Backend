const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler")
const slugify = require("slugify")
const fs = require("fs");
const User = require("../models/userModel")
const validateMongoDbId = require("../Utils/validatemongodbID")
const { cloudinaryUploadImg, cloudinaryDeleteImg } = require('../Utils/cloudinary.js')


const createProduct = asyncHandler(async (req, res) => {
    // product post route
    if (req.body.title) {
        req.body.slug = slugify(req.body.title)
    }
    try {
        const newProduct = await Product.create(req.body);
        res.json(newProduct)
    } catch (error) {
        throw new Error(error)
    }
});

// update product
const updateProduct = asyncHandler(async (req, res,) => {
    const id = req.params;
    validateMongoDbId(id);
    try {

        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const updateAProduct = await Product.findOneAndUpdate({ id: req.params._id },
            req.body,

            {
                new: true,


            });
        res.json(updateAProduct);

    } catch (error) {
        throw new Error(error);
    }

});



// delete a product

const deleteProduct = asyncHandler(async (req, res) => {
    const id = req.params;
    validateMongoDbId(id);
    try {
        const deleteAProduct = await Product.findOneAndDelete({ id: req.params._id })
        res.json(deleteAProduct);

    } catch (error) {
        throw new Error(error)
    }
});


//get a product route
const getaProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const findProduct = await Product.findById(id);
        res.json(findProduct);
    } catch (error) {
        throw new Error(error)
    }
});

//get all product route

const getAllProduct = asyncHandler(async (req, res) => {

    try {
        // product filtering
        const queryObject = { ...req.query };
        //excluding fields while filtering
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach((el) => delete queryObject[el]); // note 'excludeFields' is modified
        console.log(queryObject)
        let queryString = JSON.stringify(queryObject);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        let query = Product.find(JSON.parse(queryString));

        //Product Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ')
            query = query.sort(sortBy)
        } else {
            query = query.sort('-createdAt')
        }
        //limiting fields while filtering
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields)
        } else {
            query = query.select('-__v')
        }

        // pagination

        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        if (req.query.page) {
            const productCount = await Product.countDocuments();
            if (skip >= productCount) throw new Error("This page dose not exist")
        }
        console.log(page, limit, skip)

        const product = await query
        res.json(product)
    } catch (error) {
        throw new Error(error)
    }
})


// wishlist functionality
const addToWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { prodId } = req.body;
    try {
        const user = await User.findById(_id);
        // check if product is available before adding to wishlist
        const alreadyadded = user.wishlist.find((id) => id.toString() === prodId);
        //if product is already added to wishlist do..... this update
        if (alreadyadded) {
            let user = await User.findByIdAndUpdate(
                _id,
                {
                    $pull: { wishlist: prodId },
                },
                {
                    new: true,
                }
            );
            res.json(user);
            // otherwise post rodct to wishlis
        } else {
            let user = await User.findByIdAndUpdate(
                _id,
                {
                    $push: { wishlist: prodId },
                },
                {
                    new: true,
                }
            );
            res.json(user);
        }
    } catch (error) {
        throw new Error(error);
    }
});

// rating functionality

const rating = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { star, prodId, comment } = req.body;
    try {
        const product = await Product.findById(prodId);
        // find out if product have already been rated by user
        let alreadyRated = product.ratings.find(
            (userId) => userId.postedby.toString() === _id.toString()
        );
        // if already rated do this
        if (alreadyRated) {
            const updateRating = await Product.updateOne(
                {
                    ratings: { $elemMatch: alreadyRated },
                },
                {
                    $set: { "ratings.$.star": star, "ratings.$.comment": comment },
                },
                {
                    new: true,
                }
            );
        } else {
            const rateProduct = await Product.findByIdAndUpdate(
                prodId,
                {
                    $push: {
                        ratings: {
                            star: star,
                            comment: comment,
                            postedby: _id,
                        },
                    },
                },
                {
                    new: true,
                }
            );
        }
        // get all ratiung functionality
        const getallratings = await Product.findById(prodId);
        let totalRating = getallratings.ratings.length;
        let ratingsum = getallratings.ratings
            .map((item) => item.star)
            .reduce((prev, curr) => prev + curr, 0);
        let actualRating = Math.round(ratingsum / totalRating);
        let finalproduct = await Product.findByIdAndUpdate(
            prodId,
            {
                totalrating: actualRating,
            },
            { new: true }
        );
        res.json(finalproduct);
    } catch (error) {
        throw new Error(error);
    }
});


// upload product image
const uploadImages = asyncHandler(async (req, res) => {

    try {
        const uploader = (path) => cloudinaryUploadImg(path, "images");
        const urls = [];
        const files = req.files;
        for (const file of files) {
            const { path } = file;
            const newpath = await uploader(path);
            console.log(newpath);
            urls.push(newpath);
            fs.unlinkSync(path);
        }
        const images = urls.map((file) => {
            return file;
        })
        res.json(images);

    } catch (error) {
        throw new Error(error);
    }
});


const deleteImages = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = cloudinaryDeleteImg(id, "images");
        res.json({ message: "Deleted" });
    } catch (error) {
        throw new Error(error);
    }
})


module.exports = { createProduct, getaProduct, getAllProduct, updateProduct, deleteProduct, addToWishlist, rating, uploadImages, deleteImages };