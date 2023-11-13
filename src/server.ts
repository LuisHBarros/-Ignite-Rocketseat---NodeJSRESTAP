import fastify from "fastify";

const app = fastify();

app.get("/hello", () => {
    return "Hello, World";
});

app
    .listen({ port: 3000 })
    .then(() => console.log("Sever running at port 3333"));
