import express from 'express';
const authRoutes = express.Router();
import User from '../../models/user.mjs';
import Role from '../../models/roles.mjs';
import Permissions from '../../models/permissions.mjs';
import CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';


// Register User

authRoutes.post('/register', async (req, res) => {
    try {
        let users = await User.findOne({
            where: {
                email: req.body.email.toLowerCase()
            }
        })
        if (users) {
            res.status(409).json({
                "error": "email already exist."
            })
            return false
        }
        let role = await Role.findOne({
            where: {
                "name": req.body.role.toLowerCase(),
            }
        })
        const newUser = new User({
            email: req.body.email.toLowerCase(),
            password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SECRET).toString(),
            roleId: role.id,
        })
        const createdUser = await newUser.save()
        res.status(201).json(createdUser)

    } catch (err) {
        res.status(500).json(err)
    }
});

authRoutes.post('/login', async (req, res) => {
    try {

        let users = await User.findOne({
            where: { email: req.body.email.toLowerCase() },
            include: [
              {
                model: Role,
                attributes: ['id', 'name', 'isActive'],
                include: [
                  {
                    model: Permissions,
                    attributes: ['id', 'path', 'name', 'service'],
                    through: { attributes: [] }, // This will exclude all attributes from the join table
                  },
                ],
              },
            ],
          });
          
        users = users.dataValues
        
        !users && res.status(401).json({ message: 'Wrong email......' })
        const OriginalPassword = CryptoJS.AES.decrypt(users.password, process.env.PASS_SECRET).toString(CryptoJS.enc.Utf8)

        OriginalPassword !== req.body.password && res.status(401).json({ message: 'Wrong Password and email combination' })
        
        const roleData = users.Role.dataValues;
        
        const permissionsData = await Permissions.findAll({
            attributes: ['id', 'path', 'name', 'service']
          });
        const payload = {
            id: users.id,
            email: users.email,
            role: roleData.name,
        }
        const accessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "30m" },
        )
        users.accessToken = accessToken;
        const { password, __v, ...others } = users

        res.status(200).json({ user: { ...others }, permissions: permissionsData, token: accessToken })
    } catch (err) {
        res.status(500).json(err)
    }
});

export default authRoutes