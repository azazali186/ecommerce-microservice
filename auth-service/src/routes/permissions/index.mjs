import {
    verifyTokenAndAuthorization
} from "../../middleware/verifyToken.mjs";
import Permission from "../../models/permissions.mjs"

import express from 'express';
const permissionRoutes = express.Router()


// Get All Permissions

permissionRoutes.get("/", verifyTokenAndAuthorization, async (req, res) => {
    const query = req.params.new;
    try {
        const permissions = query
            ? await Permission.find().sort({ _id: -1 }).limit(1)
            : await Permission.find();
        res.status(200).json(permissions);
    } catch (err) {
        res.status(500).json(err);
    }
});

export default permissionRoutes;