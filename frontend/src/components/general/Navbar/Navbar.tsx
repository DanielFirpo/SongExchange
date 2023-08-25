import axios from "axios";
import logo from "../../../assets/blacklogo.png";
import hamburgerIcon from "../../../assets/hamburger.svg";
import closeHamburgerIcon from "../../../assets/close.svg";
// import accountIcon from "../../../assets/account.svg";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { State, setIsLoggedIn } from "../../../store";

function Navbar() {
  // In your component
  const isLoggedIn = useSelector((state: State) => state.app.value.isLoggedIn);

  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const mobileMenu = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    console.log(isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    if (mobileMenu.current) {
      if (isHamburgerOpen) {
        mobileMenu.current.classList.add("translate-x-0", "sm:translate-x-100");
      } else {
        mobileMenu.current.classList.remove("translate-x-0", "sm:translate-x-100");
      }
    }
  }, [isHamburgerOpen]);

  const LogInButton = () => {
    return (
      <>
        {!isLoggedIn && (
          <a href={import.meta.env.VITE_BACKEND_URL + "/spotifyauth"}>
            <button className="bg-transparent cursor-pointer border-none color-white font-synthesis-small-caps">
              Log In with Spotify
            </button>
          </a>
        )}
      </>
    );
  };

  const LogOutButton = () => {
    return (
      <>
        {isLoggedIn && (
          <button
            className="bg-transparent cursor-pointer border-none color-white font-synthesis-small-caps"
            onClick={async () => {
              try {
                await axios(import.meta.env.VITE_BACKEND_URL + "/spotifyauth/logout", {
                  method: "get",
                  withCredentials: true,
                });
                navigate("");
                setIsHamburgerOpen(false);
                dispatch(setIsLoggedIn({ isLoggedIn: false }));
              } catch {}
            }}
          >
            Log Out
          </button>
        )}
      </>
    );
  };

  const AccountButton = () => {
    return (
      <>
        {isLoggedIn && (
          <button
            className="bg-transparent cursor-pointer border-none color-white font-synthesis-small-caps"
            onClick={() => {
              navigate("/account");
              setIsHamburgerOpen(false);
            }}
          >
            Account
          </button>
        )}
      </>
    );
  };

  const DiscoverButton = () => {
    return (
      <>
        {isLoggedIn && (
          <button
            className="bg-transparent cursor-pointer border-none color-white font-synthesis-small-caps"
            onClick={() => {
              navigate("/discover");
              setIsHamburgerOpen(false);
            }}
          >
            Discover
          </button>
        )}
      </>
    );
  };

  return (
    <>
      <nav className="bg-black text-white h-14 sm:h-20 pr-4 pl-4 sm:pr-10 sm:pl-10">
        <div className="flex flex-justify-between flex-items-center h-full">
          {/* left nav contents */}
          <div className="flex flex-items-center cursor-pointer" onClick={() => navigate("")}>
            <img src={logo} className="h-8 sm:h-12 mr-2"></img>
            <h1>Song Exchange</h1>
          </div>
          {/* right nav contents */}
          <div className="hidden sm:block">
            <DiscoverButton />
            <LogInButton />
            <LogOutButton />
            <AccountButton />
          </div>
          {/* mobile hamburger */}
          <div className="sm:hidden">
            {!isHamburgerOpen && (
              <img
                src={hamburgerIcon}
                className="filter-invert h-8 cursor-pointer mr-1"
                onClick={() => setIsHamburgerOpen(true)}
              ></img>
            )}
            {isHamburgerOpen && (
              <div
                ref={mobileMenu}
                className="w-screen h-screen bg-black absolute inset-0 flex flex-items-center flex-justify-center flex-col transition-transform duration-300"
              >
                {isHamburgerOpen && (
                  <img
                    src={closeHamburgerIcon}
                    className="filter-invert absolute right-0 top-0 p-2 h-8 cursor-pointer mr-2"
                    onClick={() => setIsHamburgerOpen(false)}
                  ></img>
                )}
                <DiscoverButton />
                <LogInButton />
                <LogOutButton />
                <AccountButton />
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
