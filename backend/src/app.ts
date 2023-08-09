import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { typeDefs, resolvers } from "./graphql";
import spotifyAuthRouter from "./routes/spotifyAuth";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { decodeToken, disallowTrace } from "./middleware";

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

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }));

  // parse application/json
  app.use(bodyParser.json());

  app.use(cors());
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL + "");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // Allow credentials
    next();
  });
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(disallowTrace);
  app.use(cookieParser());
  app.use(decodeToken);
  app.use("/graphql", expressMiddleware(server));

  app.use("/spotifyauth", spotifyAuthRouter);

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.listen(port, () => {
    console.log(`🚀 Express ready at http://localhost:${port}`);
    console.log(`🚀 Graphql ready at http://localhost:${port}/graphql`);
  });
};

bootstrapServer();