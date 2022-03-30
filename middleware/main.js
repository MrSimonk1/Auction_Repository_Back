const auctionUserModel = require("../schemas/auctionUserSchema");
const auctionItemModel = require("../schemas/auctionItemSchema");

module.exports = {
    validateRegistration: (req, res, next) => {
        const {username, passOne, passTwo} = req.body;
        if (passOne !== passTwo) {
            return res.send({success: false, message: "Passwords should match"})
        }
        if (username.length <= 20 && username.length > 1
            && passOne.length <= 20 && passOne.length > 1
            && passTwo.length <= 20 && passTwo.length > 1) {
            return next()
        }
        res.send({success: false, message: "Username and Password length 1-20"})
    },
    validateSession: (req, res, next) => {
        const {username} = req.session;
        if (username) return next();
        res.send({success: false, message: "Please log in"})
    },
    validateCreate: (req, res, next) => {
        const {img, title, price} = req.body;
        if (!img.includes("http")) return res.send({success: false, message: "Picture needs to include `http`"})
        if (title.length < 20 || title.length > 500) return res.send({success: false, message: "Title length 20-500 symbols`"})
        if (price < 1) return res.send({success: false, message: "Add price"});
        next();
    },
    validateBid: async (req, res, next) => {
        const {id, bid} = req.body;
        const {username} = req.session;
        const item = await auctionItemModel.findOne({_id: id});
        const bidder = await auctionUserModel.findOne({username});
        if (Number(bid) <= item.currentPrice || bidder.money < Number(bid)) {
            return res.send({success: false, message: "Your bid is to low and/or you don't have enough money"});
        }
        next();
    }
}
