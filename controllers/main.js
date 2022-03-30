const auctionUserModel = require("../schemas/auctionUserSchema");
const auctionItemModel = require("../schemas/auctionItemSchema");
const bcrypt = require("bcrypt");

module.exports = {
    register: async (req, res) => {
        const {username, passOne} = req.body;
        const hash = await bcrypt.hash(passOne, 10);
        const findUser = await auctionUserModel.findOne({username});
        if (!findUser) {
            const user = new auctionUserModel();
            user.username = username;
            user.password = hash;

            user.save().then(res => {
                console.log("user saved")
            })

            return res.send({success: true, message: "Registered"})
        }
        res.send({success: false, message: "Username exists"})
    },
    login: async (req, res) => {
        const {username, password} = req.body;
        console.log(username, password);

        const findUser = await auctionUserModel.findOne({username: username});
        if (findUser) {
            const compared = await bcrypt.compare(password, findUser.password);
            if (compared) {
                req.session.username = username;
                console.log(req.session.username);
                return res.send({success: true, message: "Logged in", findUser})
            }
        }
        res.send({success: false, message: "Wrong username and/or password"})
    },
    logout: (req, res) => {
        req.session = null;
        res.send({success: true, message: "Logged out", user: null})
    },
    create: (req, res) => {
        const {username} = req.session
        console.log(username)
        const {img, title, price, duration} = req.body;

        const item = new auctionItemModel;
        item.owner = req.session.username;
        item.image = img;
        item.title = title;
        item.startPrice = price;
        item.currentPrice = price;
        item.endTime = Date.now() + Number(duration);
        console.log(Date.now(), Date.now() + Number(duration))

        item.save().then(res => {
            console.log("Item saved")
        })
        res.send({success: true, message: "Created"})
    },
    getAll: async (req, res) => {
        const allPosts = await auctionItemModel.find({});
        const {username} = req.session;
        res.send({success: true, message: "all", allPosts, username})
    },
    singlePost: async (req, res) => {
        const {id} = req.params;
        const post = await auctionItemModel.findOne({_id: id});
        res.send({success: true, post});
    },
    makeBid: async (req, res) => {
        const {id, bid} = req.body;
        const {username} = req.session;

        const item = await auctionItemModel.findOne({_id: id});
        const bidInfo = {
            username,
            price: bid,
            time: Date.now(),
        }

        if (item.bids.length === 0) {
            item.bids.unshift(bidInfo);
            item.currentPrice = Number(bid);
            const bidder = await auctionUserModel.findOne({username: username});   
            bidder.money -= Number(bid);
            await auctionItemModel.replaceOne({_id:id}, item, {new: true});
            await auctionUserModel.replaceOne({username}, bidder, {new: true});
            return res.send({success: true, message: "Made a bid", bidder, item})
        }
        if (item.bids.length !== 0) {
            const latestBidder = item.bids[0];
            const currentBidder = await auctionUserModel.findOne({username: latestBidder.username});
            currentBidder.money += Number(latestBidder.price);
            await auctionUserModel.replaceOne({username: latestBidder.username}, currentBidder, {new: true})
            const bidder = await auctionUserModel.findOne({username: username});
            console.log(bidder, currentBidder, latestBidder);
            bidder.money -= Number(bid);
            item.bids.unshift(bidInfo);
            item.currentPrice = Number(bid);
            await auctionItemModel.replaceOne({_id:id}, item, {new: true});
            await auctionUserModel.replaceOne({username}, bidder, {new: true});
            return res.send({success: true, message: "Made a bid", bidder, item})    
        }
    }
}