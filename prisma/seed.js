const prisma = require("../prisma");
const seed = async (numRestaurants = 3, numReservations = 5) => {
  // TODO: Create 3 restaurants with 5 reservations each
  for (let i=0; i<numRestaurants; i++) {
    // Alternative to creating an array
    /* const reservations = Array.from({ length: numReservations}, (_, j) => {
      name: `Person ${i}${j}`,
      email: `person${i}${j}@rmail.com`,
      partySize: Math.floor(Math.random() * 6) + 1
    }) */
    const reservations = [];
    for (let j=0; j<numReservations; j++) {
      const reservation = {
        name: `Person ${i}${j}`,
        email: `person${i}${j}@rmail.com`,
        partySize: Math.floor(Math.random() * 6) + 1
      }
      reservations.push(reservation);
    }
    await prisma.restaurant.create({
      data: {
        name: `Restaurant ${i+1}`,
        reservations: {
          create: reservations
        }
      }
    });
  }
};
seed()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
