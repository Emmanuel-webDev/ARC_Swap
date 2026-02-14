import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.13.0/+esm";

// Contract Configuration
const CONFIG = {
  SWAP_CONTRACT: "0x37757AD0A16bFa13184507d16f34f043b7A63382",
  USDC_ADDRESS: "0x3600000000000000000000000000000000000000",
  EURC_ADDRESS: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
  CHAIN_ID: 5042002, // Arc blockchain chain ID
};

// Contract ABI (full ABI from your contract)
const SWAP_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "newRate",
        type: "uint256",
      },
    ],
    name: "ExchangeRateUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "newFee",
        type: "uint256",
      },
    ],
    name: "FeeUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "eurcAmount",
        type: "uint256",
      },
    ],
    name: "PoolFunded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "PoolWithdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "usdcAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "eurcAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
    ],
    name: "eurcSwap",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "eurcAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "usdcAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
    ],
    name: "usdcSwap",
    type: "event",
  },
  {
    inputs: [],
    name: "EURC",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "USDC",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "usdcAmount",
        type: "uint256",
      },
    ],
    name: "calculateEurcAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "eurcAmount",
        type: "uint256",
      },
    ],
    name: "calculateUsdcAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "exchangeRate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "feePercentage",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "fundPoolWithEURC",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "fundPoolWithUSDC",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "usdcAmount",
        type: "uint256",
      },
    ],
    name: "getEurcQuote",
    outputs: [
      {
        internalType: "uint256",
        name: "eurcAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPoolBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "usdcBalance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "eurcBalance",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "eurcAmount",
        type: "uint256",
      },
    ],
    name: "getUsdcQuote",
    outputs: [
      {
        internalType: "uint256",
        name: "usdcAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_paused",
        type: "bool",
      },
    ],
    name: "setPaused",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "eurcAmount",
        type: "uint256",
      },
    ],
    name: "swapEURC",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "usdcAmount",
        type: "uint256",
      },
    ],
    name: "swapUSDC",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const ERC20_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];

// State
let provider, signer, swapContract, usdcContract, eurcContract;
let walletAddress = null;
let swapDirection = "usdc"; // 'usdc' or 'eurc'

// DOM Elements
const walletBtn = document.getElementById("walletBtn");
const swapBtn = document.getElementById("swapBtn");
const fromAmount = document.getElementById("fromAmount");
const toAmount = document.getElementById("toAmount");
const statusMessage = document.getElementById("statusMessage");
const tokenOptions = document.querySelectorAll(".token-option");
const swapArrow = document.getElementById("swapDirection");

// Connect Wallet
walletBtn.addEventListener("click", async () => {
  if (!window.ethereum) {
    showMessage("Please install MetaMask or another Web3 wallet", "error");
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    walletAddress = accounts[0];
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    // Initialize contracts
    swapContract = new ethers.Contract(CONFIG.SWAP_CONTRACT, SWAP_ABI, signer);
    usdcContract = new ethers.Contract(CONFIG.USDC_ADDRESS, ERC20_ABI, signer);
    eurcContract = new ethers.Contract(CONFIG.EURC_ADDRESS, ERC20_ABI, signer);

    walletBtn.textContent = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    walletBtn.classList.add("connected");
    swapBtn.disabled = false;
    swapBtn.textContent = "Enter Amount";

    await updateBalances();
    await updatePoolStats();

    showMessage("Wallet connected successfully!", "success");
  } catch (error) {
    console.error("Connection error:", error);
    showMessage("Failed to connect wallet", "error");
  }
});

// Token Direction Selection
tokenOptions.forEach((option) => {
  option.addEventListener("click", () => {
    tokenOptions.forEach((opt) => opt.classList.remove("active"));
    option.classList.add("active");
    swapDirection = option.dataset.direction;
    updateTokenLabels();
    calculateOutput();
  });
});

// Swap Arrow
swapArrow.addEventListener("click", () => {
  swapDirection = swapDirection === "usdc" ? "eurc" : "usdc";
  tokenOptions.forEach((opt) => {
    if (opt.dataset.direction === swapDirection) {
      opt.classList.add("active");
    } else {
      opt.classList.remove("active");
    }
  });
  updateTokenLabels();
  calculateOutput();
  updateBalances();
});

// Update Token Labels
async function updateTokenLabels() {
  const fromToken = document.getElementById("fromToken");
  const toToken = document.getElementById("toToken");
  const fromBal = document.getElementById("fromBalance");
  const toBal = document.getElementById("toBalance");
  const feeAmount = document.getElementById("feeAmount");

  if (swapDirection === "usdc") {
    fromToken.textContent = "USDC";
    toToken.textContent = "EURC";
    feeAmount.textContent = "0.00 EURC";
  } else {
    fromToken.textContent = "EURC";
    toToken.textContent = "USDC";
    feeAmount.textContent = "0.00 USDC";
  }
}

// Calculate Output Amount
fromAmount.addEventListener("input", calculateOutput);

