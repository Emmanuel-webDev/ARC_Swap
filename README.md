Readme · MD
Copy

# SimpleSwapPool - Bidirectional USDC ⟷ EURC Swap Contract

A simple, efficient bidirectional token swap contract for Arc blockchain that allows users to swap between USDC and EURC through a dual liquidity pool.

## Overview

SimpleSwapPool is a direct pool-based swap mechanism without routing. The contract maintains pools of both USDC and EURC tokens, enabling seamless swaps in both directions at a configurable exchange rate with minimal fees.

## Features

- ✅ **Bidirectional Swaps**: USDC → EURC and EURC → USDC
- ✅ Configurable exchange rates (1:1 default)
- ✅ Adjustable fee structure (0.3% default)
- ✅ Built-in slippage protection (2 token minimum)
- ✅ Emergency pause functionality
- ✅ Owner-controlled pool management
- ✅ Built with OpenZeppelin SafeERC20
- ✅ Separate funding for each token pool

## Contract Details

**Supported Tokens:**
- USDC: `0x3600000000000000000000000000000000000000`
- EURC: `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a`

**Default Parameters:**
- Exchange Rate: `1e18` (1:1 ratio)
- Fee: `30` basis points (0.3%)
- Minimum Swap Output: 2 tokens (either USDC or EURC)

## Smart Contract Functions

### User Functions

#### `swapUSDC(uint256 usdcAmount)`
Swap USDC for EURC
- **usdcAmount**: Amount of USDC to swap (in 6 decimals)
- **Minimum output**: 2 EURC hardcoded
- **Example**: `swapUSDC(100000000)` swaps 100 USDC

#### `swapEURC(uint256 eurcAmount)`
Swap EURC for USDC
- **eurcAmount**: Amount of EURC to swap (in 6 decimals)
- **Minimum output**: 2 USDC hardcoded
- **Example**: `swapEURC(100000000)` swaps 100 EURC

#### `getEurcQuote(uint256 usdcAmount)`
Get EURC quote for swapping USDC
- **Returns**: `eurcAmount` (after fees) and `fee`

#### `getUsdcQuote(uint256 eurcAmount)`
Get USDC quote for swapping EURC
- **Returns**: `usdcAmount` (after fees) and `fee`

#### `getPoolBalance()`
View current pool reserves
- **Returns**: `usdcBalance` and `eurcBalance`

### Owner Functions

#### `fundPoolWithEURC(uint256 amount)`
Add EURC liquidity to the pool

#### `fundPoolWithUSDC(uint256 amount)`
Add USDC liquidity to the pool

#### `withdraw(address token, uint256 amount)`
Withdraw tokens from the pool
- **token**: Address of USDC or EURC
- **amount**: Amount to withdraw

#### `setPaused(bool _paused)`
Pause/unpause all swaps for emergency situations

## Deployment

### Simple Deployment (No Constructor Parameters)

```solidity
// Deploy - no parameters needed!
SimpleSwapPool pool = new SimpleSwapPool();
```

The contract initializes with:
- Owner: `msg.sender` (deployer)
- Exchange Rate: `1e18` (1:1)
- Fee: `30` (0.3%)
- Status: Unpaused

## Usage Guide

### For Pool Owner

**1. Deploy the Contract**
```solidity
SimpleSwapPool pool = new SimpleSwapPool();
```

**2. Approve EURC**
```solidity
EURC.approve(poolAddress, 10000000000) // 10,000 EURC
```

**3. Fund EURC Pool**
```solidity
pool.fundPoolWithEURC(10000000000) // Add 10,000 EURC
```

**4. Approve USDC**
```solidity
USDC.approve(poolAddress, 10000000000) // 10,000 USDC
```

**5. Fund USDC Pool**
```solidity
pool.fundPoolWithUSDC(10000000000) // Add 10,000 USDC
```

### For Users

#### Swapping USDC for EURC

**1. Approve USDC**
```solidity
USDC.approve(poolAddress, 1000000000) // 1,000 USDC
```

**2. Get Quote (Optional)**
```solidity
pool.getEurcQuote(100000000) // Quote for 100 USDC
// Returns: (eurcAmount: 99700000, fee: 300000)
```

**3. Execute Swap**
```solidity
pool.swapUSDC(100000000) // Swap 100 USDC for EURC
```

#### Swapping EURC for USDC

**1. Approve EURC**
```solidity
EURC.approve(poolAddress, 1000000000) // 1,000 EURC
```

**2. Get Quote (Optional)**
```solidity
pool.getUsdcQuote(100000000) // Quote for 100 EURC
// Returns: (usdcAmount: 99700000, fee: 300000)
```

**3. Execute Swap**
```solidity
pool.swapEURC(100000000) // Swap 100 EURC for USDC
```

## Testing on Remix

### Complete Testing Workflow

**Step 1: Deploy Contract**
```
Deploy SimpleSwapPool() with no parameters
Copy the deployed contract address
```

**Step 2: Load Token Contracts**
```
At Address: 0x3600000000000000000000000000000000000000 (USDC)
At Address: 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a (EURC)
Use IERC20 interface for both
```

**Step 3: Fund Pools (as Owner)**
```
// Approve EURC
EURC.approve(poolAddress, 10000000000)

// Fund EURC Pool
pool.fundPoolWithEURC(10000000000)

// Approve USDC
USDC.approve(poolAddress, 10000000000)

// Fund USDC Pool
pool.fundPoolWithUSDC(10000000000)
```

