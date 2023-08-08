import { useQuery } from "@apollo/client";
import { GET_USERS } from "./graphQL/queries";
import { useEffect } from "react";

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
    </>
  );
}

export default App;