async function calculateOutput() {
  const amount = fromAmount.value;

  if (!amount || !walletAddress || parseFloat(amount) <= 0) {
    toAmount.value = "";
    document.getElementById("feeAmount").textContent =
      swapDirection === "usdc" ? "0.00 EURC" : "0.00 USDC";
    return;
  }

  try {
    const amountWei = ethers.parseUnits(amount, 6); // USDC/EURC have 6 decimals
    let quote, fee;

    if (swapDirection === "usdc") {
      const result = await swapContract.getEurcQuote(amountWei);
      quote = result[0];
      fee = result[1];
    } else {
      const result = await swapContract.getUsdcQuote(amountWei);
      quote = result[0];
      fee = result[1];
    }

    toAmount.value = ethers.formatUnits(quote, 6);
    document.getElementById("feeAmount").textContent =
      ethers.formatUnits(fee, 6) +
      (swapDirection === "usdc" ? " EURC" : " USDC");

    // Update button state
    if (parseFloat(ethers.formatUnits(quote, 6)) >= 2.0) {
      swapBtn.disabled = false;
      swapBtn.textContent = `Swap ${amount} ${swapDirection.toUpperCase()}`;
    } else {
      swapBtn.disabled = true;
      swapBtn.textContent = "Amount too small (min 2 tokens)";
    }
  } catch (error) {
    console.error("Quote error:", error);
    toAmount.value = "";
  }
}

// Execute Swap
swapBtn.addEventListener("click", async () => {
  const amount = fromAmount.value;

  if (!amount || parseFloat(amount) <= 0) {
    showMessage("Please enter a valid amount", "error");
    return;
  }

  try {
    swapBtn.disabled = true;
    swapBtn.innerHTML = '<div class="spinner"></div> Processing...';

    const amountWei = ethers.parseUnits(amount, 6);

    // Check and approve if needed
    const tokenContract =
      swapDirection === "usdc" ? usdcContract : eurcContract;
    const allowance = await tokenContract.allowance(
      walletAddress,
      CONFIG.SWAP_CONTRACT,
    );

    if (allowance < amountWei) {
      showMessage("Approving tokens...", "success");
      const approveTx = await tokenContract.approve(
        CONFIG.SWAP_CONTRACT,
        ethers.MaxUint256,
      );
      await approveTx.wait();
    }

    // Execute swap
    showMessage("Swapping tokens...", "success");
    let swapTx;

    if (swapDirection === "usdc") {
      swapTx = await swapContract.swapUSDC(amountWei);
    } else {
      swapTx = await swapContract.swapEURC(amountWei);
    }

    await swapTx.wait();

    showMessage("Swap successful!", "success");

    // Reset form
    fromAmount.value = "";
    toAmount.value = "";

    // Update balances
    await updateBalances();
    await updatePoolStats();

    swapBtn.textContent = "Enter Amount";
    swapBtn.disabled = false;
  } catch (error) {
    console.error("Swap error:", error);
    showMessage(error.message || "Swap failed", "error");
    swapBtn.textContent = `Swap ${amount} ${swapDirection.toUpperCase()}`;
    swapBtn.disabled = false;
  }
});

// Update Balances
async function updateBalances() {
  if (!walletAddress) return;

  try {
    const usdcBalance = await usdcContract.balanceOf(walletAddress);
    const eurcBalance = await eurcContract.balanceOf(walletAddress);

    if (swapDirection === "usdc") {
      document.getElementById("fromBalance").textContent = parseFloat(
        ethers.formatUnits(await usdcContract.balanceOf(walletAddress), 6),
      );

      document.getElementById("toBalance").textContent = parseFloat(
        ethers.formatUnits(await eurcContract.balanceOf(walletAddress), 6),
    );
    }else{
         document.getElementById("fromBalance").textContent = parseFloat(
           ethers.formatUnits(await eurcContract.balanceOf(walletAddress), 6),
         );

         document.getElementById("toBalance").textContent = parseFloat(
           ethers.formatUnits(await usdcContract.balanceOf(walletAddress), 6),
         );
    }

   
  } catch (error) {
    console.error("Balance update error:", error);
  }
}

// Update Pool Stats
async function updatePoolStats() {
  try {
    const result = await swapContract.getPoolBalance();
    const usdcPool = result[0];
    const eurcPool = result[1];

    const usdcFormatted = parseFloat(ethers.formatUnits(usdcPool, 6));
    const eurcFormatted = parseFloat(ethers.formatUnits(eurcPool, 6));
    const total = usdcFormatted + eurcFormatted;

    document.getElementById("usdcPool").textContent =`$${usdcFormatted.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
      

    document.getElementById("eurcPool").textContent =`€${eurcFormatted.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
      

    document.getElementById("totalLiquidity").textContent =
      "$" + total.toLocaleString("en-US", { maximumFractionDigits: 2 });
  } catch (error) {
    console.error("Pool stats error:", error);
    document.getElementById("totalLiquidity").textContent = "Error loading";
  }
}

// Show Status Message
function showMessage(text, type) {
  statusMessage.textContent = text;
  statusMessage.className = `status-message ${type} show`;

  setTimeout(() => {
    statusMessage.classList.remove("show");
  }, 5000);
}

// Auto-refresh pool stats every 30 seconds
setInterval(() => {
  if (walletAddress) {
    updatePoolStats();
    updateBalances();
  }
}, 30000);

// Listen for account changes
if (window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts) => {
    if (accounts.length === 0) {
      walletAddress = null;
      walletBtn.textContent = "Connect Wallet";
      walletBtn.classList.remove("connected");
      swapBtn.disabled = true;
      swapBtn.textContent = "Connect Wallet to Swap";
    } else {
      window.location.reload();
    }
  });
}
