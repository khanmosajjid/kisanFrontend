// SPDX-License-Identifier: MIT

pragma solidity ^0.8.14;

import "./Ownable.sol";
import "./IERC20.sol";

contract KsnReferralStaking is Ownable {
    IERC20 public rewardsToken; // Contract address of reward token
    IERC20 public stakingToken; // Contract address of staking token

    struct Pool {
        string poolName;
        uint stakingDuration;
        uint APY; // in %
        uint referralRewardPercentage; // Referral reward percentage for this pool
        uint minimumDeposit; // passed in as wei
        uint totalStaked;
        uint lockDuration; // added lock duration
        bool stakingIsPaused; // added stakingIsPaused variable
        mapping(address => uint) userStakedBalance;
        mapping(address => bool) hasStaked;
        mapping(address => uint) lastTimeUserStaked;
        mapping(address => address) referrer;
        mapping(address => uint) referralRewards;
        address[] stakers;
        bool poolIsInitialized;
    }

    mapping(uint => Pool) public pools;
    uint poolIndex;
    uint[] public poolIndexArray;

    mapping(uint => mapping(address => bool)) public hasReferredStake;

    constructor(address _stakingToken, address _rewardsToken) {
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);
        poolIndex = 0;
    }

    function createPool(
        string memory _poolName,
        uint _stakingDuration,
        uint _APY,
        uint _referralRewardPercentage,
        uint _minimumDeposit,
        uint _lockDuration
    ) external onlyOwner returns (uint _createdPoolIndex) {
        pools[poolIndex].poolName = _poolName;
        pools[poolIndex].stakingDuration = _stakingDuration;
        pools[poolIndex].APY = _APY;
        pools[poolIndex].referralRewardPercentage = _referralRewardPercentage;
        pools[poolIndex].minimumDeposit = _minimumDeposit;
        pools[poolIndex].lockDuration = _lockDuration;
        pools[poolIndex].poolIsInitialized = true;

        poolIndexArray.push(poolIndex);
        poolIndex += 1;

        return (poolIndex - 1);
    }

    function stake(uint _amount, uint _poolID, address _referrer) external {
        require(pools[_poolID].poolIsInitialized == true, "Pool does not exist");
        require(_amount >= pools[_poolID].minimumDeposit, "You are trying to stake below the minimum for this pool");

        uint previousBalance = pools[_poolID].userStakedBalance[msg.sender];

        if (pools[_poolID].hasStaked[msg.sender] == true) {
            // Update user balance if they already have a stake in this pool
            pools[_poolID].userStakedBalance[msg.sender] += _amount;
        } else {
            // Otherwise, set the user balance to the staked amount
            pools[_poolID].userStakedBalance[msg.sender] = _amount;
            pools[_poolID].hasStaked[msg.sender] = true;
            pools[_poolID].stakers.push(msg.sender);
        }

        pools[_poolID].totalStaked = pools[_poolID].totalStaked + (_amount - previousBalance);

        if (_referrer != address(0) && _referrer != msg.sender) {
            pools[_poolID].referrer[msg.sender] = _referrer;
            hasReferredStake[_poolID][_referrer] = true; // Mark the referrer as having referred a stake in this pool
        }

        stakingToken.transferFrom(msg.sender, address(this), _amount);

        pools[_poolID].lastTimeUserStaked[msg.sender] = block.timestamp;
    }

   function unstake(uint _poolID) external {
    require(pools[_poolID].hasStaked[msg.sender], "You currently have no stake in this pool.");

    uint stakedAmount = pools[_poolID].userStakedBalance[msg.sender];

    // Calculate reward and referral reward
    uint reward = calculateUserRewards(msg.sender, _poolID);
    uint referralReward = calculateReferralRewards(msg.sender, _poolID);

    // Decrease balance before transfer to prevent re-entrancy
    pools[_poolID].userStakedBalance[msg.sender] = 0;
    pools[_poolID].hasStaked[msg.sender] = false;
    pools[_poolID].totalStaked -= stakedAmount;

    // Transfer rewards to the user
    if (reward > 0) {
        rewardsToken.transfer(msg.sender, reward);
    }

    // Transfer referral rewards to the referrer
    if (referralReward > 0) {
        address referrer = pools[_poolID].referrer[msg.sender];
        pools[_poolID].referralRewards[referrer] += referralReward;
        rewardsToken.transfer(referrer, referralReward);
    }

    require(block.timestamp >= pools[_poolID].lastTimeUserStaked[msg.sender] + pools[_poolID].lockDuration, "Stake is still locked");

    // Transfer staked amount back to the user
    stakingToken.transfer(msg.sender, stakedAmount);
}


    function claimReward(uint _poolID) external {
    require(_poolID < poolIndex, "Invalid pool ID");
    require(pools[_poolID].hasStaked[msg.sender] == true, "You currently have no stake in this pool");

    // uint stakeTime = pools[_poolID].lastTimeUserStaked[msg.sender];

    // require(block.timestamp >= stakeTime + pools[_poolID].lockDuration, "Stake is still locked");

    uint reward = calculateUserRewards(msg.sender, _poolID);
    require(reward > 0, "Rewards are too small to be claimed");

    // Calculate referral reward
    uint referralReward = calculateReferralRewards(msg.sender, _poolID);

    // Adjust user reward by deducting referral reward
    uint adjustedReward = reward - referralReward;

    // Transfer adjusted reward to claimer
    rewardsToken.transfer(msg.sender, adjustedReward);

    // Transfer referral reward to referrer
    if (referralReward > 0) {
        address referrer = pools[_poolID].referrer[msg.sender];
        pools[_poolID].referralRewards[referrer] += referralReward;
        rewardsToken.transfer(referrer, referralReward);
    }
}




    // Function to calculate user rewards
    function calculateUserRewards(address _user, uint _poolID) public view returns (uint256) {
        if (pools[_poolID].hasStaked[_user] == true) {
            uint256 lastTimeStaked = pools[_poolID].lastTimeUserStaked[_user];
            uint256 periodSpentStaking = block.timestamp - lastTimeStaked;

            uint256 userStake_wei = pools[_poolID].userStakedBalance[_user];
            uint256 userReward_inWei = (userStake_wei * pools[_poolID].APY * periodSpentStaking) / (365 days * 100);

            return userReward_inWei;
        } else {
            return 0;
        }
    }

    // Function to calculate referral rewards
    function calculateReferralRewards(address _user, uint _poolID) public view returns (uint) {
        address referrer = pools[_poolID].referrer[_user];
        if (referrer != address(0)) {
            uint userReward = calculateUserRewards(_user, _poolID);
            uint referralReward = (userReward * pools[_poolID].referralRewardPercentage) / 100;

            return referralReward;
        } else {
            return 0;
        }
    }

    function claimReferralReward(uint _poolID) external {
        require(_poolID < poolIndex, "Invalid pool ID");
        require(pools[_poolID].hasStaked[msg.sender] == true, "You currently have no stake in this pool.");

        uint referralReward = pools[_poolID].referralRewards[msg.sender];
        require(referralReward > 0, "You currently have no referral rewards to claim");

        pools[_poolID].referralRewards[msg.sender] = 0;
        rewardsToken.transfer(msg.sender, referralReward);
    }

    function pauseStaking(uint _poolID) external onlyOwner {
        require(pools[_poolID].poolIsInitialized == true, "Pool does not exist");
        pools[_poolID].stakingIsPaused = true;
    }

    function resumeStaking(uint _poolID) external onlyOwner {
        require(pools[_poolID].poolIsInitialized == true, "Pool does not exist");
        pools[_poolID].stakingIsPaused = false;
    }

    function getPoolInfo(uint _poolID) external view returns (
        string memory poolName,
        uint stakingDuration,
        uint APY,
        uint minimumDeposit,
        uint totalStaked,
        bool stakingIsPaused,
        bool poolIsInitialized
    ) {
        require(pools[_poolID].poolIsInitialized == true, "Pool does not exist");

        return (
            pools[_poolID].poolName,
            pools[_poolID].stakingDuration,
            pools[_poolID].APY,
            pools[_poolID].minimumDeposit,
            pools[_poolID].totalStaked,
            pools[_poolID].stakingIsPaused,
            pools[_poolID].poolIsInitialized
        );
    }

    function getUserInfo(uint _poolID, address _user) external view returns (
        uint userStakedBalance,
        bool hasStaked,
        uint lastTimeUserStaked,
        address referrer,
        uint referralRewards
    ) {
        require(pools[_poolID].poolIsInitialized == true, "Pool does not exist");

        return (
            pools[_poolID].userStakedBalance[_user],
            pools[_poolID].hasStaked[_user],
            pools[_poolID].lastTimeUserStaked[_user],
            pools[_poolID].referrer[_user],
            pools[_poolID].referralRewards[_user]
        );
    }

    function getPoolCount() external view returns (uint) {
        return poolIndexArray.length;
    }
}


