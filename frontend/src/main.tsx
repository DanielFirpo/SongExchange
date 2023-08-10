import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import ErrorPage from "./components/pages/ErrorPage";
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
import { GraphQLError } from "graphql";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import WelcomePage from "./components/pages/WelcomePage/WelcomePage.tsx";
import DiscoverPage from "./components/pages/DiscoverPage/DiscoverPage.tsx";
import PlaylistPage from "./components/pages/PlaylistPage/PlaylistPage.tsx";
import UserPage from "./components/pages/UserPage/UserPage.tsx";
import AccountPage from "./components/pages/AccountPage/AccountPage.tsx";

const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach((message: GraphQLError) => {
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
  link: link,
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
    errorElement: <ErrorPage/>,
    children: [
      {
        path: "welcome",
        element: <WelcomePage />,
      },
      {
        path: "discover",
        element: <DiscoverPage />,
      },
      {
        path: "account",
        element: <AccountPage />,
      },
      {
        path: "playlist/:id",
        element: <PlaylistPage />,
      },
      {
        path: "user/:id",
        element: <UserPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <RouterProvider router={router} />
    </ApolloProvider>
  </React.StrictMode>
);
