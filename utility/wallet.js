import WalletConnectProvider from '@walletconnect/web3-provider'
import detectEthereumProvider from '@metamask/detect-provider'
import { ethers, providers  } from "ethers";
import Web3 from "web3";
import Web3Modal from "web3modal";
import { toast } from 'react-toastify';
import * as contractABI from './KsnStaking.json'
import * as referralContractABI from './KsnReferralStaking.json'
import * as tokenABI from './testToken.json'

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
export const REFERRAL_CONTRACT_ADDRESS=process.env.NEXT_PUBLIC_REFERRAL_CONTRACT_ADDRESS
export const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID;
const ENV =  process.env.NEXT_PUBLIC_ENV;
const INFURA_ID =  process.env.NEXT_PUBLIC_INFURA_ID;
const PROVIDER_URL =  process.env.NEXT_PUBLIC_JSONRPC_PROVIDER;
const getRevertReason = require('eth-revert-reason')


let currentAccount = null;

//Get provider 
export const getProvider = async () => {
    if (typeof window !== "undefined") {
      let { ethereum } = window; 
      if(ethereum){
        let provider = await detectEthereumProvider();
        return provider;
      }else{
        return new Web3(new Web3.providers.HttpProvider(PROVIDER_URL));
      }
   }
}

//connect to wallet using WalletConnect
export const connectWithWalletConnect = async () => {
  try {
      console.log('started here');
      const provider = new WalletConnectProvider({
        infuraId: INFURA_ID,
        rpc: {
          97: 'https://data-seed-prebsc-1-s1.binance.org:8545'
        },
      });     
     
 
      await provider.enable();

      if(provider){
        
        const web3 = new Web3(provider);
        const chainId = await web3.eth.getChainId();
        if(+chainId !== +CHAIN_ID){
          toast.error(`WRONG NETWORK! Please switch to ${ CHAIN_ID}`);
          localStorage.removeItem('walletconnect');
          Return;

        }
        const accounts = await web3.eth.getAccounts();
        console.log(accounts);
        return {account: accounts[0], prov: web3};
      }

  } catch (error) {
      console.log({error})
  }
}

//Check the network connected on
export async function checkNetwork(prov=null, istoast=true){
  if(!prov){
    prov = await getProvider();
  }
  const web3 = new Web3(prov);
  const chainId = await web3.eth.getChainId();
  // console.log("chain id is--->",chainId);

    if (chainId !== +CHAIN_ID) {
      if (+CHAIN_ID == 56) {
        if(istoast){
          toast.info("Please switch network to BSC mainet ");
        }
      }else if(+CHAIN_ID == 97){
        if (istoast) {
            toast.info("Please switch network to BSC Testnet ");
        }   
      }else{
        if (istoast) {
          toast.info("Wrong Networks switch to BSC ");
      } 
      }
      return false;
    }
    return true;
}

//Connect to metamask wallet
export async function connectToMetaMask() {
  try {
    const { ethereum } = window;

    if (!ethereum) {
      toast.error("You need Metamask to use this Site, Please install MetaMask ☺️, Thank you!");
        return;
    }

    if( ethereum.networkVersion && ethereum.networkVersion !== CHAIN_ID ){
      toast.error(`WRONG NETWORK! Please switch to ${ process.env.NEXT_PUBLIC_NETWORK_NAME}`);
      return;
    }


    const prov = await getProvider();
    return prov.send("eth_requestAccounts", []).then((acc) => {
      return {account: acc.result[0], prov};
    });

  } catch (error) {
      console.log(error.message);
  }
}

//utility method to attemp to remove cyclic object into normal objects
export const removeCyclicRef = (object) =>{
  const visited = new WeakSet();
  const traverseData = (data) => {
    let result = Array.isArray(data) ? [] : {};
    if(visited.has(data)){
      return;
    }

    if(typeof data === "object"){
      visited.add(data);
      for(let key in data){
        const stageResult = traverseData(data[key]);
        if (stageResult) {
          result[key] = stageResult;
        }
      }
    } else{
      result = data;
    }
    return result;
  }
  return traverseData(object);
}

//Listen for accounts change and do something
export function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // MetaMask is locked or the user has not connected any accounts
    console.log('Please connect to MetaMask.');
  } else if (accounts[0] !== currentAccount) {
    currentAccount = accounts[0];
    return accounts[0];
    // Do any other work!
  }
}

//Listen for chain switch
export const listenForChain = async (prov) => {
  let chainBool = false;
  let provider = await getProvider();
  if(provider){
      let val =  provider.on("chainChanged", async (chainId) => {
      if (ethers.utils.hexValue(+CHAIN_ID) !== chainId) {
        chainBool = false;
        
      }else{
        chainBool = true;
      }
    });
  
    return chainBool;
  }

}
  
//force a network switch
export const switchNetwork = async () =>{
  if (typeof window !== "undefined") {
    console.log('it entersheretoo')
    if (window.ethereum.networkVersion !== CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ethers.utils.hexlify(CHAIN_ID) }]
        });
      } catch (err) {
          // This error code indicates that the chain has not been added to MetaMask
        if (err.code === 4902) {
          console.log(err.message)
          // await window.ethereum.request({
          //   method: 'wallet_addEthereumChain',
          //   params: [
          //     {
          //       chainName: 'Polygon Mainnet',
          //       chainId: ethers.utils.hexlify(CHAIN_ID),
          //       nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
          //       rpcUrls: ['https://polygon-rpc.com/']
          //     }
          //   ]
          // });
        }
      }
    }
  }
}

//get contract from blockchain
export const getContract = async (prov)=> {
  if(!prov){
    prov = await getProvider();
    console.log('no provider provided')
    console.log({prov})
  }
  const web3 = new Web3(prov);
  const staking = new web3.eth.Contract(contractABI.abi, CONTRACT_ADDRESS);
  return staking;
}

export const getReferralContract = async (prov)=> {
  if(!prov){
    prov = await getProvider();
    console.log('no provider provided')
    console.log({prov})
  }
  const web3 = new Web3(prov);
  const referral = new web3.eth.Contract(referralContractABI.abi, REFERRAL_CONTRACT_ADDRESS);
  return referral;
}

//get token contract from blockchain
export const getTokenContract = async (prov) => {
  if(!prov){
    prov = await getProvider();
  }
  const web3 = new Web3(prov);
  const tokencontract = new web3.eth.Contract(tokenABI.abi, TOKEN_ADDRESS);
  return tokencontract;
}

//convert Ethers to Wei
export const convertToWei = async (val) => {
  let prov = await getProvider();
  const web3 = new Web3(prov);
  return  Web3.utils.toWei(val, 'ether');
}

//convert Wei to Ethers
export const convertToEther = async (val) => {
  let prov = await getProvider();
  const web3 = new Web3(prov);
  return web3.utils.fromWei(val, 'ether')
}

//get token balance of user (Native token of contract)
export const getWalletBalance = async (address, prov=null) =>{
  let contract = await getTokenContract(prov);
  let val = await contract.methods.balanceOf(address).call();
  let balance = convertToEther(val);
  return balance;
}

export const getReason = async ()=> {
  let provider = await getProvider();
  return await getRevertReason('0xb9ca162f2d7f600b8cf87f46d419ddabffd031380d7aed673804de7e06a084cf','Testnet','20944870',provider)
}


export default {connectToMetaMask, checkNetwork, connectWithWalletConnect, switchNetwork, getProvider, listenForChain, getContract, getTokenContract,getReferralContract, convertToWei, getWalletBalance, convertToEther, CONTRACT_ADDRESS };