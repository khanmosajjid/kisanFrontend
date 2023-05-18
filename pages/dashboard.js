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
import {
  createCategory,
  getCategories,
  updateCategory,
} from "../services/categoryServices";
import { addUserCategory } from "../services/userServices";
import Header from "../components/Header";
const Dashboard = () => {
  const [categoryData, setCategoryData] = useState({
    name: "",
    price: 0,
  });
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);
  const [toggle, setToggle] = useState(false);

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
  const [totalStaked, setTotalStaked] = useState();
  const [totalStakeHolders, setTotalStakeHolders] = useState();
  const [siteMessage, setSiteMessage] = useState();
  const [rightNet, setRightNet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reward, setReward] = useState(null);
  const [referralReward, setReferralReward] = useState();
  const [buttonText, setButtonText] = useState('Withdraw');
  const [userTotalReferralStakedBalance,setUserTotalReferralStakedBalance]=useState(0);
  

  const [isValid, setIsValid] = useState(false);

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

  const getAccounts = async (web3Instance) => {
    const accounts = await web3Instance.eth.getAccounts();
    setAccounts(accounts);
  };

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
    let bal = await getWalletBalance(walletAccount, providerInsatnce);
    // console.log("user Balance is---->", bal);
    setUserBalance(bal);
  };

  //reconnect wallet on refresh
  const reconWallet = async () => {
    try {
      const { ethereum } = window;
      let acc;
      if (!ethereum) {
        acc = await connectWithWalletConnect();
        setWalletAccount(acc.account);
        setProvInstance(acc.prov);
        console.log(acc.prov);
      } else {
        acc = await connectToMetaMask();
        setWalletAccount(acc.account);
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
          toast.error(
            `WRONG NETWORK! Please switch to ${process.env.NEXT_PUBLIC_NETWORK_NAME}`
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
      console.log("wallet account is----->",walletAccount)
      if (walletAccount && rightNet) {
        // getPositions();
        setBal();
      }
      
    },[walletAccount]); //set continous

  // stake tokens
 

  //claim reward from contract
  

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
    console.log("contract of referral contract is-->",contract)
    let totalStkd = await contract.methods.owner().call();
    let UserStakedBalance=0;
    try{
      if(walletAccount){
        let userBalance=await contract.methods.userBalances(walletAccount).call();
        console.log("user Balances is---->",userBalance);
        setUserTotalReferralStakedBalance(userBalance);
      }
       
    }catch(e){
       console.log("error in balance fetching is--->",userBalance);
    }

    
    if(walletAccount){
      try{
        // const { walletAddress, balance }
        let data={
          walletAddress:walletAccount,
          balance:UserStakedBalance
        }
        let addcat=await addUserCategory(data);
        console.log("result of addCat is---->",addcat);
  
      }catch(e){
       console.log("error is--->",e);
      }
    }
   

    let i;
    let newArr = [];

    let totalstakedBalance = 0;
   
  
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
    if (!pId) {
      toast.error("Please enter a pool ID.");
      return;
    }
    try {
      let contract = await getReferralContract(providerInsatnce);
      let reward = await contract.methods
        .calculateUserRewards(walletAccount, ppId)
        .call({ from: walletAccount });
      console.log("reward is----->", reward);
      if (reward <= 0) {
        toast.error("Reward is too small to claim");
        return;
      }
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

  useEffect(() => {
    const fetch = async () => {
      const res = await getCategories();
      console.log("categories", res);
      setCategories(res);
    };
    fetch();
  }, [toggle]);

  const onHandleCategory = async (e, action) => {
    e.preventDefault();
    try {
      if (action === "add") {
        console.log("add category", categoryData);
        await createCategory(categoryData);
      }
      if (action === "update") {
        console.log("update category", form);
        await updateCategory(form?._id, {
          name: form?.name,
          price: form.price,
        });
      }
      setCategoryData({
        name: "",
        price: 0,
      });
      setForm(null);
      setToggle(!toggle);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleOnChange = async (e) => {
    e.preventDefault();
    setCategoryData({
      ...categoryData,
      [e.target.name]: e.target.value,
    });
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
            <h1>KSN User Dashboard</h1>
            <p className="text-grey">
              Earn return on investment by depositing and staking KSN Token
            </p>
            <span className="p_value_label"> User Total Referral Portfolio Value : &nbsp;</span>
                <span className="p_value">
                  {" "}
                  {!walletAccount ? (
                    0
                  ) : !userTotalReferralStakedBalance ? (
                    <div className="spinner-grow" role="status"></div>
                  ) : (
                    userTotalReferralStakedBalance
                  )}{" "}
                  KSN
                </span>
          </div>

          <div className="info-wrapper">
            {/* <div className="portfolio_value d-flex">
              <form onSubmit={(e) => onHandleCategory(e, "add")}>
                <input type="text" placeholder="Name" name="name" value={categoryData?.name} onChange={handleOnChange}/>
                <input type="number" placeholder="Price" name="price" value={categoryData?.price} onChange={handleOnChange}/>
                <button type="submit" className="btn buy-coin-btn text-white">
                  Add Category
                </button>
              </form>
              {
                form !== null &&  <form onSubmit={(e) => onHandleCategory(e, "update")}>
                 <input type="text" placeholder="Name" name="name" value={form?.name} onChange={(e) => {
                    setForm({
                        ...form,
                        name: e.target.value
                    })
                 }}/>
                <input type="number" placeholder="Price" name="price" value={form?.price} onChange={(e) => {
                    setForm({
                        ...form,
                        price: e.target.value
                    })
                 }}/>
                <button type="submit" className="btn buy-coin-btn text-white">
                  Update Category
                </button>
              </form>
              }
             

            </div> */}

<table className="table text-white">
  <thead>
    <tr>
      <th scope="col">Category Name</th>
      <th scope="col">Category Target</th>
      <th scope="col">Your Achievement</th>
      <th scope="col">Approved/Not Approved</th>
      <th scope="col"></th>
    </tr>
  </thead>
  <tbody className="text-white">
  {categories?.length > 0 &&
      categories?.map((_cat, key) => {
        return (
          <tr key={key}>
            {/* <td>{_cat?._id}</td> */}
            <td>{_cat?.name}</td>
            <td>{_cat?.price} KSN</td>
            <td>...</td>
            <td>...</td>
            <td>
            <button className="btn btn-primary" onClick={() => { 
  if (eventOccurred) {
    setButtonText("Now Withdrawn");
    setButtonDisabled(true);
  } else {
    setButtonText("Withdraw");
    setButtonDisabled(false);
  }
}}>
  {buttonText}
</button>
            </td>
          </tr>
        );
      })}
   
  
 
  </tbody>
</table>


          </div>
        </section>
      </main>
    </>
  );
};

export default Dashboard;
