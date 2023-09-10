// validating mongodb id for users
const mongoose = require('mongoose');
const validateMongoDbId = (id) => {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new Error("This id is invalid or not found");

};

module.exports = validateMongoDbId;