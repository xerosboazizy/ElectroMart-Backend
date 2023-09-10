const express = require("express");
const dbConnect = require("./config/DbConnect");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const app = express()
const dotenv = require('dotenv').config()
const PORT = process.env.PORT || 4000;
const authRoute = require('./routes/authRoute');
const productRoute = require('./routes/productRoute')
const blogRouter = require('./routes/blogRoute')
const categoryRouter = require('./routes/ProductcategoryRoute')
const blogcatRouter = require('./routes/BlogcatRoute')
const brandRouter = require('./routes/BrandRoute')
const colorRouter = require('./routes/colorRoute')
const couponRouter = require('./routes/CouponRoute')
const enquiryRouter = require("./routes/EnquiryRoute");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan")
app.use(express.json())

dbConnect();

app.use(morgan("dev"))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())


app.use('/api/user', authRoute)
app.use('/api/product', productRoute)
app.use('/api/blog', blogRouter)
app.use('/api/category', categoryRouter)
app.use('/api/blogcategory', blogcatRouter)
app.use('/api/brand', brandRouter)
app.use('/api/coupon', couponRouter)
app.use('/api/color', colorRouter)
app.use("/api/enquiry", enquiryRouter);

// error handling use *make sure its below other use*
app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`server running at ${PORT}`)
})













