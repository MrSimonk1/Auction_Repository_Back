const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
require("dotenv").config();


app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

app.use((req, res, next) => {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});



app.use(express.json());

mongoose.connect(process.env.MONGO_KEY)
    .then(res => {
        console.log("connected to db")
    }).catch(e => {
    console.log(e)
})

const router = require("./routes/main");
app.use("/", router);

const http = require("http").createServer(app);

http.listen(5000, () => {
    console.log("port 5000")
})

const io = require("socket.io")(http, {
    cors: {
        origin: "http://localhost:3000"
    }
})

const itemSchema = require("./schemas/auctionItemSchema");
const userSchema = require("./schemas/auctionUserSchema")

let usersInAuction = [];

io.on("connection", socket => {

    socket.on("getPost", async id => {
        const item = await itemSchema.findOne({_id: id});
        io.emit("setPost", item);
    });

    socket.on("getCount", res => {
        console.log(usersInAuction.length);
        io.emit("setCount", usersInAuction.length)
    })

    socket.on("getUserOnAuction", async info => {
        const oneUser = {
            username: info.getUser.username,
            socketID: socket.id
        }

        let isInAuctionPage = false;
        if (usersInAuction.length === 0) {
            usersInAuction.push(oneUser)
        } else {
            usersInAuction.map(x => {
                if (x.username === oneUser.username) isInAuctionPage = true;
            })
            if (!isInAuctionPage) usersInAuction.push(oneUser);
        }

        console.log(usersInAuction, oneUser);

        let userWithLastBet = null;

        usersInAuction.map(x => {
            if (info.bids.length !== 0 && x.username === info.bids[0].username) {
                userWithLastBet = x;
            }
        })

        async function findAndGiveBackMoney() {
            const findUser = await userSchema.findOne({username: userWithLastBet.username});
            findUser.money += Number(info.bids[0].price);
            await userSchema.replaceOne({username: userWithLastBet.username}, findUser, {new: true});
            io.to(userWithLastBet.socketID).emit("setUser", findUser);
        }

        if (userWithLastBet) {
            findAndGiveBackMoney();
        }

    });

    socket.on("disconnect", socket => {
        console.log(socket.id);
        let user = null;
        usersInAuction.map(x => {
            if (x.socketID === socket.id) user = x;
        })
        if (user) {
            const index = usersInAuction.indexOf(user);
            usersInAuction.splice(index, 1)
        }
    })
})
