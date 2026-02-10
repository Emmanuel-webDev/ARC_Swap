// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract SimpleSwapPool {
    using SafeERC20 for IERC20;
    
    IERC20 public immutable USDC =
        IERC20(0x3600000000000000000000000000000000000000);
    IERC20 public immutable EURC =
        IERC20(0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a);

    address public owner;
    uint256 public exchangeRate = 1e18; // 1:1 EURC per USDC (with 18 decimals precision)
    uint256 public feePercentage = 30; // Fee in basis points (100 = 1%) Default 0.3%
    bool public paused;

    event Swap(
        address indexed user,
        uint256 usdcAmount,
        uint256 eurcAmount,
        uint256 fee
    );

    event PoolFunded(uint256 eurcAmount);
    event PoolWithdrawn(address indexed token, uint256 amount);
    event ExchangeRateUpdated(uint256 newRate);
    event FeeUpdated(uint256 newFee);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    constructor() {
        owner = msg.sender;
    }
    

    //Swap
   function swap(uint256 usdcAmount) external whenNotPaused {

        uint256 minEurcAmount = 2e6; // Minimum 2 EURC

        require(usdcAmount > 0, "Amount must be > 0");
        
        // Calculate EURC amount to send
        uint256 eurcAmount = calculateEurcAmount(usdcAmount);
        uint256 fee = (eurcAmount * feePercentage) / 10000;
        uint256 eurcAfterFee = eurcAmount - fee;
        
        require(eurcAfterFee >= minEurcAmount, "Slippage too high");
        require(EURC.balanceOf(address(this)) >= eurcAfterFee, "Insufficient EURC in pool");
        
        // Transfer USDC from user to pool
        USDC.safeTransferFrom(msg.sender, address(this), usdcAmount);
        
        // Transfer EURC from pool to user
        EURC.safeTransfer(msg.sender, eurcAfterFee);
        
        emit Swap(msg.sender, usdcAmount, eurcAfterFee, fee);
    }


      //Calculate rate 
     function calculateEurcAmount(uint256 usdcAmount) public view returns (uint256) {
        uint8 usdcDecimals = IERC20Metadata(address(USDC)).decimals();
        uint8 eurcDecimals = IERC20Metadata(address(EURC)).decimals();
        
        // Normalize to 18 decimals, apply rate, then convert to EURC decimals
        uint256 normalizedAmount = usdcAmount * 10**(18 - usdcDecimals);
        uint256 eurcIn18 = (normalizedAmount * exchangeRate) / 1e18;
        
        return eurcIn18 / 10**(18 - eurcDecimals);
    }

      //Get quote
      function getQuote(uint256 usdcAmount) external view returns (uint256 eurcAmount, uint256 fee) {
        uint256 gross = calculateEurcAmount(usdcAmount);
        fee = (gross * feePercentage) / 10000;
        eurcAmount = gross - fee;
    }

    //OWNER

    //Fund Contract
    function fundPool(uint256 amount) external onlyOwner {
        EURC.safeTransferFrom(msg.sender, address(this), amount);
        emit PoolFunded(amount);
    }

    //Withdraw From Pool
    function withdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner, amount);
        emit PoolWithdrawn(token, amount);
    }

     //VIEW POOL BAL
    
    function getPoolBalance() external view returns (uint256 usdcBalance, uint256 eurcBalance) {
        usdcBalance = USDC.balanceOf(address(this));
        eurcBalance = EURC.balanceOf(address(this));
    }

    //PAUSE POOL
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }
    
}
