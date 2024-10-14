const prisma = require("../prisma");
const seed = async () => {
  // TODO: Create 3 restaurants with 5 reservations each
};
seed()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
