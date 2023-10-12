import {
    verifyTokenAndAuthorization
} from "../../middleware/verifyToken.mjs";
import CartItem from "../../models/cartItem.mjs";
import Cart from "../../models/cart.mjs";
import Order from "../../models/order.mjs";

import express from 'express';
const ordersRoutes = express.Router()

// Update Order
ordersRoutes.patch("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const updatedOrder = await Order.update(
            req.body,
            {
                where: { id: req.params.id },
                returning: true, // To get the updated record
            }
        );

        if (updatedOrder[0] === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        const order = updatedOrder[1][0].toJSON();

        res.status(200).json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete Order
ordersRoutes.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const deletedCount = await Order.destroy({
            where: { id: req.params.id },
        });

        if (deletedCount === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Order deleted Successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get Order by ID
ordersRoutes.get("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const getOrder = await Order.findById({
            id: req.params.id
        });

        if (!getOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        const order = getOrder.toJSON();

        res.status(200).json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get All Orders
ordersRoutes.get("/", verifyTokenAndAuthorization,paginate(Order), async (req, res) => {
    const { new: isNew } = req.query;

    try {
        res.status(200).json(req.paginatedResults);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Create Order
ordersRoutes.post('/', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const cart = Cart.findById(req.body.cartId).populate('cartItem')
        if(!cart){
            res.status(404).json({
                message: "Incorrect cart id"
            })
            return false
        }
        const newOrder = new Order();
        newOrder.items = cart.CartItem
        await newOrder.save()
        res.status(201).json(newOrder.toJSON());
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});


export default ordersRoutes;