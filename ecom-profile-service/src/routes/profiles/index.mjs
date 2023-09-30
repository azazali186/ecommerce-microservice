import { verifyTokenAndAuthorization } from "../../middleware/verifyToken.mjs";
import Profile from "../../models/profile.mjs";

import express from 'express';
const profilesRoutes = express.Router()

// Update Profile
profilesRoutes.patch("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const updatedProfile = await Profile.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedProfile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.status(200).json(updatedProfile);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete Profile
profilesRoutes.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const result = await Profile.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.status(200).json({ message: "Profile deleted Successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get Profile by ID
profilesRoutes.get("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.id);

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.status(200).json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get All Profiles
profilesRoutes.get("/", verifyTokenAndAuthorization, async (req, res) => {
    const { new: isNew } = req.query;

    try {
        const profiles = isNew
            ? await Profile.find().sort({ createdAt: -1 }).limit(1)
            : await Profile.find();

        res.status(200).json(profiles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Create Profile
profilesRoutes.post('/', verifyTokenAndAuthorization, async (req, res) => {
    try {
        let existingProfile = await Profile.findOne({ userId: req.body.userId });

        if (existingProfile) {
            return res.status(409).json({ error: "Profile Already Exists." });
        }

        const newProfile = new Profile({
            name: req.body.name,
            userId: req.body.userId,
            dob: req.body.dob,
            images: req.body.image
        });
        
        await newProfile.save();
        res.status(201).json(newProfile);
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default profilesRoutes;
