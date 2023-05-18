import { ToastContainer } from "react-toastify";
import useStore from "../utility/store";
import ConnectModal from "./ConnectModal";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from 'next/link'; 
import { getProvider, getReferralContract } from "../utility/wallet";

const Header = () => {
  const setDisplayModalTrue = useStore((state) => state.setDisplayModalTrue);
  const displayModal = useStore((state) => state.displayModal);
  const [siteMessage, setSiteMessage] = useState();
  const [walletAccount, setWalletAccount] = useState();
  const setProvInstance = useStore((state) => state.setProvInstance);
  const router = useRouter();
  const providerInsatnce = useStore((state) => state.providerInsatnce);

  const [isAdmin, setIsAdmin] = useState();

  useEffect(() => {
    if (localStorage.getItem("walletAddress"))
      setWalletAccount(localStorage.getItem("walletAddress"));
  }, []);

  const connectWall = async () => {
    setDisplayModalTrue();
    console.log("entss");
  };

  const disconnectWallet = async () => {
    localStorage.clear();
    setWalletAccount("");
    setProvInstance("");
    // localStorage.removeItem("walletConnected");
    // localStorage.removeItem("walletconnect");
    setTimeout(() => {
      router.reload(window.location.pathname);
    }, 1000);
  };


  useEffect(() => {
    console.log("here---------->>");
   
  }, [walletAccount, providerInsatnce]);

  return (
    <header>
      <ToastContainer />
      <ConnectModal showModal={displayModal} />
      {!siteMessage ? (
        ""
      ) : (
        <div
          className="d-flex justify-contents-center align-items-center"
          style={{ display: "flex", background: "orange", padding: "20px" }}
        >
          <b>{siteMessage}</b>
        </div>
      )}
      <nav className="navbar navbar-expand-lg  navbar-dark">
        <a className="navbar-brand" href="#">
          <div>
            <span className="logotext">
              <Image height={36} width={36} src="/img/coinsmall.png" alt="" />
            </span>
          </div>
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item active">
              <a className="nav-link" href="#">
                Stake{" "}
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                Portfolio
              </a>
            </li>
            {/* <li className="nav-item">
                 <a className="nav-link" href="#">Leaderboard</a>
                </li> */}
            <li className="nav-item">
              <a
                className="nav-link disabled"
                href="https://kissantoken.io/ksntoken"
                target="Blank"
              >
                Buy KSN
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link disabled" href="#">
                Docs
              </a>
            </li>
            {isAdmin && walletAccount ? (
              <li className="nav-item">
                <Link className="nav-link" href="/adminDashboard">
                  Admin Dashboard
                </Link>
              </li>
            ) : (
              walletAccount && (
                <li className="nav-item">
                  <Link className="nav-link" href="/dashboard">
                    Dashboard
                  </Link>
                </li>
              )
            )}
          </ul>

          <button
            className="mr-sm-2 mr-lg-0 mr-md-0 connectWallet"
            onClick={() => {
              !walletAccount ? connectWall() : disconnectWallet();
            }}
          >
            {!walletAccount ? `Connect Wallet` : `${walletAccount.slice(0,5)}...${walletAccount.slice(-6)}`}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
