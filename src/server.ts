import fastify from "fastify";
import { knex } from "./database";
import crypto from "node:crypto";
import { env } from "./env";
const app = fastify();

app.get("/hello", async () => {
  const transactions = await knex("transactions")
    .insert({
      id: crypto.randomUUID(),
      title: "Test Transaction",
      amount: 1000,
    })
    .returning("*");
  return transactions;
});

app
  .listen({ port: env.PORT })
  .then(() => console.log("Sever running at port 3333"));


