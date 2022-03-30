const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const auctionItemSchema = new Schema({
    owner: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    startPrice: {
        type: Number,
        required: true
    },
    currentPrice: {
        type: Number,
        required: true
    },
    endTime: {
        type: Number,
        required: true
    },
    bids: {
        type: Array,
        default: [],
    }
})

module.exports = mongoose.model("auctionItemModels", auctionItemSchema)