import {
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
} from "../../middleware/verifyToken.mjs";
import User from '../../models/user.mjs'
import Role from '../../models/roles.mjs'
import CryptoJS from 'crypto-js'
import express from 'express';
const usersRoutes = express.Router();

// User Stats

usersRoutes.get("/stats", verifyTokenAndAdmin, async (req, res) => {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

    try {
        const data = await User.aggregate([
            { $match: { createdAt: { $gte: lastYear } } },
            {
                $project: {
                    month: { $month: "$createdAt" },
                },
            },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: 1 },
                },
            },
        ]);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update user

usersRoutes.patch("/:id", verifyTokenAndAuthorization, async (req, res) => {
    if (req.body.password) {
        req.body.password = CryptoJS.AES.encrypt(
            req.body.password,
            process.env.PASS_SEC
        ).toString();
    }
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            { new: true }
        );

        const { password, ...others } = updatedUser._doc;

        res.status(200).json(others);
    } catch (err) {
        res.status(500).json(err);
    }
});

// delete user

usersRoutes.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({
            message: "User deleted Successfully"
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

// get user

usersRoutes.get("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const updatedUser = await User.findById(req.params.id);

        const { password, ...others } = updatedUser._doc;

        res.status(200).json(others);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get All Users

usersRoutes.get("/", verifyTokenAndAuthorization, async (req, res) => {
    const query = req.params.new;
    try {
        const users = query
            ? await User.find().sort({ _id: -1 }).limit(1)
            : await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});


// Create Users 

usersRoutes.post('/', verifyTokenAndAdmin, async (req, res) => {
    try {

        let users = await User.findOne({
            email: req.body.email.toLowerCase()
        })

        if (users) {
            res.status(409).json({
                "error": "email already exist."
            })
            return false
        }
        let role = await Role.findOne({
            "name": req.body.role.toLowerCase(),
        })
        const newUser = new User({
            email: req.body.email.toLowerCase(),
            password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC).toString(),
            role: role._id,
        })
        const createdUser = await newUser.save()
        res.status(201).json(createdUser)

    } catch (err) {
        res.status(500).json(err)
    }
});


export default usersRoutes;