**Step 4: Test USDC → EURC Swap (as User)**
```
// Approve USDC
USDC.approve(poolAddress, 200000000)

// Get quote
pool.getEurcQuote(100000000)

// Execute swap
pool.swapUSDC(100000000)

// Verify
pool.getPoolBalance()
EURC.balanceOf(yourAddress)
```

**Step 5: Test EURC → USDC Swap (as User)**
```
// Approve EURC
EURC.approve(poolAddress, 200000000)

// Get quote
pool.getUsdcQuote(50000000)

// Execute swap
pool.swapEURC(50000000)

// Verify
pool.getPoolBalance()
USDC.balanceOf(yourAddress)
```

## Fee Structure

Fees are calculated in **basis points**:
- 1 basis point = 0.01%
- 100 basis points = 1%
- 10,000 basis points = 100%

**Default Fee: 30 basis points = 0.3%**

**Fee Calculation:**
```solidity
fee = (outputAmount * feePercentage) / 10000
finalAmount = outputAmount - fee
```

**Example with 100 USDC swap:**
```
Gross EURC: 100,000,000 (100 EURC)
Fee: (100,000,000 * 30) / 10000 = 300,000 (0.3 EURC)
Net EURC: 99,700,000 (99.7 EURC)
```

## Exchange Rate Precision

The exchange rate uses **18 decimals** for high precision:

**Examples:**
- `1e18` = 1:1 ratio (1 USDC = 1 EURC) ← **DEFAULT**
- `1.05e18` = 1:1.05 ratio (1 USDC = 1.05 EURC)
- `0.98e18` = 1:0.98 ratio (1 USDC = 0.98 EURC)

**Note:** The current contract has a fixed rate of `1e18`. To modify the rate, you would need to add a setter function (not currently implemented).

## Slippage Protection

Both swap functions have **hardcoded minimum outputs**:
- `swapUSDC`: Minimum 2 EURC output (`2e6`)
- `swapEURC`: Minimum 2 USDC output (`2e6`)

This protects users from:
- Extremely small swaps
- Rate manipulation
- Unexpected fee changes

If output would be less than 2 tokens, transaction reverts with `"Slippage too high"`.

## Events

The contract emits the following events:

### `eurcSwap`
```solidity
event eurcSwap(
    address indexed user,
    uint256 usdcAmount,
    uint256 eurcAmount,
    uint256 fee
);
```
Emitted when USDC is swapped for EURC

### `usdcSwap`
```solidity
event usdcSwap(
    address indexed user,
    uint256 eurcAmount,
    uint256 usdcAmount,
    uint256 fee
);
```
Emitted when EURC is swapped for USDC

### `PoolFunded`
```solidity
event PoolFunded(uint256 amount);
```
Emitted when pool is funded (either USDC or EURC)

### `PoolWithdrawn`
```solidity
event PoolWithdrawn(address indexed token, uint256 amount);
```
Emitted when tokens are withdrawn from pool

## Security Features

- ✅ OpenZeppelin SafeERC20 for secure transfers
- ✅ Hardcoded slippage protection (2 token minimum)
- ✅ Owner-only administrative functions
- ✅ Emergency pause mechanism
- ✅ Balance checks before transfers
- ✅ Immutable token addresses
- ✅ Reentrancy protection through checks-effects-interactions pattern

## Token Decimals

Both USDC and EURC use **6 decimals**:
- 1 USDC = `1,000,000` = `1e6`
- 1 EURC = `1,000,000` = `1e6`
- 100 USDC = `100,000,000` = `100e6`

## Common Operations

### Check Pool Liquidity
```solidity
pool.getPoolBalance()
// Returns: (usdcBalance: 10000000000, eurcBalance: 10000000000)
// Means: 10,000 USDC and 10,000 EURC available
```

### Pause Trading (Emergency)
```solidity
pool.setPaused(true)  // Pause all swaps
pool.setPaused(false) // Resume trading
```

### Withdraw Profits
```solidity
// Withdraw USDC
pool.withdraw(0x3600000000000000000000000000000000000000, 1000000000)

// Withdraw EURC
pool.withdraw(0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a, 1000000000)
```

## Requirements

- Solidity ^0.8.0
- OpenZeppelin Contracts
  - `@openzeppelin/contracts/token/ERC20/IERC20.sol`
  - `@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol`
  - `@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol`

## Architecture

```
┌─────────────────────────────────────┐
│      SimpleSwapPool Contract        │
├─────────────────────────────────────┤
│  USDC Pool  │  EURC Pool            │
│  10,000     │  10,000               │
├─────────────────────────────────────┤
│  Exchange Rate: 1:1 (1e18)          │
│  Fee: 0.3% (30 basis points)        │
│  Min Output: 2 tokens               │
└─────────────────────────────────────┘
         ↕                ↕
    swapUSDC()       swapEURC()
         ↕                ↕
   User → USDC      User → EURC
   User ← EURC      User ← USDC
```

## Limitations & Considerations

1. **Fixed Exchange Rate**: Rate is hardcoded at deployment (1:1). No dynamic pricing.
2. **Manual Rate Updates**: Would require contract modification to change rate.
3. **Minimum Output**: 2 token minimum may be restrictive for small swaps.
4. **No LP Tokens**: This is not an AMM - owner manages liquidity directly.
5. **Centralized Control**: Owner has full control over pools and settings.
