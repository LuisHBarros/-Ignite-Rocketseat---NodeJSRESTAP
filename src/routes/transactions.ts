import { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { z } from "zod";
import { knex } from "../database";
import { CheckSessionIdExists } from "../middleware/check-session-id-exists";

// Cookies <-> Formas de manter o contexto entre requisicoes

export async function transactionsRoutes(app: FastifyInstance) {

  app.get("/", { preHandler: [CheckSessionIdExists] }, async (req, res) => {
    const { sessionId } = req.cookies;

    const transactions = await knex("transactions").where("session_id", sessionId).select();
    return res.status(200).send({
      transactions,
    });
  });

  app.get("/:id",{ preHandler: [CheckSessionIdExists] }, async (req) => {
    
    const getTransactionsParamsSchema = z.object({
      id: z.string().uuid()
    });
    const { sessionId } = req.cookies;

    const { id } = getTransactionsParamsSchema.parse(req.params);
    console.log(id);
    const transaction = await knex("transactions")
      .where({ id, session_id: sessionId })
      .first();
    return {
      transaction
    };
  });
  app.post("/", async (req, res) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });
    const { title, amount, type } = createTransactionBodySchema.parse(req.body);
  
    let sessionId = req.cookies.sessionId;
    if(!sessionId) {
      const new_id = crypto.randomUUID();
      res.cookie("sessionId", new_id, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      });
      sessionId = new_id;
    }
    console.log(sessionId);
    

    await knex("transactions").insert({
      id: crypto.randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      session_id: sessionId,
    });

    return res.status(201).send();

  });
  app.get("/summary", { preHandler: [CheckSessionIdExists] }, async (req) => {
    const { sessionId } = req.cookies;
    const summary = await knex("transactions")
      .where({ session_id: sessionId })
      .sum("amount", { as: "amount" })
      .first();
    return {
      summary,
    };
  });
}