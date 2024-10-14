const express = require("express");
const router = express.Router();
module.exports = router;

const prisma = require("../prisma");

router.get('/', async (req, res, next) => {
    try {
        const restaurants = await prisma.restaurant.findMany();
        res.json(restaurants);
    } catch (e) {
        next(e);
    }
})

router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        const restaurant = await prisma.restaurant.findUniqueOrThrow({
            where: { id: +id },
            include: { reservations: true }
        })
        res.json(restaurant);
    } catch (e) {
        next(e);
    }
})

router.post('/:id/reservations', async (req, res, next) => {
    const { id } = req.params;
    const { name, email, partySize } = req.body;
    try {
        const reservation = await prisma.reservation.create({
            data: {
                name: name,
                email: email,
                partySize: +partySize,
                restaurantId: +id,
            }
        });
        res.status(201).json(reservation);
    } catch (e) {
        next(e);
    }
})