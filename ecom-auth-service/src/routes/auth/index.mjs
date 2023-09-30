import express from "express";
const authRoutes = express.Router();
import User from "../../models/user.mjs";
import Role from "../../models/roles.mjs";
import Permissions from "../../models/permissions.mjs";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import { sendProfileToProfileService } from "../../rabbitMq/sendProfileToProfileService.mjs";

// Register User

authRoutes.post("/register", async (req, res) => {
    try {
      const { email, password, role: roleName, name } = req.body;
  
      // Check if user already exists
      const existingUser = await User.findOne({
        where: { email: email.toLowerCase() },
      });
      if (existingUser) {
        return res.status(409).json({ error: "Email already exists." });
      }
  
      // Find the role for the user
      const role = await Role.findOne({
        where: { name: roleName.toLowerCase() },
      });
      if (!role) {
        return res.status(400).json({ error: "Role not found." });
      }
  
      // Encrypt password and create user
      const encryptedPassword = CryptoJS.AES.encrypt(
        password,
        process.env.PASS_SECRET
      ).toString();
      const newUser = new User({
        email: email.toLowerCase(),
        password: encryptedPassword,
        roleId: role.id,
      });
      const createdUser = await newUser.save();
  
      // Send profile to profile service
      const profileData = { userId: createdUser.id, name };
      const profileResponse = await sendProfileToProfileService(profileData);
  
      if (!profileResponse || !JSON.parse(profileResponse).userProfile) {
        throw new Error("Profile creation failed.");
      }
  
      createdUser.dataValues.profile = JSON.parse(profileResponse).userProfile; // Assuming you're using Sequelize. Adjust if needed.
  
      res.status(201).json(createdUser);
  
    } catch (err) {
      console.error("Registration error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });
  

authRoutes.post("/login", async (req, res) => {
  try {
    let users = await User.findOne({
      where: { email: req.body.email.toLowerCase() },
      include: [
        {
          model: Role,
          attributes: ["id", "name", "isActive"],
          include: [
            {
              model: Permissions,
              attributes: ["id", "path", "name", "service"],
              through: { attributes: [] }, // This will exclude all attributes from the join table
            },
          ],
        },
      ],
    });

    users = users.dataValues;

    !users && res.status(401).json({ message: "Wrong email......" });
    const OriginalPassword = CryptoJS.AES.decrypt(
      users.password,
      process.env.PASS_SECRET
    ).toString(CryptoJS.enc.Utf8);

    OriginalPassword !== req.body.password &&
      res.status(401).json({ message: "Wrong Password and email combination" });

    const roleData = users.Role.dataValues;

    const permissionsData = await Permissions.findAll({
      attributes: ["id", "path", "name", "service"],
    });
    const payload = {
      id: users.id,
      email: users.email,
      role: roleData.name,
    };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "30m",
    });
    users.accessToken = accessToken;

    const profileData = {
      userId: users.id,
    };

    const profile = await sendProfileToProfileService(profileData);

    users.profile = JSON.parse(profile).userProfile;

    const { password, __v, ...others } = users;
    res
      .status(200)
      .json({
        user: { ...others },
        permissions: permissionsData,
        token: accessToken,
      });
  } catch (err) {
    res.status(500).json(err);
  }
});

export default authRoutes;
