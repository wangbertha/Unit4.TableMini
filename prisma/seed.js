const prisma = require("../prisma");
const seed = async () => {
  // TODO: Create 3 restaurants with 5 reservations each
  for (let i=0; i<3; i++) {
    const reservations = [];
    for (let j=0; j<5; j++) {
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
