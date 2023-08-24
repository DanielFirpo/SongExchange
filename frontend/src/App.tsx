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
        await axios(import.meta.env.VITE_BACKEND_URL + "/spotifyauth/me", {
          method: "get",
          withCredentials: true,
        });
        dispatch(setIsLoggedIn({ isLoggedIn: true }));
      } catch (err: any) {
        if (isAxiosError(err)) {
          err as AxiosError;
          if (err.response?.status === 401) {
            dispatch(setIsLoggedIn({ isLoggedIn: false }));
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
