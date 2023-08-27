import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import ErrorPage from "./components/pages/ErrorPage";
import "./index.css";
import "virtual:uno.css";
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { GraphQLError } from "graphql";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import WelcomePage from "./components/pages/WelcomePage/WelcomePage.tsx";
import DiscoverPage from "./components/pages/DiscoverPage/DiscoverPage.tsx";
import PlaylistPage from "./components/pages/PlaylistPage/PlaylistPage.tsx";
import UserPage from "./components/pages/UserPage/UserPage.tsx";
import AccountPage from "./components/pages/AccountPage/AccountPage.tsx";
import { Provider } from "react-redux";
import { store } from "./store.ts";

//Apollo GQL setup
const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach((error: GraphQLError) => {
      console.log("graphql error " + JSON.stringify(error));
    });
  }
});

const link = from([
  errorLink,
  new HttpLink({
    uri: import.meta.env.VITE_GRAPHQL_URL,
    credentials: "include",
  }),
]);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: link,
});

//RTK query setup

//react router setup
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "", // Empty path for the base domain
        element: (
          <div className="flex flex-col flex-items-center flex-justify-center">
            <h1 className="w-full text-center mt-36">Static landing page coming soon...</h1>
            <a href={import.meta.env.VITE_BACKEND_URL + "/spotifyauth"}>
              <button className="bg-transparent p-4 outline cursor-pointer border-none color-black font-synthesis-small-caps">
                Log In with Spotify
              </button>
            </a>
          </div>
        ), // Render this component for the base domain
      },
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
    <Provider store={store}>
      <ApolloProvider client={client}>
        <RouterProvider router={router} />
      </ApolloProvider>
    </Provider>
  </React.StrictMode>
);
