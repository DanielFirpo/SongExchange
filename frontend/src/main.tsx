import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "virtual:uno.css";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  from,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";

const errorLink = onError(({ graphqlErrors, networkError }) => {
  if (graphqlErrors) {
    graphqlErrors.forEach((message: string) => {
      alert("graphql error " + message);
    });
  }
});
const link = from([
  errorLink,
  new HttpLink({ uri: import.meta.env.VITE_GRAPHQL_URL }),
]);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: link(),
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);
