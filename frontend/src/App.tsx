import { useQuery } from "@apollo/client";
import { GET_USERS } from "./graphQL/queries";
import { useEffect } from "react";
import axios from "axios";
import { Outlet } from "react-router-dom";

function App() {
  const { error, loading, data } = useQuery(GET_USERS);

  useEffect(() => {
    console.log(data);
  }, [data]);

  if (error) return <>error</>;
  if (loading) return <>loading...</>;

  return (
    <>
      <a href={import.meta.env.VITE_BACKEND_URL + "/spotifyauth"}>
        <button>Sign In With Spotify</button>
      </a>
      <button
        onClick={async () => {
          console.log(
            await axios(import.meta.env.VITE_BACKEND_URL + "/spotifyauth/me", {
              method: "get",
              withCredentials: true
            })
          );
        }}
      >
        Who Am I
      </button>
      <button
        onClick={async () => {
          console.log(
            await axios(
              import.meta.env.VITE_BACKEND_URL + "/spotifyauth/logout", {
                method: "get",
                withCredentials: true
              }
            )
          );
        }}
      >
        Log Out
      </button>
      <Outlet/>
    </>
  );
}

export default App;
