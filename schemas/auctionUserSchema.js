const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const auctionUserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    money: {
        type: Number,
        default: 1000
    },
    auctions: {
        type: Array,
        default: []
    }
})

module.exports = mongoose.model("auctionUserModel", auctionUserSchema);