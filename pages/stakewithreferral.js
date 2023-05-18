import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import KsnReferralStaking from '../utility/KsnReferralStaking.json';

const CONTRACT_ADDRESS = 'CONTRACT_ADDRESS'; // Replace with the actual contract address

const StakingPage = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [poolIndex, setPoolIndex] = useState(0);
  const [stakingAmount, setStakingAmount] = useState(0);
  const [referrerAddress, setReferrerAddress] = useState('');

  useEffect(() => {
    initializeWeb3();
  }, []);

  const initializeWeb3 = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.enable();

        setWeb3(web3Instance);
        initializeContract(web3Instance);
        getAccounts(web3Instance);
      } catch (error) {
        console.error(error);
      }
    } else {
      console.error('Please install MetaMask to use this dApp.');
    }
  };

  const initializeContract = (web3Instance) => {
    const contractInstance = new web3Instance.eth.Contract(
        KsnReferralStaking,
      CONTRACT_ADDRESS
    );
    setContract(contractInstance);
  };

  const getAccounts = async (web3Instance) => {
    const accounts = await web3Instance.eth.getAccounts();
    setAccounts(accounts);
  };

  const handleStake = async () => {
    try {
      const amountWei = web3.utils.toWei(stakingAmount.toString());
      const referrer = referrerAddress !== '' ? referrerAddress : '0x0000000000000000000000000000000000000000';

      await contract.methods.stake(amountWei, poolIndex, referrer).send({
        from: accounts[0],
        value: 0
      });

      // Reset the form fields
      setPoolIndex(0);
      setStakingAmount(0);
      setReferrerAddress('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Staking Page</h1>

      {accounts.length > 0 ? (
        <p>Connected Account: {accounts[0]}</p>
      ) : (
        <p>Connecting to MetaMask...</p>
      )}

      <h2>Stake in Pool</h2>
      <div>
        <label>
          Pool Index:
          <input
            type="number"
            value={poolIndex}
            onChange={(e) => setPoolIndex(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Staking Amount:
          <input
            type="number"
            value={stakingAmount}
            onChange={(e) => setStakingAmount(e.target.value)}
          />
        </label>
        </div>
      <div>
        <label>
          Referrer Address:
          <input
            type="text"
            value={referrerAddress}
            onChange={(e) => setReferrerAddress(e.target.value)}
          />
        </label>
      </div>
      <button onClick={handleStake}>Stake</button>
    </div>
  );
};

export default StakingPage;
