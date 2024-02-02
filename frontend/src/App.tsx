import { Outlet } from "react-router-dom";
import Navbar from "./components/general/Navbar";
import { useDispatch } from "react-redux";
import { setIsLoggedIn } from "./store"; // Adjust the import path
import { useEffect } from "react";
import axios, { AxiosError, isAxiosError } from "axios";

function App() {
  // In your component
  const dispatch = useDispatch();

  useEffect(() => {
    async function checkIfLoggedIn() {
      try {
        const response = await axios(import.meta.env.VITE_BACKEND_URL + "/spotifyauth/me", {
          method: "get",
          withCredentials: true,
        });
        console.log(response);
        dispatch(setIsLoggedIn({ isLoggedIn: true, username: response.data.spotifyId}));
      } catch (err: unknown) {
        if (isAxiosError(err)) {
          err as AxiosError;
          if (err.response?.status === 401) {
            dispatch(setIsLoggedIn({ isLoggedIn: false, username: undefined}));
          }
        }
      }
    }
    checkIfLoggedIn();
  }, []);

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default App;
