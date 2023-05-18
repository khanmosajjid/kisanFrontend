import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

import Web3 from "web3";
import KsnReferralStaking from "../utility/KsnReferralStaking.json";
import useStore from "../utility/store";
const CONTRACT_ADDRESS = "CONTRACT_ADDRESS"; // Replace with the actual contract address
import ConnectModal from "../components/ConnectModal";
import { Modal } from "../components/modal";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import stakingpools from "../utility/stakingpools";


import {
  connectToMetaMask,
  connectWithWalletConnect,
  getContract,
  getReferralContract,
  getReason,
  checkNetwork,
  listenForChain,
  getTokenContract,
  convertToWei,
  getWalletBalance,
  convertToEther,
  REFERRAL_CONTRACT_ADDRESS,
} from "../utility/wallet";
import Image from "next/image";
import {
  createCategory,
  getCategories,
  updateCategory,
} from "../services/categoryServices";

const Header=()=>{
    const [siteMessage, setSiteMessage] = useState();

    const router = useRouter();
   

    const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID;
  const setModal = useStore((state) => state.setModalData);
  const walletAccount = useStore((state) => state.WalletAccount);
  const setDisplayModalTrue = useStore((state) => state.setDisplayModalTrue);
  const displayModal = useStore((state) => state.displayModal);
  const setWalletAccount = useStore((state) => state.setWalletAccount);
  const blurV = useStore((state) => state.blurV);
  const providerInsatnce = useStore((state) => state.providerInsatnce);
  const setProvInstance = useStore((state) => state.setProvInstance);
  const [isAdmin,setIsAdmin]=useState();

  const disconnectWallet = async () => {
    setWalletAccount("");
    setProvInstance("");
    localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
    localStorage.removeItem("walletConnected");
    localStorage.removeItem("walletconnect");
    router.reload(window.location.pathname);
  };
  const connectWall = async () => {
    setDisplayModalTrue();
    console.log("entss");
  };

  const getPositions =useCallback( async () => {
    
    let contract = await getReferralContract(providerInsatnce);
    let ownerAddress = await contract.methods
          .owner()
          .call();
          console.log("dataaaaa",walletAccount==ownerAddress,walletAccount,ownerAddress)
    if(walletAccount==ownerAddress){
      console.log("isAdmin")
          setIsAdmin(true);
    }

    console.log("here")
   
  },[providerInsatnce,walletAccount])

  useEffect(()=>{
    // console.log("here---------->>")
    getPositions()
  },[])

    return(
        <>
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

              {/* {isAdmin?<li className="nav-item">
                <a className="nav-link" href="/adminDashboard">
                  Admin Dashboard
                </a>
              </li>:<li className="nav-item">
                <a className="nav-link" href="/dashboard">
                   Dashboard
                </a>
              </li>} */}
            </ul>
    
            <button
              className="mr-sm-2 mr-lg-0 mr-md-0 connectWallet"
              onClick={() => {
                !walletAccount ? connectWall() : disconnectWallet();
              }}
            >
              {!walletAccount
                ? `Connect Wallet`
                : "alskdjf"}
            </button>
          </div>
        </nav>
      </header>
        </>
    )

    
  
}
export default Header;