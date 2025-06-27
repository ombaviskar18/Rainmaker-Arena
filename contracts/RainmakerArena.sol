// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title RainmakerArena
 * @dev Multi-chain crypto price prediction gaming contract
 * @author Rainmaker Arena Team
 */
contract RainmakerArena is ReentrancyGuard, Ownable, Pausable {
    
    // Events
    event RoundCreated(uint256 indexed roundId, string crypto, uint256 startPrice, uint256 endTime);
    event PredictionPlaced(uint256 indexed roundId, address indexed player, bool prediction, uint256 betAmount);
    event RoundEnded(uint256 indexed roundId, string crypto, uint256 startPrice, uint256 endPrice, bool result);
    event RewardDistributed(address indexed player, uint256 amount);
    event EmergencyWithdraw(address indexed owner, uint256 amount);
    
    // Structs
    struct PredictionRound {
        uint256 roundId;
        string crypto;
        uint256 startPrice;
        uint256 endPrice;
        uint256 startTime;
        uint256 endTime;
        uint256 totalPool;
        uint256 upBets;
        uint256 downBets;
        bool ended;
        bool result; // true for up, false for down
    }
    
    struct UserPrediction {
        bool prediction; // true for up, false for down
        uint256 betAmount;
        bool claimed;
    }
    
    // State variables
    uint256 public roundCounter;
    uint256 public constant ROUND_DURATION = 5 minutes;
    uint256 public constant MIN_BET = 0.001 ether;
    uint256 public constant MAX_BET = 1 ether;
    uint256 public constant HOUSE_FEE = 250; // 2.5% (250/10000)
    
    mapping(uint256 => PredictionRound) public rounds;
    mapping(uint256 => mapping(address => UserPrediction)) public userPredictions;
    mapping(uint256 => address[]) public roundPlayers;
    mapping(address => uint256) public playerWinnings;
    mapping(address => uint256) public playerStats; // total games played
    mapping(address => uint256) public playerWins;
    
    address public priceOracle;
    uint256 public totalVolume;
    uint256 public totalRounds;
    
    constructor(address _priceOracle) {
        priceOracle = _priceOracle;
        roundCounter = 0;
    }
    
    /**
     * @dev Create a new prediction round
     * @param _crypto The cryptocurrency symbol (e.g., "BTC", "ETH")
     * @param _startPrice The starting price in wei (scaled by 1e8 for price precision)
     */
    function createRound(
        string memory _crypto, 
        uint256 _startPrice
    ) external onlyOwner whenNotPaused {
        roundCounter++;
        uint256 endTime = block.timestamp + ROUND_DURATION;
        
        rounds[roundCounter] = PredictionRound({
            roundId: roundCounter,
            crypto: _crypto,
            startPrice: _startPrice,
            endPrice: 0,
            startTime: block.timestamp,
            endTime: endTime,
            totalPool: 0,
            upBets: 0,
            downBets: 0,
            ended: false,
            result: false
        });
        
        totalRounds++;
        emit RoundCreated(roundCounter, _crypto, _startPrice, endTime);
    }
    
    /**
     * @dev Place a prediction for a round
     * @param _roundId The round ID to predict on
     * @param _prediction True for up, false for down
     */
    function placePrediction(
        uint256 _roundId, 
        bool _prediction
    ) external payable nonReentrant whenNotPaused {
        require(_roundId > 0 && _roundId <= roundCounter, "Invalid round ID");
        require(msg.value >= MIN_BET && msg.value <= MAX_BET, "Invalid bet amount");
        
        PredictionRound storage round = rounds[_roundId];
        require(block.timestamp < round.endTime, "Round has ended");
        require(!round.ended, "Round already ended");
        require(userPredictions[_roundId][msg.sender].betAmount == 0, "Already predicted");
        
        // Record user prediction
        userPredictions[_roundId][msg.sender] = UserPrediction({
            prediction: _prediction,
            betAmount: msg.value,
            claimed: false
        });
        
        // Update round statistics
        round.totalPool += msg.value;
        if (_prediction) {
            round.upBets += msg.value;
        } else {
            round.downBets += msg.value;
        }
        
        // Track players
        roundPlayers[_roundId].push(msg.sender);
        playerStats[msg.sender]++;
        totalVolume += msg.value;
        
        emit PredictionPlaced(_roundId, msg.sender, _prediction, msg.value);
    }
    
    /**
     * @dev End a round and determine winners
     * @param _roundId The round ID to end
     * @param _endPrice The final price
     */
    function endRound(
        uint256 _roundId, 
        uint256 _endPrice
    ) external onlyOwner {
        require(_roundId > 0 && _roundId <= roundCounter, "Invalid round ID");
        
        PredictionRound storage round = rounds[_roundId];
        require(block.timestamp >= round.endTime, "Round not finished yet");
        require(!round.ended, "Round already ended");
        
        round.endPrice = _endPrice;
        round.ended = true;
        round.result = _endPrice > round.startPrice; // true if price went up
        
        emit RoundEnded(_roundId, round.crypto, round.startPrice, _endPrice, round.result);
        
        // Distribute rewards automatically
        _distributeRewards(_roundId);
    }
    
    /**
     * @dev Internal function to distribute rewards to winners
     * @param _roundId The round ID to distribute rewards for
     */
    function _distributeRewards(uint256 _roundId) internal {
        PredictionRound storage round = rounds[_roundId];
        require(round.ended, "Round not ended");
        
        uint256 totalPool = round.totalPool;
        uint256 houseFee = (totalPool * HOUSE_FEE) / 10000;
        uint256 rewardPool = totalPool - houseFee;
        
        uint256 winningBets = round.result ? round.upBets : round.downBets;
        
        if (winningBets == 0) {
            // No winners, house keeps all funds
            return;
        }
        
        // Distribute rewards to winners
        address[] memory players = roundPlayers[_roundId];
        for (uint256 i = 0; i < players.length; i++) {
            address player = players[i];
            UserPrediction storage prediction = userPredictions[_roundId][player];
            
            if (prediction.prediction == round.result && !prediction.claimed) {
                uint256 reward = (prediction.betAmount * rewardPool) / winningBets;
                prediction.claimed = true;
                playerWinnings[player] += reward;
                playerWins[player]++;
                
                // Send reward immediately
                (bool success, ) = payable(player).call{value: reward}("");
                if (success) {
                    emit RewardDistributed(player, reward);
                }
            }
        }
    }
    
    /**
     * @dev Get round information
     * @param _roundId The round ID to query
     */
    function getRound(uint256 _roundId) external view returns (PredictionRound memory) {
        return rounds[_roundId];
    }
    
    /**
     * @dev Get user prediction for a round
     * @param _roundId The round ID
     * @param _user The user address
     */
    function getUserPrediction(uint256 _roundId, address _user) external view returns (UserPrediction memory) {
        return userPredictions[_roundId][_user];
    }
    
    /**
     * @dev Get player statistics
     * @param _player The player address
     */
    function getPlayerStats(address _player) external view returns (
        uint256 gamesPlayed,
        uint256 gamesWon,
        uint256 totalWinnings,
        uint256 winRate
    ) {
        gamesPlayed = playerStats[_player];
        gamesWon = playerWins[_player];
        totalWinnings = playerWinnings[_player];
        winRate = gamesPlayed > 0 ? (gamesWon * 10000) / gamesPlayed : 0; // Basis points
    }
    
    /**
     * @dev Get contract statistics
     */
    function getContractStats() external view returns (
        uint256 _totalRounds,
        uint256 _totalVolume,
        uint256 _currentRound,
        uint256 contractBalance
    ) {
        _totalRounds = totalRounds;
        _totalVolume = totalVolume;
        _currentRound = roundCounter;
        contractBalance = address(this).balance;
    }
    
    /**
     * @dev Emergency withdraw function for owner
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit EmergencyWithdraw(owner(), balance);
    }
    
    /**
     * @dev Update price oracle address
     * @param _newOracle The new oracle address
     */
    function updatePriceOracle(address _newOracle) external onlyOwner {
        require(_newOracle != address(0), "Invalid oracle address");
        priceOracle = _newOracle;
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get active rounds (not ended and not expired)
     */
    function getActiveRounds() external view returns (uint256[] memory) {
        uint256[] memory activeRounds = new uint256[](roundCounter);
        uint256 activeCount = 0;
        
        for (uint256 i = 1; i <= roundCounter; i++) {
            if (!rounds[i].ended && block.timestamp < rounds[i].endTime) {
                activeRounds[activeCount] = i;
                activeCount++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](activeCount);
        for (uint256 i = 0; i < activeCount; i++) {
            result[i] = activeRounds[i];
        }
        
        return result;
    }
    
    // Allow contract to receive ETH
    receive() external payable {}
} 