//authentication handling middleware file
const User = require("../models/userModel")
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')


// middlware to check for token
const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;
    if (req?.headers.authorization?.startsWith("Bearer")) {
        token = req.headers?.authorization.split(" ")[1];
        try {
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
                const user = await User.findById(decoded?.id);
                req.user = user;
                next();
            }
        } catch (error) {
            throw new Error("Not Authorized token expired, please Login again")
        }
    } else {
        throw new Error("There is no token attached to header")
    }
});


//middleware to check if user is admin

const isAdmin = asyncHandler(async (req, res, next) => {
    const { email } = req.user;
    const adminUser = await User.findOne({ email });
    if (adminUser.role !== "admin") {
        throw new Error("You are not an Admin ")
    } else {
        next();
    }
})

module.exports = { authMiddleware, isAdmin };