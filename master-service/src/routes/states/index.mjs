import {
    verifyTokenAndAuthorization
} from "../../middleware/verifyToken.mjs";
import States from "../../models/states.mjs";

import express from 'express';
const statesRoutes = express.Router()

// Update States
statesRoutes.patch("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const updatedStates = await States.update(
            req.body,
            {
                where: { id: req.params.id },
                returning: true, // To get the updated record
            }
        );

        if (updatedStates[0] === 0) {
            return res.status(404).json({ message: "States not found" });
        }

        const states = updatedStates[1][0].toJSON();

        res.status(200).json(states);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete States
statesRoutes.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const deletedCount = await States.destroy({
            where: { id: req.params.id },
        });

        if (deletedCount === 0) {
            return res.status(404).json({ message: "States not found" });
        }

        res.status(200).json({ message: "States deleted Successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get States by ID
statesRoutes.get("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const getStates = await States.findByPk(req.params.id);

        if (!getStates) {
            return res.status(404).json({ message: "States not found" });
        }

        const states = getStates.toJSON();

        res.status(200).json(states);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get All Statess
statesRoutes.get("/", verifyTokenAndAuthorization, async (req, res) => {
    const { new: isNew } = req.query;

    try {
        const statess = isNew
            ? await States.findAll({ limit: 1, order: [['createdAt', 'DESC']] })
            : await States.findAll();

        res.status(200).json(statess);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Create States
statesRoutes.post('/', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const existingStates = await States.findOne({
            where: { code: req.body.code.toUpperCase(), countryId: req.body.countryId }
        });

        if (existingStates) {
            return res.status(409).json({ error: "States Code Already Exists with this country" });
        }

        const newStates = await States.create({
            name: req.body.name.toLowerCase(),
            code: req.body.code.toUpperCase(),
            countryId: req.body.countryId,
        });

        res.status(201).json(newStates.toJSON());

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});


export default statesRoutes;