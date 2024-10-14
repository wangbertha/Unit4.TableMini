# Guided Practice - Table Mini

In this guided practice, you'll be building out an API that helps restaurants keep track of their reservations. Customers will be able to make reserve a table at a restaurant of their choice while waiting in line!

The **solution** branch contains documented solution code. The commit history of that branch follows the instructions below.

## Getting Started

1. Create a new repository using this one as a template.
2. `npm install`
3. `createdb table-mini`
4. Rename `example.env` to `.env`. In that file, update the `DATABASE_URL` with your Postgres credentials.

## Prisma

<figure>

![Visualized schema. The textual representation in DBML is linked below.](/docs/schema.svg)

<figcaption>

[textual representation of schema in DBML](/docs/schema.dbml)

</figcaption>
</figure>

1. Create the `Restaurant` and `Reservation` models in the Prisma schema. One Restaurant can have many Reservations. The `restaurantId` field of `Reservation` refers to the `id` field of `Restaurant`. Refer to [these docs on defining a 1-Many relation](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/one-to-many-relations).

   <details>
   <summary>See Solution</summary>

   ```prisma
   model Restaurant {
     id           Int           @id @default(autoincrement())
     name         String
     reservations Reservation[]
   }

   model Reservation {
     id        Int    @id @default(autoincrement())
     name      String
     email     String
     partySize Int

     restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
     restaurantId Int
   }
   ```

   </details>

2. Create the initial migration with `npx prisma migrate dev`.
3. Update the seed script to create at least 3 restaurants. Each restaurant should have at least 5 reservations. You can use arbitrary data as placeholder values.

   - Note: Prisma **cannot** [create multiple related records in a single nested write](https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#create-multiple-records-and-multiple-related-records)! Instead, you must [create a single record with multiple related records](https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#create-a-single-record-and-multiple-related-records) several times.

    <details>
    <summary>See Sample Solution</summary>

   ```js
   const seed = async () => {
     // A loop must be used because `prisma.restaurant.createMany` fails here
     for (let i = 0; i < 3; i++) {
       // For each restaurant, create an array of 5 reservations
       const reservations = [];
       for (let j = 0; j < 5; j++) {
         reservations.push({
           name: `Person ${i}${j}`,
           email: `${i}${j}@foo.bar`,
           partySize: Math.floor(Math.random() * 10) + 1,
         });
       }

       // Create a single restaurant with nested reservations
       await prisma.restaurant.create({
         data: {
           name: `Restaurant ${i + 1}`,
           reservations: {
             create: reservations,
           },
         },
       });
     }
   };
   ```

    </details>

4. `npx prisma migrate reset` to clear and seed your database.
5. Use `npx prisma studio` to confirm that your database has been seeded with restaurants and reservations.

## Express

Define the following routes in `api/restaurants.js`. You can test these routes using the sample requests in `.http`.

1.  `GET /restaurants` should send an array of all restaurants.
     <details>
     <summary>See Solution</summary>

    ```js
    router.get("/", async (req, res, next) => {
      try {
        const restaurants = await prisma.restaurant.findMany();
        res.json(restaurants);
      } catch (e) {
        next(e);
      }
    });
    ```

     </details>

2.  `GET /restaurants/:id` should send the restaurant specified by id. The response should include all reservations made for the restaurant. Refer to [these docs on including related records](https://www.prisma.io/docs/orm/prisma-client/queries/crud#include-related-records).
     <details>
     <summary>See Solution</summary>

    ```js
    router.get("/:id", async (req, res, next) => {
      const { id } = req.params;
      try {
        // We can throw an error instead of checking for a null restaurant
        const restaurant = await prisma.restaurant.findUniqueOrThrow({
          where: { id: +id },
          include: { reservations: true },
        });
        res.json(restaurant);
      } catch (e) {
        next(e);
      }
    });
    ```

     </details>

3.  `POST /restaurants/:id/reservations` should make a new reservation for the restaurant specified by id. Convert strings to numbers as necessary!
    <details>
    <summary>See Solution</summary>

    ```js
    router.post("/:id/reservations", async (req, res, next) => {
      const { id } = req.params;
      const { name, email, partySize } = req.body;
      try {
        // partySize and restaurantId have been converted to numbers
        const reservation = await prisma.reservation.create({
          data: { name, email, partySize: +partySize, restaurantId: +id },
        });
        res.status(201).json(reservation);
      } catch (e) {
        next(e);
      }
    });
    ```

    </details>

## Extensions

In `prisma/seed.js`, refactor the seed script to:

1. Refactor the `seed` function to take the number of restaurants and reservations as [parameters with default values](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters).
   <details>
   <summary>See Solution</summary>

   ```js
    const seed = async (numRestaurants = 3, numReservations = 5) => {
     for (let i = 0; i < numRestaurants; i++) {
       const reservations = [];
       for (let j = 0; j < numReservations; j++) {
        // ... rest of code
   ```

   </details>

1. Use [`Array.from`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from) with a `mapFn` to generate the `reservations` array for each restaurant.
   <details>
   <summary>See Solution</summary>

   ```js
   const reservations = Array.from({ length: numReservations }, (_, j) => ({
     name: `Person ${i}${j}`,
     email: `${i}${j}@foo.bar`,
     partySize: Math.floor(Math.random() * 10) + 1,
   }));
   ```

   </details>

1. Use [faker](https://fakerjs.dev/) to generate fake (but realistic) seed data.
    <details>
    <summary>See Solution</summary>

   ```bash
   npm install @faker-js/faker --save-dev
   ```

   ```js
   const { faker } = require("@faker-js/faker");
   const seed = async (numRestaurants = 3, numReservations = 5) => {
     // A loop must be used because `prisma.restaurant.createMany` fails here
     for (let i = 0; i < numRestaurants; i++) {
       // For each restaurant, create an array of reservations
       const reservations = Array.from({ length: numReservations }, (_, j) => {
         const name = faker.internet.displayName();
         return {
           name,
           email: `${name}@foo.bar`,
           partySize: faker.number.int({ min: 1, max: 10 }),
         };
       });

       // Create a single restaurant with nested reservations
       await prisma.restaurant.create({
         data: {
           name: faker.company.buzzAdjective() + " " + faker.company.buzzNoun(),
           reservations: {
             create: reservations,
           },
         },
       });
     }
   };
   ```

  </details>
