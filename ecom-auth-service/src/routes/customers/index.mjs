import {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} from "../../middleware/verifyToken.mjs";
import User from "../../models/user.mjs";
import Role from "../../models/roles.mjs";
import CryptoJS from "crypto-js";
import express from "express";
import { Op, fn, col } from "sequelize";
import { sendProfileToProfileService } from "../../rabbitMq/sendProfileToProfileService.mjs";
const membersRoutes = express.Router();

// User Stats

membersRoutes.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await User.findAll({
      attributes: [
        [fn('MONTH', col('createdAt')), 'month'],
        [fn('COUNT', col('User.id')), 'total']
      ],
      include: [{
        model: Role,
        attributes: [],  // empty attributes to exclude the Role fields in the result
        where: {
          name: 'customer'
        }
      }],
      where: {
        createdAt: {
          [Op.gte]: lastYear
        }
      },
      group: [fn('MONTH', col('createdAt'))],
      order: [fn('MONTH', col('createdAt'))]
    });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update user

membersRoutes.patch("/:id", verifyTokenAndAuthorization, async (req, res) => {
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

membersRoutes.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "Member deleted Successfully",
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// get user

membersRoutes.get("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const updatedUser = await User.findById(req.params.id);

    const { password, ...others } = updatedUser._doc;

    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get All Users

membersRoutes.get("/", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Role,
          attributes: ["id", "name", "isActive"],
          where: {
            name: "customer",
          },
        },
      ],
    });
    console.log("req get here ", users);
    
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Create Users

membersRoutes.post("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    let users = await User.findOne({
      email: email.toLowerCase(),
    });

    if (users) {
      res.status(409).json({
        error: "email already exist.",
      });
      return false;
    }
    let role = await Role.findOne({
      name: 'customer',
    });
    const newUser = new User({
      email: email.toLowerCase(),
      password: CryptoJS.AES.encrypt(
        password,
        process.env.PASS_SEC
      ).toString(),
      role: role._id,
    });
    const createdUser = await newUser.save();
    // Send profile to profile service
    const profileData = { userId: createdUser.id, name };
    const profileResponse = await sendProfileToProfileService(profileData);

    if (!profileResponse || !JSON.parse(profileResponse).userProfile) {
      throw new Error("Profile creation failed.");
    }

    createdUser.dataValues.profile = JSON.parse(profileResponse).userProfile;
    
    
    res.status(201).json(createdUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

export default membersRoutes;
