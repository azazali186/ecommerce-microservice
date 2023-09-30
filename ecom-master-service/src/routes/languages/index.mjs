import {
    verifyTokenAndAuthorization,
} from "../../middleware/verifyToken.mjs";
import Language from "../../models/language.mjs";


import express from 'express';
const languagesRoutes = express.Router()

// Update Language
languagesRoutes.patch("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        if(req.body.code){
            req.body.code = req.body.code.toUpperCase()
        }
        const updatedLanguage = await Language.update(
            req.body,
            {
                where: { id: req.params.id },
                returning: true, // To get the updated record
            }
        );

        if (updatedLanguage[0] === 0) {
            return res.status(404).json({ message: "Language not found" });
        }

        const language = updatedLanguage[1][0].toJSON();

        res.status(200).json(language);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete Language
languagesRoutes.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const deletedCount = await Language.destroy({
            where: { id: req.params.id },
        });

        if (deletedCount === 0) {
            return res.status(404).json({ message: "Language not found" });
        }

        res.status(200).json({ message: "Language deleted Successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get Language by ID
languagesRoutes.get("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const getLanguage = await Language.findByPk(req.params.id);

        if (!getLanguage) {
            return res.status(404).json({ message: "Language not found" });
        }

        const language = getLanguage.toJSON();

        res.status(200).json(language);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get All Languages
languagesRoutes.get("/", verifyTokenAndAuthorization, async (req, res) => {
    const { new: isNew } = req.query;

    try {
        const languages = isNew
            ? await Language.findAll({ limit: 1, order: [['createdAt', 'DESC']] })
            : await Language.findAll();

        res.status(200).json(languages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Create Language
languagesRoutes.post('/', verifyTokenAndAuthorization, async (req, res) => {
    try {
        let existingLanguage = await Language.findOne({
            where: { code: req.body.code.toUpperCase() }
        });

        if (existingLanguage) {
            return res.status(409).json({ error: "Language Code Already Exists." });
        }

        existingLanguage = await Language.findOne({
            where: { name: req.body.name }
        });

        if (existingLanguage) {
            return res.status(409).json({ error: "Language Name Already Exists." });
        }

        const newLanguage = await Language.create({
            name: req.body.name.toLowerCase(),
            code: req.body.code.toUpperCase(),
        });

        res.status(201).json(newLanguage.toJSON());

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});


export default languagesRoutes;