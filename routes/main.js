const express = require("express");
const {register, login, logout, create, getAll, singlePost, makeBid} = require("../controllers/main");
const {validateRegistration, validateCreate, validateSession, validateBid} = require("../middleware/main");
const router = express.Router();

router.post("/register", validateRegistration, register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/create", validateCreate, validateSession, create);
router.get("/get-all", validateSession, getAll);
router.get("/single/:id", singlePost);
router.post("/bid", validateSession, validateBid, makeBid)

module.exports = router;