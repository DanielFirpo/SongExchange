import express from "express";
import cors from "cors";
import http from 'http';
import dotenv from "dotenv";
import {ApolloServer} from "@apollo/server";
import {expressMiddleware} from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import {typeDefs, resolvers} from "./graphql";

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

const httpServer = http.createServer(app);

const bootstrapServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({extended: true}));
  app.use("/graphql", expressMiddleware(server));

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.listen(port, () => {
    console.log(`🚀 Express ready at http://localhost:${port}`);
    console.log(`🚀 Graphql ready at http://localhost:${port}/graphql`);
  });
};

bootstrapServer();