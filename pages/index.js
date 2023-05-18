import React, { useState, useEffect } from "react";
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
import Header from "../components/Header";
const StakingPage = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [poolIndex, setPoolIndex] = useState(0);
  const [stakingAmount, setStakingAmount] = useState(0);
  const [referrerAddress, setReferrerAddress] = useState("");
  const [account, setAccount] = useState();
  const [modalItem, setModalItem] = useState();
  const [inputAmt, setAmount] = useState();
  const [warnAmt, setWarnAmount] = useState();
  const [pId, setpoolId] = useState();
  const [positions, setpositions] = useState();
  const [userBalance, setUserBalance] = useState();
  const [totalStaked, setTotalStaked] = useState(0);
  const [totalStakeHolders, setTotalStakeHolders] = useState();
  const [siteMessage, setSiteMessage] = useState();
  const [rightNet, setRightNet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reward, setReward] = useState(null);
  const [referralReward, setReferralReward] = useState();
  const [isAdmin, setIsAdmin] = useState();

  const [isValid, setIsValid] = useState(false);

  const router = useRouter();

  const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID;
  const setModal = useStore((state) => state.setModalData);
  const [walletAccount, setWalletAccount] = useState();
  const setDisplayModalTrue = useStore((state) => state.setDisplayModalTrue);
  const displayModal = useStore((state) => state.displayModal);
  const blurV = useStore((state) => state.blurV);
  const providerInsatnce = useStore((state) => state.providerInsatnce);
  const setProvInstance = useStore((state) => state.setProvInstance);

  const getAccounts = async (web3Instance) => {
    const accounts = await web3Instance.eth.getAccounts();
    setAccounts(accounts);
  };

  useEffect(() => {
    console.log("localStorage.getIt", localStorage.getItem("walletAddress"));
    if (localStorage.getItem("walletAddress"))
      setWalletAccount(localStorage.getItem("walletAddress"));
  }, []);

  const handleStake = async () => {
    try {
      stake();

      // Reset the form fields
      setPoolIndex(0);
      setStakingAmount(0);
      setReferrerAddress("");
    } catch (error) {
      console.error(error);
    }
  };

  // set values in the stake modal
  const setVals = async () => {
    console.log("modal item is---->",modalItem);
    if (modalItem) {
      setAmount(modalItem.min_deposit);
      setpoolId(modalItem.poolId);
    }
  };

  // sets total staked on the contract
  const getTotalstkd = async () => {
    // let contract = await getReferralContract(providerInsatnce);
    // let totalStkd = await contract.methods.getTotalStaked().call();
    // let holders = await contract.methods.getTotalStakeHolderCount().call();
    // setTotalStaked(await convertToEther(totalStkd));
    // setTotalStakeHolders(holders);
  };

  //set user balance state
  const setBal = async () => {
    try{
      let bal = await getWalletBalance(walletAccount, providerInsatnce);
      console.log("user Balance is---->", bal);
      setUserBalance(bal);
    }catch(e){
       console.log("error is user balance is---->",e)
    }
    
  };

  //reconnect wallet on refresh
  const reconWallet = async () => {
    try {
      const { ethereum } = window;
      let acc;
      if (!ethereum) {
        acc = await connectWithWalletConnect();
        // setWalletAccount(acc.account);
        setProvInstance(acc.prov);
        console.log(acc.prov);
      } else {
        acc = await connectToMetaMask();
        // setWalletAccount(acc.account);
        setProvInstance(acc.prov);
        console.log(acc.prov);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const listenForChange = async () => {
    let val = await listenForChain(providerInsatnce).then((res) => {
      if (!res) {
        //    disconnectWallet();
      }
      console.log(res);
    });
  };

  useEffect(() => {
    if (walletAccount) {
      if (!checkNetwork(providerInsatnce, true)) {
        setWalletAccount("");
        console.log("doesnt remv");
        setProvInstance("");
        localStorage.removeItem("walletConnected");
        console;
        toast.error(
          `WRONG NETWORK! Please switch to ${process.env.NEXT_PUBLIC_CHAIN_ID}`
        );
        console.log(siteMessage);
      } else {
        setRightNet(true);
      }
    }
  }, []); //set as 1

  useEffect(() => {
    if (walletAccount) {
      if (!checkNetwork(providerInsatnce, false)) {
        setRightNet(false);
      } else {
        setRightNet(true);
      }
    }
  }); //set continous

  useEffect(() => {
    if (!walletAccount) {
      (async () => {
        if (localStorage.getItem("walletConnected")) await reconWallet();
      })();
    }
    setVals();
    getTotalstkd();
    getPositions();
      
    setBal();
    if (walletAccount && rightNet) {
      getPositions();
      setVals();
      
    }
    
  },[walletAccount]); //set continous

  // stake tokens
  const stake = async () => {
    let poolid=parseInt(modalItem.poolId)
    console.log("modal data item is---->",modalItem);
    let contract = await getReferralContract(providerInsatnce);
    let poolData = await contract.methods
      .pools(poolid)
      .call({ from: walletAccount });

      console.log("pool data is---->",poolData,modalItem.poolId,typeof modalItem.poolId)

    let amount = document.getElementById("amtInput").value;

    if (!walletAccount) {
      toast.info(`Please connect wallet`);
      return;
    }

    
    if (+amount < +(poolData.minimumDeposit)) {
      toast.info(`Input Min of ${(poolData.minimumDeposit)}`);
      return;
    }

    if (+amount > +userBalance) {
      toast.error(`You don't have enough tokens for this transaction`);
      return;
    }

    amount = await convertToWei(amount);
    const referrer =
      referrerAddress !== ""
        ? referrerAddress
        : "0x0000000000000000000000000000000000000000";

    console.log("ref", referrer);
    if (referrer != "0x0000000000000000000000000000000000000000") {
      let res = validateWalletAddress(referrer);
      if (res == false) {
        toast.error("Please Enter A valid wallet address");
        return;
      }
    }

    let token = await getTokenContract(providerInsatnce);
    console.log("token contract is---->", token);

    try {
      setLoading(true);

      if (poolData.poolIsInitialized == false) {
        toast.error(`Pool Is Not Active`);
        return;
      }

      let approve = await token.methods
        .approve(REFERRAL_CONTRACT_ADDRESS, amount)
        .send({ from: walletAccount })
        .then(async (res) => {
          if (res) {
            let stake = await contract.methods
              .stake(amount, poolid, referrer)
              .send({ from: walletAccount, gasLimit: 300000 });
            console.log("stake result is---->", stake);
          }
        });

      setLoading(false);
      toast.success(`Staking Successful`);
      getPositions();
    } catch (error) {
      console.log("error is----->", error);
      let state = await contract.methods
        .getPoolInfo(modalItem.poolId)
        .call({ from: walletAccount });
      console.log({ state });
      if (await state) {
        toast.error(
          "Staking in this pool is currently Paused. Please contact admin"
        );
      } else {
        toast.error(
          "You currently have a stake in this pool. You have to Unstake."
        );
      }

      setLoading(false);
    }
  };

  //claim reward from contract
  const claim_reward = async (ppid) => {
    let resCl = confirm("Are you sure you want to claim Now?");
    if (!resCl) {
      toast.info("Claiming request cancelled");
      return;
    }
    console.log({ ppid });
    let contract = await getReferralContract(providerInsatnce);
    try {
      setLoading(true);
      let claimreward = await contract.methods
        .claimReward(ppid)
        .send({ from: walletAccount, gasLimit: 300000 })
        .then((r) => {
          toast.success(`Claiming Successful`);
          setLoading(false);
        });
        console.log("claim reward--->",claimreward);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  // format timestamp into readable text e.g "24 July 2021"
  function formatDate(timestamp, days = null) {
    let monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    let dateObj = new Date(timestamp * 1000);
    if (days == null) {
      let month = monthNames[dateObj.getMonth()];
      let year = dateObj.getFullYear();
      let date = dateObj.getDate();
      let hours = dateObj.getHours();
      let minutes = dateObj.getMinutes();
      return `${date} ${month} ${year} ${hours}:${minutes}`;
    }
    dateObj.setDate(dateObj.getDate() + days);
    let month = monthNames[dateObj.getMonth()];
    let year = dateObj.getFullYear();
    let date = dateObj.getDate();
    let hours = dateObj.getHours();
    let minutes = dateObj.getMinutes();
    return `${date} ${month} ${year} ${hours}:${minutes}`;
  }

  //get user's staked pools from contract
  const getPositions = async () => {
    let contract = await getReferralContract(providerInsatnce);
    let ownerAddress = await contract.methods.owner().call();
    console.log("walletAccount", walletAccount);
    if (walletAccount == ownerAddress) {
      setIsAdmin(true);
    }

    let i;
    let newArr = [];

    let totalstakedBalance = 0;
    for (let i = 0; i < stakingpools.length; i++) {
      try {
        let poolData = await contract.methods
          .pools(+stakingpools[i].poolId)
          .call();
        console.log("pool data is----->",poolData);
        if (poolData.poolIsInitialized == false) {
          continue;
        }

        let stakingBalance = await contract.methods
          .getUserInfo(+stakingpools[i].poolId, walletAccount)
          .call();

          console.log("User info is---->",stakingBalance)

        if (stakingBalance.hasStaked==true) {
          totalstakedBalance += ethers.utils.formatEther(
            stakingBalance.userStakedBalance
          );

          stakingpools[i].bal = ethers.utils.formatEther(
            stakingBalance.userStakedBalance
          );

          let reward_bal = await contract.methods
            .calculateUserRewards(walletAccount, stakingpools[i].poolId)
            .call();

          let stakeTime = stakingBalance.lastTimeUserStaked;

          stakeTime = stakeTime.toString();
          let startDate = formatDate(+stakeTime);
          let endDate = formatDate(+stakeTime, +stakingpools[i].duration);
          stakingpools[i].date = startDate + " - " + endDate;
          stakingpools[i].end_date = endDate;
          stakingpools[i].reward_bal = await convertToEther(reward_bal);
          newArr.push(stakingpools[i]);
        }
      } catch (err) {
        console.log("Error in get position is:", err);
      }
    }
    setTotalStaked(totalstakedBalance);

    setpositions(newArr);
  };

  //display connect modal to connect wallet
  const connectWall = async () => {
    setDisplayModalTrue();
    console.log("entss");
  };

  //disconnect wallet and reload page
  const disconnectWallet = async () => {
    setWalletAccount("");
    setProvInstance("");
    localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
    localStorage.removeItem("walletConnected");
    localStorage.removeItem("walletconnect");
    router.reload(window.location.pathname);
  };

  // handle onchange allow only numbers to be typed into input field
  const onChange = (event) => {
    event.target.value = event.target.value
      .replace(/[^0-9.]/g, "")
      .replace(/(\..*)\./g, "$1");
    setWarnAmount(+event.target.value);
  };
  const onChangeReferrer = (event) => {
    console.log("event target value is", event.target.value);
    setReferrerAddress(event.target.value);
  };

  const setModalPillActive = () => {
    document.getElementById("pills-home").classList.remove("active");
    document.getElementById("pills-home").classList.remove("show");
    document.getElementById("pills-contact").classList.add("active");
    document.getElementById("pills-contact").classList.add("show");
    document.getElementById("pills-home-tab").classList.remove("active");
    document.getElementById("pills-contact-tab").classList.add("active");
  };

  const handleCalculateReward = async () => {
    if (!pId) {
      toast.error("Please enter a pool ID.");
      return;
    }
    try {
      let contract = await getReferralContract(providerInsatnce);
      let reward = await contract.methods
        .calculateUserRewards(walletAccount, pId)
        .call({ from: walletAccount });
      console.log("reward is----->", reward);
      setReward(reward);
    } catch (e) {
      console.log("error is------>", e);
    }
  };
  const handleCalculateReferralReward = async () => {
    if (!pId) {
      toast.error("Please enter a pool ID.");
      return;
    }
    try {
      let contract = await getReferralContract(providerInsatnce);
      let reward = await contract.methods
        .calculateReferralRewards(walletAccount, pId)
        .call({ from: walletAccount });
      console.log("reward is----->", reward);
      setReferralReward(reward);
    } catch (e) {
      console.log("error is------>", e);
    }
  };
  const handleClaimReward = async (ppId) => {
    console.log("pid is---->",ppId)
    if (ppId==undefined||ppId=="undefined") {
      toast.error("Please enter a pool ID.");
      return;
    }
    try {
      console.log("wallet11111 account is---->",walletAccount)
      let contract = await getReferralContract(providerInsatnce);
      let reward = await contract.methods
        .calculateUserRewards(walletAccount, ppId)
        .call({ from: walletAccount });
      console.log("reward is----->", reward);
      if (reward <= 0) {
        toast.error("Reward is too small to claim");
        return;
      }
      console.log("wallet account is---->",walletAccount)
      let claim = await contract.methods
        .claimReward(ppId)
        .send({ from: walletAccount, gasLimit: 300000 });
      console.log("claim is----->", claim);
      setReferralReward(reward);
    } catch (e) {
      console.log("error is------>", e);
    }
  };
  const handleClaimReferralReward = async (ppId) => {
    try {
      let contract = await getReferralContract(providerInsatnce);
      let reward = await contract.methods
        .calculateReferralRewards(walletAccount, ppId)
        .call({ from: walletAccount });

      if (reward <= 0) {
        toast.error("Reward is too small to claim");
        return;
      }
      let claim = await contract.methods
        .claimReferralReward(ppId)
        .send({ from: walletAccount, gasLimit: 300000 });
      console.log("claim is----->", claim);
      setReferralReward(reward);
    } catch (e) {
      console.log("error is------>", e);
    }
  };

  const validateWalletAddress = (value) => {
    // Regular expression to match a valid wallet address
    const walletAddressRegex = /^(0x)?[0-9a-fA-F]{40}$/;
    console.log("value is", value, walletAddressRegex.test(value));

    if (walletAddressRegex.test(value)) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <>
      <main
        className="container"
        style={
          blurV
            ? {
                filter: "blur(8px)",
              }
            : {}
        }
      >
        <section>
          <div className="text-white" style={{ marginBottom: "64px" }}>
            <h1>KSN Staking</h1>
            <p className="text-grey">
              Earn return on investment by depositing and staking KSN Token
            </p>
          </div>

          <div className="info-wrapper">
            <div className="portfolio_value d-flex flex-wrap  flex-wrap  flex-wrap  justify-content-between">
              <span className="value_wrapper d-flex flex-wrap  flex-wrap  flex-wrap  align-items-center">
                <span className="p_value_label">Portfolio Value : &nbsp;</span>
                <span className="p_value">
                  {" "}
                  {!walletAccount ? (
                    0
                  ) : !userBalance ? (
                    <div className="spinner-grow" role="status"></div>
                  ) : (
                    userBalance
                  )}{" "}
                  KSN
                </span>
              </span>

              <button className="btn buy-coin-btn text-white">
                Buy Kissan Token
              </button>
            </div>
          </div>

          <div className=" container other-tokens d-flex flex-wrap  flex-wrap  flex-wrap ">
            <span className="token d-flex flex-wrap  flex-wrap  flex-wrap  flex-column">
              {/* <span className="tokenName d-flex flex-wrap  flex-wrap  flex-wrap  flex-row align-items-center justify-content-between">
                <span className="eclipse" id="eclipse_green"></span>
                <span> Total Stakers </span>
              </span> */}

              {/* <span className="tokenValue">
                {!totalStakeHolders ? (
                  <div className="spinner-grow" role="status"></div>
                ) : (
                  totalStakeHolders * 1
                )}
              </span> */}
            </span>

            <span className="token d-flex flex-wrap  flex-wrap  flex-wrap  flex-column">
              <span className="tokenName d-flex flex-wrap  flex-wrap  flex-wrap  flex-row align-items-center justify-content-between">
                <span className="eclipse" id="eclipse_green"></span>
                <span>Total KSN Staked </span>
              </span>
              <span className="tokenValue">
              
                {totalStaked>=0 ?totalStaked * 1  : (
                  <div className="spinner-grow" role="status"></div>
                )}
              </span>
            </span>
          </div>

          <div className="container progress-container">
            <div className="progress">
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: "53%", background: "#3FB68B" }}
                aria-valuenow="15"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: "15%", background: "#51EBB4" }}
                aria-valuenow="30"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: "25%", background: "#51C6EB" }}
                aria-valuenow="20"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: "7%", background: "#A386FE" }}
                aria-valuenow="20"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>

            <p style={{ color: "#AFBED0", marginBottom: "16px" }}>
              Your Positions
            </p>

            {!positions || positions?.length == 0 ? (
              <p style={{ color: "#fff" }}>
                {" "}
                You currently have no stake in any pool{" "}
              </p>
            ) : (
              ""
            )}
            {!positions
              ? ""
              : positions.map((item, index) => {
                  if (!item.name || !item.date || !item.roi || !item.bal) {
                    return null;
                  }
                  return (
                    <div
                      key={`claim-${index}`}
                      className="claim-reward position-wrapper d-flex flex-wrap  flex-wrap  flex-wrap  justify-content-between"
                    >
                      <div
                        key={`it-${index}`}
                        className="d-flex flex-wrap  flex-wrap  flex-wrap  flex-column"
                      >
                        <span
                          className="d-flex flex-wrap  flex-wrap  flex-wrap  align-items-center"
                          style={{ height: "38px" }}
                        >
                          <span className="">
                            <Image
                              src={item?.image}
                              alt={item?.name}
                              height={50}
                              width={50}
                            />
                          </span>
                          <span
                            className="text-white"
                            style={{
                              fontWeight: "700",
                              fontSize: "1.5rem",
                              margin: "0 10px",
                            }}
                          >
                            {item?.name}
                          </span>
                          <span>
                            {/* <Image  height="auto" src="/img/open.png" alt="" /> */}
                          </span>
                        </span>
                        <p className="text-light-grey">
                          {" "}
                          Duration: {item?.date}
                        </p>
                      </div>

                      <div
                        key={`rti-${index}`}
                        className="d-flex flex-wrap  flex-wrap  flex-wrap  flex-column"
                      >
                        <span className="text-light-grey">
                          {" "}
                          Return on Investment
                        </span>
                        <span
                          style={{
                            color: "rgba(81, 235, 180, 1)",
                            fontWeight: "700",
                            fontSize: "1.5rem",
                          }}
                        >
                          {" "}
                          {item?.roi}
                        </span>
                      </div>

                      <div
                        key={`yr-${index}`}
                        className="d-flex flex-wrap  flex-wrap  flex-wrap  flex-column"
                      >
                        <span className="text-light-grey"> Your Stake</span>
                        <span>
                          <span
                            className="text-white"
                            style={{
                              fontWeight: "700",
                              fontSize: "1.5rem",
                            }}
                          >
                            {item?.bal * 1} KISSAN
                          </span>
                          <span className="text-light-grey"></span>
                        </span>
                      </div>

                      <div className="d-flex flex-wrap  flex-wrap  flex-wrap  flex-column">
                        <button
                          key={`btncl-${index}`}
                          className=" claim-reward-btn text-white "
                          data-bs-toggle="modal"
                          data-bs-target="#exampleModal"
                          onClick={() => {
                            setModalItem(item);
                            setModalPillActive();
                            console.log({ item });
                          }}
                        >
                          {!loading ? "Claim reward" : "Processing..."}
                        </button>
                      </div>
                    </div>
                  );
                })}
          </div>
        </section>

        <section className="staking-pool">
          <h2 className="text-white staking-pool-heading">
            Kissan Staking Pool
          </h2>

          <div className="staking-pool-table-wrapper table-responsive">
            <table className="table text-white">
              <thead style={{ border: "0" }}>
                <tr className="text-grey">
                  <th scope="col">Staking Category</th>
                  <th scope="col">Duration</th>
                  <th scope="col">APY</th>
                  <th scope="col">Referral Reward</th>
                  <th scope="col">Minimum Deposit</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
              {console.log("staking pools isssss----->",stakingpools)}
                {stakingpools.map((pool, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        <span className="d-flex flex-wrap  flex-wrap  flex-wrap  align-items-center ">
                          <span style={{ marginRight: "16px" }}>
                            <Image
                              height={48}
                              width={48}
                              src={pool?.image}
                              alt=""
                            />{" "}
                          </span>
                          <span>{pool?.name}</span>
                        </span>
                      </td>
                      <td>
                        <span>{pool?.duration} Days</span>
                      </td>
                      <td>
                        <span>{pool?.roi}</span>
                      </td>
                      <td>
                        <span>{pool?.roi}</span>
                      </td>
                      <td>
                        <span>{pool?.min_deposit} KSN</span>
                      </td>
                      <td>
                        <button
                          className="stake-btn"
                          data-bs-toggle="modal"
                          data-bs-target="#exampleModal"
                          onClick={async () => {
                            let contract = await getReferralContract(
                              providerInsatnce
                            );
                            let poolData = await contract.methods
                              .pools(pool.poolId)
                              .call({ from: walletAccount });
                            if (poolData.poolIsInitialized == false) {
                              toast.error(`Pool Is Not Active`);

                              return;
                            } else {
                              console.log({ pool });
                              setModalItem(pool);
                            }
                          }}
                        >
                          {" "}
                          Stake{" "}
                        </button>
                        {pool.bal&&pool.bal>0?  <button
                          className="stake-btn"
                          // data-bs-toggle="modal"
                          // data-bs-target="#exampleModal"
                          onClick={async () => {
                            let contract = await getReferralContract(
                              providerInsatnce
                            );
                          
                            let poolData = await contract.methods
                              .unstake(pool.poolId)
                              .send({ from: walletAccount, gasLimit: 300000 });
                              console.log("pool data is",poolData)
                            // if (poolData.poolIsInitialized == false) {
                            //   toast.error(`Pool Is Not Active`);

                            //   return;
                            // } else {,
                            //   console.log({ pool });
                            //   setModalItem(pool);
                            // }
                          }}
                        >
                          {" "}
                          Unstake
                        </button>:""}
                      
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
        {/* MODAL SECTION  */}

        <div
          className="modal fade"
          id="exampleModal"
          tabIndex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalCenterTitle">
                  Stake KSN
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  style={{ fontSize: "1.3rem" }}
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">
                    {/* <img height={'auto'} src="/img/ex.svg" alt="" /> */}
                  </span>
                </button>
              </div>
              <div className="modal-body">
                <ul className="nav nav-pills" id="pills-tab" role="tablist">
                  <li className="nav-item">
                    <a
                      className="nav-link active"
                      id="pills-home-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#pills-home"
                      role="tab"
                      aria-controls="pills-home"
                      aria-selected="true"
                    >
                      Staking
                    </a>
                  </li>
                  {/* <li className="nav-item">
                          <a className="nav-link" id="pills-profile-tab" data-toggle="pill" href="#pills-profile" role="tab" aria-controls="pills-profile" aria-selected="false">Withdrawal</a>
                        </li> */}
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      id="pills-contact-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#pills-contact"
                      role="tab"
                      aria-controls="pills-contact"
                      aria-selected="false"
                    >
                      Rewards
                    </a>
                  </li>
                </ul>
                <div className="tab-content" id="pills-tabContent">
                  <div
                    className="tab-pane fade show active"
                    id="pills-home"
                    role="tabpanel"
                    aria-labelledby="pills-home-tab"
                  >
                    <div
                      className="d-flex flex-wrap  flex-wrap  flex-wrap  justify-content-between text-grey"
                      style={{ marginBottom: "10px" }}
                    >
                      <span>Amount</span>
                      <span>
                        Kissan Balance:{" "}
                        <span style={{ fontWeight: "500" }}>
                          {!userBalance ? "0" : userBalance}
                        </span>
                      </span>
                    </div>

                    <div
                      className="d-flex justify-content-between align-items-center"
                      style={{
                        background: "#0E1725",
                        borderRadius: "8px",
                        padding: "0 28.5px",
                        fontWeight: "700",
                        fontSize: "1.5rem",
                        marginBottom: "32px",
                      }}
                    >
                      <input
                        type="text"
                        id="amtInput"
                        placeholder={`Min ${modalItem?.min_deposit}`}
                        onChange={onChange}
                        style={{
                          background: "#0E1725",
                          borderRadius: "8px",
                          padding: "28.5px",
                          fontWeight: "700",
                          fontSize: "1.3rem",
                          border: "none",
                          width: "100%",
                          outline: "none",
                          color: "#FFF",
                        }}
                      />
                      <span>KSN</span>
                    </div>

                    <div
                      className="d-flex justify-content-between align-items-center"
                      style={{
                        background: "#0E1725",
                        borderRadius: "8px",
                        padding: "0 28.5px",
                        fontWeight: "700",
                        fontSize: "1.5rem",
                        marginBottom: "32px",
                      }}
                    >
                      <input
                        type="text"
                        id="amtInput"
                        placeholder="Referrer Address"
                        onChange={onChangeReferrer}
                        style={{
                          background: "#0E1725",
                          borderRadius: "8px",
                          padding: "28.5px",
                          fontWeight: "700",
                          fontSize: "1.3rem",
                          border: "none",
                          width: "100%",
                          outline: "none",
                          color: "#FFF",
                        }}
                      />
                      {/* <span >KSN</span> */}
                    </div>

                    <div
                      className="staking-category d-flec flex-column"
                      style={{
                        padding: "20px",
                        background: "#0E1725",
                        borderRadius: "9.75964px",
                        marginBottom: "32px",
                      }}
                    >
                      <span
                        className="d-flex flex-wrap  flex-wrap  flex-wrap  justify-content-between"
                        style={{ marginBottom: "18px" }}
                      >
                        <span>Staking Category</span>
                        <span>{modalItem?.name}</span>
                      </span>

                      <span
                        className="d-flex flex-wrap  flex-wrap  justify-content-between"
                        style={{ marginBottom: "18px" }}
                      >
                        <span>
                          Duration
                          <span>
                            <Image
                              height={48}
                              width={48}
                              src="/img/info.png"
                              alt=""
                            />
                          </span>
                        </span>
                        <span>{modalItem?.duration} Days</span>
                      </span>
                      <span
                        className="d-flex flex-wrap  flex-wrap  justify-content-between"
                        style={{ marginBottom: "18px" }}
                      >
                        <span>APY</span>
                        <span>
                          {modalItem?.roi}{" "}
                          <span style={{ color: "rgba(171, 146, 252, 1)" }}>
                            {" "}
                          </span>{" "}
                          <span></span>{" "}
                        </span>
                      </span>
                    </div>

                    <div
                      className="notice d-flex flex-wrap  flex-wrap "
                      style={{
                        background: "#0E1725",
                        borderRadius: "8px",
                        marginBottom: "32px",
                        padding: "18px 33px",
                      }}
                    >
                      <div
                        className="img d-flex flex-wrap  flex-wrap  justify-content-center align-items-center"
                        style={{ position: "relative", marginRight: "25px" }}
                      >
                        <Image
                          height={48}
                          width={48}
                          style={{ position: "absolute" }}
                          src="/img/exclaim.png"
                          alt=""
                        />
                        <Image
                          height={48}
                          width={48}
                          src="/img/shield.png"
                          alt=""
                        />
                      </div>
                      <div className="d-flex flex-wrap  flex-wrap  flex-column">
                        <span style={{ fontWeight: "700", fontSize: "1.1rem" }}>
                          Staking {!warnAmt ? 0 : warnAmt} KSN for{" "}
                          {!modalItem?.duration ? 0 : modalItem?.duration} days
                        </span>
                        <span style={{ color: "#AFBED0", fontWeight: "400" }}>
                          There’s a 20% penalty for premature withdrawal
                        </span>
                      </div>
                    </div>
                    <div className="d-flex flex-wrap  flex-wrap ">
                      <button
                        className="btn flex-grow-1 stake-btn"
                        style={{ fontWeight: "800", fontSize: "24px" }}
                        onClick={() => {
                          stake();
                        }}
                      >
                        {!loading ? "Stake" : "Processing..."}
                      </button>
                    </div>
                  </div>
                  <div
                    className="tab-pane fade"
                    id="pills-contact"
                    role="tabpanel"
                    aria-labelledby="pills-contact-tab"
                  >
                    <p style={{ color: "rgba(175, 190, 208, 1)" }}>
                      Your Positions
                    </p>

                    {!positions || positions?.length == 0 ? (
                      <p> You currently have no stake in any pool </p>
                    ) : (
                      ""
                    )}

                    {positions
                      ?.filter((item) => {
                        if (item?.poolId == modalItem?.poolId) {
                          return item;
                        }
                      })
                      .map((val, index) => {
                        return (
                          <>
                            <div
                              key={`item` + index}
                              className="position-wrapper d-flex flex-wrap  flex-wrap  justify-content-between"
                              style={{
                                background: "#0E1725",
                                borderRadius: "8px",
                                marginBottom: "32px",
                                padding: "28px",
                              }}
                            >
                              <div className="d-flex flex-wrap  flex-wrap  flex-column">
                                <span className="d-flex flex-wrap  flex-wrap  align-items-center">
                                  <span className="">
                                    <Image
                                      height={48}
                                      width={48}
                                      src="/img/spaceship.png"
                                      alt=""
                                    />
                                  </span>
                                  <span
                                    className="text-white"
                                    style={{
                                      fontWeight: "700",
                                      fontSize: "24px",
                                      margin: "0 10px",
                                    }}
                                  >
                                    {val?.name}
                                  </span>
                                  <span>
                                    <Image
                                      height={48}
                                      width={48}
                                      src={val?.image}
                                      alt=""
                                    />
                                  </span>
                                </span>
                                <p
                                  className="text-light-grey"
                                  style={{ fontWeight: "400" }}
                                >
                                  Duration: {val?.date}
                                </p>
                              </div>

                              <div className="d-flex flex-wrap  flex-wrap  flex-column">
                                <span className="text-light-grey">
                                  {" "}
                                  Your Stake
                                </span>
                                <span>
                                  <span
                                    className="text-white"
                                    style={{
                                      fonWeight: "700",
                                      fontSize: "1.5rem",
                                    }}
                                  >
                                    {val?.bal * 1} KSN
                                  </span>
                                </span>
                              </div>
                            </div>

                            <p
                              key={`position` + index}
                              style={{ color: "rgba(175, 190, 208, 1)" }}
                            >
                              Your Rewards
                            </p>

                            <div
                              key={`bal` + index}
                              className="d-flex flex-wrap  flex-wrap  flex-wrap "
                              style={{
                                marginBottom: "32px",
                                fontWeight: "700",
                                fontSize: "36px",
                                background: "#0E1725",
                                borderRadius: "8px",
                                padding: "28px",
                              }}
                            >
                              <Image
                                height={48}
                                width={48}
                                src="/img/logo.png"
                              />
                              <span
                                className="text-white"
                                style={{ marginLeft: "16px" }}
                              >
                                {val?.reward_bal* 1} KSN
                              </span>
                            </div>

                            <div
                              key={`warn` + index}
                              className="notice d-flex "
                              style={{
                                background: "#0E1725",
                                borderRadius: "8px",
                                marginBottom: "32px",
                                padding: "18px 33px",
                              }}
                            >
                              <div
                                className="img d-flex flex-wrap  flex-wrap  justify-content-center align-items-center"
                                style={{
                                  position: "relative",
                                  marginRight: "25px",
                                }}
                              >
                                <Image
                                  height={48}
                                  width={48}
                                  style={{ position: "absolute" }}
                                  src="/img/exclaim.png"
                                  alt=""
                                />
                                <Image
                                  height={48}
                                  width={48}
                                  src="/img/shield.png"
                                  alt=""
                                />
                              </div>
                              <div className="d-flex flex-wrap  flex-wrap  flex-column">
                                <span
                                  style={{
                                    fontWeight: "700",
                                    fontSize: "1.1rem",
                                  }}
                                >
                                  Due date to claim rewards is {val?.end_date}
                                </span>
                                <span
                                  style={{
                                    color: "#AFBED0",
                                    fontWeight: "400",
                                  }}
                                >
                                  Premature withdrawal will make you lose all
                                  rewards in this pool, and 20% of your staked
                                  tokens
                                </span>
                              </div>
                            </div>

                            <div
                              key={`claim` + index}
                              className="d-flex flex-wrap  flex-wrap  flex-wrap "
                            >
                          
                              <button
                                className="btn flex-grow-1 stake-btn"
                                style={{ fontWeight: "800", fontSize: "24px" }}
                                onClick={() => {
                                  handleClaimReward(val.poolId);
                                }}
                              >
                                {!loading ? "Claim reward" : "Processing..."}
                              </button>
                            </div>
                            <br />
                            <div
                              key={`claim` + index}
                              className="d-flex flex-wrap  flex-wrap  flex-wrap "
                            >
                              <button
                                className="btn flex-grow-1 stake-btn"
                                style={{ fontWeight: "800", fontSize: "24px" }}
                                onClick={() => {
                                  handleClaimReferralReward(val.poolId);
                                }}
                              >
                                {!loading
                                  ? "Claim Referral reward"
                                  : "Processing..."}
                              </button>
                            </div>
                          </>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
    // <div>
    //   <header>

    //  <ToastContainer />
    //  <ConnectModal showModal={displayModal} />
    //  {!siteMessage? "" : (<div className='d-flex justify-contents-center align-items-center' style={{display: "flex", background: "orange", padding: "20px"}}><b>{siteMessage}</b></div>)}
    //      <nav className="navbar navbar-expand-lg  navbar-dark">
    //          <a  className="navbar-brand" href="#">
    //              <div>
    //                  <span className="logotext" >
    //                      <Image height={36} width={36} src="/img/coinsmall.png" alt="" />
    //                  </span>
    //              </div>

    //          </a>
    //          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
    //            <span className="navbar-toggler-icon"></span>
    //          </button>
    //          <div className="collapse navbar-collapse" id="navbarNav">
    //            <ul className="navbar-nav">
    //              <li className="nav-item active">
    //                <a className="nav-link" href="#">Stake </a>
    //              </li>
    //              <li className="nav-item">
    //                <a className="nav-link" href="#">Portfolio</a>
    //              </li>
    //              {/* <li className="nav-item">
    //               <a className="nav-link" href="#">Leaderboard</a>
    //              </li> */}
    //              <li className="nav-item">
    //                <a className="nav-link disabled" href="https://kissantoken.io/ksntoken" target='Blank'>Buy KSN</a>
    //              </li>
    //              <li className="nav-item">
    //                <a className="nav-link disabled" href="#">Docs</a>
    //              </li>
    //            </ul>

    //              <button className="mr-sm-2 mr-lg-0 mr-md-0 connectWallet" onClick={()=>{ !walletAccount ? connectWall() : disconnectWallet()}}>
    //                 { !walletAccount ? `Connect Wallet` : walletAccount.substring(0, 7)}
    //              </button>

    //          </div>

    //        </nav>
    //  </header>
    //   <h1>Staking Page</h1>

    //   {accounts.length > 0 ? (
    //     <p>Connected Account: {accounts[0]}</p>
    //   ) : (
    //     <p>Connecting to MetaMask...</p>
    //   )}

    //   <h2>Stake in Pool</h2>
    //   <div>
    //     <label>
    //       Pool Index:
    //       <input
    //         type="number"
    //         value={poolIndex}
    //         onChange={(e) => setPoolIndex(e.target.value)}
    //       />
    //     </label>
    //   </div>
    //   <div>
    //     <label>
    //       Staking Amount:
    //       <input
    //         type="number"
    //         value={stakingAmount}
    //         onChange={(e) => setStakingAmount(e.target.value)}
    //       />
    //     </label>
    //     </div>
    //   <div>
    //     <label>
    //       Referrer Address:
    //       <input
    //         type="text"
    //         value={referrerAddress}
    //         onChange={(e) => setReferrerAddress(e.target.value)}
    //       />
    //     </label>
    //   </div>
    //   <button onClick={handleStake}>Stake</button>

    //   <div>
    //     <label>
    //      Calculate User Reward:
    //       <input
    //         type="text"
    //         placeholder='pool id'
    //         value={pId}
    //         onChange={(e) => setpoolId(e.target.value)}
    //       />
    //     </label>

    //     <button onClick={handleCalculateReward}>Get User Reward</button>
    //     <button onClick={handleCalculateReferralReward}>Get Referral Reward</button>
    //     <button onClick={handleClaimReward}>Claim Reward</button>
    //     <button onClick={handleClaimReferralReward}>Claim Referral Reward</button>
    //     {reward && <p>Your reward is: {reward}</p>}
    //     {referralReward && <p>Your referral reward is: {referralReward}</p>}
    //   </div>

    // </div>
  );
};

export default StakingPage;
