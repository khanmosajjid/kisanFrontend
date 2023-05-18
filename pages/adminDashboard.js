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
import { createCategory, getCategories, updateCategory } from "../services/categoryServices";

const AdminDashboard = () => {
  const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID;
    const [categoryData, setCategoryData] = useState({
        name: "",
        price:0
    })
    const [categories, setCategories] = useState([])
    const [form, setForm] = useState(null)
    const [toggle, setToggle] = useState(false)

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
  const [categoryLength,setCategoryLength]=useState();

  const [isValid, setIsValid] = useState(false);

  const router = useRouter();

 
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

//   useEffect(() => {
//     if (walletAccount) {
//       if (!checkNetwork(providerInsatnce, true)) {
//         setWalletAccount("");
//         console.log("doesnt remv");
//         setProvInstance("");
//         localStorage.removeItem("walletConnected");
//         toast.error(
//           `WRONG NETWORK! Please switch to ${process.env.NEXT_PUBLIC_NETWORK_NAME}`
//         );
//         console.log(siteMessage);
//       } else {
//         setRightNet(true);
//       }
//     }
//   }, []); //set as 1

//   useEffect(() => {
//     if (walletAccount) {
//       if (!checkNetwork(providerInsatnce, false)) {
//         setRightNet(false);
//       } else {
//         setRightNet(true);
//       }
//     }
//   }); //set continous

//   useEffect(() => {
//     setVals();
//     getTotalstkd();
//     getPositions();
//     if (walletAccount && rightNet) {
//       getPositions();
//       setBal();
//     }
//     if (!walletAccount) {
//       (async () => {
//         if (localStorage.getItem("walletConnected")) await reconWallet();
//       })();
//     }
//   }); //set continous





  //get user's staked pools from contract
 

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
    const fetch = async() => {
        const res = await getCategories();
        console.log("categories", res.length);
        setCategories(res);
        setCategoryLength(res.length);
    }
    fetch();
  },[toggle])


  const onHandleCategory = async (e, action) => {
    e.preventDefault()
    try {
        if(action === "add"){
            console.log("add category", categoryData);
            await createCategory(categoryData);
           
           }
           if(action === "update"){
            console.log("update category", form);
            await updateCategory(form?._id, {
                name: form?.name,
                price: form.price
            });
           }
           setCategoryData({
            name: "",
            price: 0
        })
        setForm(null)
        setToggle(!toggle)
    } catch (error) {
        console.log("error", error)
    }
}

  const handleOnChange = async (e) => {
    e.preventDefault();
     setCategoryData({
        ...categoryData,
        [e.target.name]:e.target.value 
    })
  }

  return (
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
            </ul>

            <button
              className="mr-sm-2 mr-lg-0 mr-md-0 connectWallet"
              onClick={() => {
                !walletAccount ? connectWall() : disconnectWallet();
              }}
            >
              {!walletAccount
                ? `Connect Wallet`
                : walletAccount.substring(0, 7)}
            </button>
          </div>
        </nav>
      </header>
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
            <h1>KSN Admin Dashboard</h1>
            <p className="text-grey">
              Earn return on investment by depositing and staking KSN Token
            </p>
          </div>

          <div>
          <div className="container pb-4">
    <div className="row justify-content-center">
    {categoryLength<4? <div className="col-md-6">
      <form onSubmit={(e) => onHandleCategory(e, "add")} className="d-flex">
        <div className="form-group col-4 p-2">
          <input type="text" placeholder="Name" name="name" value={categoryData?.name} onChange={handleOnChange} className="form-control p-2" />
        </div>
        <div className="form-group col-4 p-2">
          <input type="number" placeholder="Price" name="price" value={categoryData?.price} onChange={handleOnChange} className="form-control p-2" />
        </div>
        <div className="form-group col-4 p-2">
        <button type="submit" className="btn btn-primary btn-block py-2 px-3">Add Category</button>

        </div>
      </form>
    </div>:""}
   

    {form !== null && (
      <div className="col-md-6">
        <form onSubmit={(e) => onHandleCategory(e, "update")} className="d-flex">
          <div className="form-group col-4">
            <input
              type="text"
              placeholder="Name"
              name="name"
              value={form?.name}
              onChange={(e) => {
                setForm({
                  ...form,
                  name: e.target.value
                });
              }}
              className="form-control"
            />
          </div>
          <div className="form-group col-4">
            <input
              type="number"
              placeholder="Price"
              name="price"
              value={form?.price}
              onChange={(e) => {
                setForm({
                  ...form,
                  price: e.target.value
                });
              }}
              className="form-control"
            />
          </div>
          <div className="form-group col-4">
            <button type="submit" className="btn btn-primary btn-block">Update Category</button>
          </div>
        </form>
      </div>
    )}
  </div>
</div>




      


      


            <table className="table table-bordered text-white">
    <thead>
        <tr>
           
            <th scope="col">Name</th>
            <th scope="col">Target</th>
            <th scope="col">No. of Achievers</th>
            <th scope="col">Approved Achievers</th>
            <th scope="col">Claims by Achievers</th>
        </tr>
    </thead>
    <tbody>
        {categories?.length > 0 && categories?.map((_cat, key) => {
            return (
                <tr key={key}>
                    
                    <td>{_cat?.name}</td>
                    <td>{_cat?.price}</td>
                    <td>{/* No. of Achievers value */}</td>
                    <td>{/* Approved Achievers value */}</td>
                    <td>{/* Claims by Achievers value */}</td>
                    <td><button onClick={() => {setForm(_cat)}}>Update</button></td>
                </tr>
            )
        })}
    </tbody>
</table>

          </div>

          
        </section>
      </main>
    </>
  );
};

export default AdminDashboard;
