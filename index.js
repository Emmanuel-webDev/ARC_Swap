// ─── THIRDWEB v5 IMPORTS ──────────────────────────────────────────────────────
import {
  createThirdwebClient,
  defineChain,
} from "https://esm.sh/thirdweb@5.92.0";
import {
  inAppWallet,
  preAuthenticate,
} from "https://esm.sh/thirdweb@5.92.0/wallets/in-app";
import { ethers6Adapter } from "https://esm.sh/thirdweb@5.92.0/adapters/ethers6";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const CONFIG = {
  SWAP_CONTRACT: "0x37757AD0A16bFa13184507d16f34f043b7A63382",
  USDC_ADDRESS: "0x3600000000000000000000000000000000000000",
  EURC_ADDRESS: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
  CHAIN_ID: 5042002,
  RPC_URL: "https://5042002.rpc.thirdweb.com",
  THIRDWEB_CLIENT_ID: "c4c035e19e102d32899f3d4e47a5572f", 
};

// ─── THIRDWEB CLIENT & CHAIN (global scope — accessible everywhere) ───────────
const thirdwebClient = createThirdwebClient({
  clientId: CONFIG.THIRDWEB_CLIENT_ID,
});

const arcChain = defineChain({
  id: CONFIG.CHAIN_ID,
  rpc: CONFIG.RPC_URL,
  nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 18 },
});

// ─── CONTRACT ABIs ────────────────────────────────────────────────────────────
const SWAP_ABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
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
      { indexed: true, internalType: "address", name: "user", type: "address" },
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
      { indexed: false, internalType: "uint256", name: "fee", type: "uint256" },
    ],
    name: "eurcSwap",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
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
      { indexed: false, internalType: "uint256", name: "fee", type: "uint256" },
    ],
    name: "usdcSwap",
    type: "event",
  },
  {
    inputs: [],
    name: "EURC",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "USDC",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "usdcAmount", type: "uint256" }],
    name: "calculateEurcAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "eurcAmount", type: "uint256" }],
    name: "calculateUsdcAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "exchangeRate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "feePercentage",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "fundPoolWithEURC",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "fundPoolWithUSDC",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "usdcAmount", type: "uint256" }],
    name: "getEurcQuote",
    outputs: [
      { internalType: "uint256", name: "eurcAmount", type: "uint256" },
      { internalType: "uint256", name: "fee", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPoolBalance",
    outputs: [
      { internalType: "uint256", name: "usdcBalance", type: "uint256" },
      { internalType: "uint256", name: "eurcBalance", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "eurcAmount", type: "uint256" }],
    name: "getUsdcQuote",
    outputs: [
      { internalType: "uint256", name: "usdcAmount", type: "uint256" },
      { internalType: "uint256", name: "fee", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bool", name: "_paused", type: "bool" }],
    name: "setPaused",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "eurcAmount", type: "uint256" }],
    name: "swapEURC",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "usdcAmount", type: "uint256" }],
    name: "swapUSDC",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
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

// ─── APP STATE ────────────────────────────────────────────────────────────────
let provider, signer, swapContract, usdcContract, eurcContract;
let walletAddress = null;
let swapDirection = "usdc";
let activeWallet = null;

// ─── DOM ELEMENTS ─────────────────────────────────────────────────────────────
const walletBtn = document.getElementById("walletBtn");
const swapBtn = document.getElementById("swapBtn");
const fromAmount = document.getElementById("fromAmount");
const toAmount = document.getElementById("toAmount");
const statusMessage = document.getElementById("statusMessage");
const tokenOptions = document.querySelectorAll(".token-option");
const swapArrow = document.getElementById("swapDirection");

// ─── EMAIL LOGIN MODAL ────────────────────────────────────────────────────────
function showEmailModal() {
  const existing = document.getElementById("aaModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "aaModal";
  modal.innerHTML = `
    <div style="
      position:fixed;inset:0;background:rgba(0,0,0,0.75);
      display:flex;align-items:center;justify-content:center;z-index:9999;">
      <div style="
        background:#0f0f1a;border:1px solid #6d28d9;border-radius:20px;
        padding:36px 32px;width:340px;text-align:center;
        box-shadow:0 0 40px rgba(109,40,217,0.3);">
        <div style="font-size:32px;margin-bottom:8px">⚡</div>
        <h3 style="color:#fff;margin:0 0 6px;font-size:20px">Gasless Login</h3>
        <p style="color:#9ca3af;font-size:13px;margin:0 0 24px;line-height:1.5">
          Sign in with your email — no wallet needed, no gas fees
        </p>
        <input id="aaEmail" type="email" placeholder="you@email.com"
          style="width:100%;padding:11px 14px;border-radius:10px;
                 background:#1a1a2e;border:1px solid #374151;color:#fff;
                 font-size:14px;box-sizing:border-box;margin-bottom:10px;outline:none"/>
        <button id="aaEmailSend" style="
          width:100%;padding:12px;border-radius:10px;
          background:#6d28d9;color:#fff;border:none;
          font-size:15px;cursor:pointer;font-weight:600;">
          Send OTP Code
        </button>
        <div id="aaOTPSection" style="display:none;margin-top:14px">
          <p style="color:#6ee7b7;font-size:12px;margin:0 0 10px">
            ✓ Code sent! Check your inbox
          </p>
          <input id="aaOTP" type="text" placeholder="Enter 6-digit code"
            style="width:100%;padding:11px 14px;border-radius:10px;
                   background:#1a1a2e;border:1px solid #374151;color:#fff;
                   font-size:16px;box-sizing:border-box;margin-bottom:10px;
                   letter-spacing:6px;text-align:center;outline:none"/>
          <button id="aaOTPVerify" style="
            width:100%;padding:12px;border-radius:10px;
            background:#059669;color:#fff;border:none;
            font-size:15px;cursor:pointer;font-weight:600;">
            Connect Wallet
          </button>
        </div>
        <p id="aaModalMsg" style="color:#f87171;font-size:13px;margin-top:12px;min-height:18px"></p>
        <hr style="border:none;border-top:1px solid #1f2937;margin:20px 0"/>
        <button id="aaMetaMask" style="
          width:100%;padding:11px;border-radius:10px;
          background:#1a1a2e;color:#d1d5db;border:1px solid #374151;
          font-size:14px;cursor:pointer;">
          🦊 Use MetaMask instead
        </button>
        <button id="aaClose" style="
          margin-top:10px;background:none;border:none;
          color:#6b7280;cursor:pointer;font-size:12px;
          display:block;width:100%;text-align:center;">
          Cancel
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Send OTP
  document.getElementById("aaEmailSend").onclick = async () => {
    const email = document.getElementById("aaEmail").value.trim();
    if (!email) {
      document.getElementById("aaModalMsg").textContent =
        "Please enter your email";
      return;
    }
    const btn = document.getElementById("aaEmailSend");
    btn.textContent = "Sending...";
    btn.disabled = true;
    document.getElementById("aaModalMsg").textContent = "";
    try {
      await sendEmailOTP(email);
      document.getElementById("aaOTPSection").style.display = "block";
      btn.textContent = "Resend Code";
      btn.disabled = false;
    } catch (e) {
      document.getElementById("aaModalMsg").textContent =
        "Failed to send: " + e.message;
      btn.textContent = "Send OTP Code";
      btn.disabled = false;
    }
  };

  // Verify OTP
  document.getElementById("aaOTPVerify").onclick = async () => {
    const email = document.getElementById("aaEmail").value.trim();
    const otp = document.getElementById("aaOTP").value.trim();
    if (!otp) {
      document.getElementById("aaModalMsg").textContent =
        "Please enter the code";
      return;
    }
    const btn = document.getElementById("aaOTPVerify");
    btn.textContent = "Connecting...";
    btn.disabled = true;
    document.getElementById("aaModalMsg").textContent = "";
    try {
      await connectWithEmailOTP(email, otp);
      modal.remove();
    } catch (e) {
      console.error("OTP verify error:", e);
      document.getElementById("aaModalMsg").textContent =
        e.message.toLowerCase().includes("invalid") ||
        e.message.toLowerCase().includes("code")
          ? "Invalid code — please try again"
          : "Error: " + e.message;
      btn.textContent = "Connect Wallet";
      btn.disabled = false;
    }
  };

  // MetaMask fallback
  document.getElementById("aaMetaMask").onclick = async () => {
    modal.remove();
    await connectMetaMask();
  };

  // Close
  document.getElementById("aaClose").onclick = () => modal.remove();
}

// ─── SEND EMAIL OTP ───────────────────────────────────────────────────────────
async function sendEmailOTP(email) {
  await preAuthenticate({
    client: thirdwebClient,
    strategy: "email",
    email,
  });
}

// ─── CONNECT WITH EMAIL OTP + ERC-4337 SMART ACCOUNT ─────────────────────────
async function connectWithEmailOTP(email, otp) {
  showMessage("Verifying code...", "success");

  // Configure inAppWallet with EIP-4337 smart account + sponsored gas
  const wallet = inAppWallet({
    executionMode: {
      mode: "EIP4337",
      smartAccount: {
        chain: arcChain,
        sponsorGas: true,
      },
    },
  });

  // Connect verifies OTP and returns the smart account
  const account = await wallet.connect({
    client: thirdwebClient,
    chain: arcChain,
    strategy: "email",
    email,
    verificationCode: otp,
  });

  activeWallet = wallet;
  await finalizeConnection(account, "email");
  sessionStorage.setItem("arc_connected_email", email);
  sessionStorage.setItem("arc_connect_method", "email");
}

// ─── CONNECT WITH METAMASK ────────────────────────────────────────────────────
async function connectMetaMask() {
  if (!window.ethereum) {
    showMessage("MetaMask not found. Please use email login.", "error");
    return;
  }
  try {
    showMessage("Connecting MetaMask...", "success");
    // ethers v6 — BrowserProvider replaces Web3Provider
    const mmProvider = new ethers.BrowserProvider(window.ethereum);
    await mmProvider.send("eth_requestAccounts", []);
    signer = await mmProvider.getSigner(); // async in ethers v6
    provider = mmProvider;
    walletAddress = await signer.getAddress();
    initContracts();
    updateWalletUI(walletAddress, false);
    await updateBalances();
    await updatePoolStats();
    showMessage("MetaMask connected!", "success");
  } catch (e) {
    showMessage("MetaMask failed: " + e.message, "error");
  }

  sessionStorage.setItem("arc_connect_method", "metamask");
}

// ─── AUTO RECONNECT ────────────────────────────────────────────────────
async function tryAutoConnect() {
  try {
    const savedEmail = sessionStorage.getItem("arc_connected_email");
    const savedMethod = sessionStorage.getItem("arc_connect_method");

    if (!savedMethod) return;

    if (savedMethod === "metamask") {
      if (!window.ethereum) return;
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length === 0) return;
      showMessage("Reconnecting...", "success");
      await connectMetaMask();
      return;
    }

    if (savedMethod === "email" && savedEmail) {
      showMessage("Reconnecting...", "success");

      const wallet = inAppWallet({
        executionMode: {
          mode: "EIP4337",
          smartAccount: { chain: arcChain, sponsorGas: true },
        },
      });

      const account = await wallet.autoConnect({
        client: thirdwebClient,
        chain: arcChain,
      });

      activeWallet = wallet;
      await finalizeConnection(account, "email");
    }
  } catch (e) {
    console.log("Auto-connect failed:", e.message);
    sessionStorage.removeItem("arc_connected_email");
    sessionStorage.removeItem("arc_connect_method");
  }
}

// ─── FINALIZE CONNECTION ──────────────────────────────────────────────────────
async function finalizeConnection(account, method) {
  showMessage("Setting up smart account...", "success");

  // ethers6Adapter.signer.toEthers() — NOT async, returns Signer directly
  // This is the correct v6 API per thirdweb docs
  signer = ethers6Adapter.signer.toEthers({
    client: thirdwebClient,
    chain: arcChain,
    account,
  });

  // ethers6Adapter.provider.toEthers() — also NOT async
  provider = ethers6Adapter.provider.toEthers({
    client: thirdwebClient,
    chain: arcChain,
  });

  // getAddress() is async in ethers v6
  walletAddress = await signer.getAddress();

  initContracts();
  updateWalletUI(walletAddress, true);
  await updateBalances();
  await updatePoolStats();

  showMessage(
    method === "email"
      ? "Connected! Your swaps are gasless ⚡"
      : "Smart account connected ⚡",
    "success",
  );
}

// ─── INIT CONTRACTS ───────────────────────────────────────────────────────────
function initContracts() {
  swapContract = new ethers.Contract(CONFIG.SWAP_CONTRACT, SWAP_ABI, signer);
  usdcContract = new ethers.Contract(CONFIG.USDC_ADDRESS, ERC20_ABI, signer);
  eurcContract = new ethers.Contract(CONFIG.EURC_ADDRESS, ERC20_ABI, signer);
}

// ─── UPDATE WALLET BUTTON UI ──────────────────────────────────────────────────
function updateWalletUI(address, gasless) {
  walletBtn.textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;
  walletBtn.classList.add("connected");

  if (gasless) {
    const badge = document.createElement("span");
    badge.textContent = "⚡ Gasless";
    badge.style.cssText =
      "background:#059669;color:#fff;padding:2px 8px;border-radius:99px;" +
      "font-size:11px;margin-left:8px;font-weight:600;vertical-align:middle;";
    walletBtn.appendChild(badge);
  }

  // Click to copy full address
  walletBtn.title = address; // show full address on hover too
  walletBtn.onclick = () => {
    navigator.clipboard
      .writeText(address)
      .then(() => {
        const original = walletBtn.innerHTML;
        walletBtn.textContent = "✓ Copied!";
        walletBtn.style.background = "#059669";
        setTimeout(() => {
          walletBtn.innerHTML = original;
          walletBtn.style.background = "";
        }, 2000);
      })
      .catch(() => {
        // Fallback for browsers that block clipboard API
        prompt("Copy your address:", address);
      });
  };

  swapBtn.disabled = false;
  swapBtn.textContent = "Enter Amount";
}

// ─── WALLET BUTTON CLICK ──────────────────────────────────────────────────────
walletBtn.addEventListener("click", () => {
  if (walletAddress) return;
  showEmailModal();
});

// ─── TOKEN DIRECTION ──────────────────────────────────────────────────────────
tokenOptions.forEach((option) => {
  option.addEventListener("click", () => {
    tokenOptions.forEach((opt) => opt.classList.remove("active"));
    option.classList.add("active");
    swapDirection = option.dataset.direction;
    updateTokenLabels();
    calculateOutput();
  });
});

swapArrow.addEventListener("click", () => {
  swapDirection = swapDirection === "usdc" ? "eurc" : "usdc";
  tokenOptions.forEach((opt) => {
    opt.classList.toggle("active", opt.dataset.direction === swapDirection);
  });
  updateTokenLabels();
  calculateOutput();
});

function updateTokenLabels() {
  document.getElementById("fromToken").textContent =
    swapDirection === "usdc" ? "USDC" : "EURC";
  document.getElementById("toToken").textContent =
    swapDirection === "usdc" ? "EURC" : "USDC";
  document.getElementById("feeAmount").textContent =
    swapDirection === "usdc" ? "0.00 EURC" : "0.00 USDC";
}

// ─── CALCULATE OUTPUT ─────────────────────────────────────────────────────────
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
    // ethers v6 — parseUnits is top-level, no .utils
    const amountWei = ethers.parseUnits(amount, 6);
    let quote, fee;
    if (swapDirection === "usdc") {
      [quote, fee] = await swapContract.getEurcQuote(amountWei);
    } else {
      [quote, fee] = await swapContract.getUsdcQuote(amountWei);
    }
    // ethers v6 — formatUnits is top-level, no .utils
    toAmount.value = ethers.formatUnits(quote, 6);
    document.getElementById("feeAmount").textContent =
      ethers.formatUnits(fee, 6) +
      (swapDirection === "usdc" ? " EURC" : " USDC");

    const outputNum = parseFloat(ethers.formatUnits(quote, 6));
    swapBtn.disabled = outputNum < 2.0;
    swapBtn.textContent =
      outputNum < 2.0
        ? "Amount too small (min 2 tokens)"
        : `Swap ${amount} ${swapDirection.toUpperCase()}`;
  } catch (e) {
    console.error("Quote error:", e);
    toAmount.value = "";
  }
}

// ─── EXECUTE SWAP ─────────────────────────────────────────────────────────────
swapBtn.addEventListener("click", async () => {
  const amount = fromAmount.value;
  if (!amount || parseFloat(amount) <= 0) {
    showMessage("Please enter a valid amount", "error");
    return;
  }
  try {
    swapBtn.disabled = true;
    swapBtn.innerHTML = '<div class="spinner"></div> Processing...';

    const amountWei = ethers.parseUnits(amount, 6); // ethers v6
    const tokenContract =
      swapDirection === "usdc" ? usdcContract : eurcContract;
    const allowance = await tokenContract.allowance(
      walletAddress,
      CONFIG.SWAP_CONTRACT,
    );

    // ethers v6 — BigInt comparison with < instead of .lt()
    if (allowance < amountWei) {
      showMessage("Approving tokens... (gasless ⚡)", "success");
      const approveTx = await tokenContract.approve(
        CONFIG.SWAP_CONTRACT,
        ethers.MaxUint256, // ethers v6
      );
      await approveTx.wait();
    }

    showMessage("Swapping tokens... (gasless ⚡)", "success");
    const swapTx =
      swapDirection === "usdc"
        ? await swapContract.swapUSDC(amountWei)
        : await swapContract.swapEURC(amountWei);

    await swapTx.wait();

    showMessage("Swap successful! 🎉", "success");
    fromAmount.value = "";
    toAmount.value = "";
    await updateBalances();
    await updatePoolStats();
    swapBtn.textContent = "Enter Amount";
    swapBtn.disabled = false;
  } catch (e) {
    console.error("Swap error:", e);
    showMessage(e.reason || e.message || "Swap failed", "error");
    swapBtn.textContent = `Swap ${fromAmount.value} ${swapDirection.toUpperCase()}`;
    swapBtn.disabled = false;
  }
});

// ─── UPDATE BALANCES ──────────────────────────────────────────────────────────
async function updateBalances() {
  if (!walletAddress) return;
  try {
    const usdcBal = await usdcContract.balanceOf(walletAddress);
    const eurcBal = await eurcContract.balanceOf(walletAddress);
    // ethers v6 — formatUnits top-level
    document.getElementById("fromBalance").textContent = ethers.formatUnits(
      swapDirection === "usdc" ? usdcBal : eurcBal,
      6,
    );
    document.getElementById("toBalance").textContent = ethers.formatUnits(
      swapDirection === "usdc" ? eurcBal : usdcBal,
      6,
    );
  } catch (e) {
    console.error("Balance error:", e);
  }
}

// ─── UPDATE POOL STATS ────────────────────────────────────────────────────────
async function updatePoolStats() {
  try {
    const [usdcPool, eurcPool] = await swapContract.getPoolBalance();
    const usdcF = parseFloat(ethers.formatUnits(usdcPool, 6));
    const eurcF = parseFloat(ethers.formatUnits(eurcPool, 6));
    document.getElementById("usdcPool").textContent = usdcF.toLocaleString(
      "en-US",
      { maximumFractionDigits: 2 },
    );
    document.getElementById("eurcPool").textContent = eurcF.toLocaleString(
      "en-US",
      { maximumFractionDigits: 2 },
    );
    document.getElementById("totalLiquidity").textContent =
      "$" +
      (usdcF + eurcF).toLocaleString("en-US", { maximumFractionDigits: 2 });
  } catch (e) {
    console.error("Pool stats error:", e);
    document.getElementById("totalLiquidity").textContent = "Error loading";
  }
}

// ─── SHOW STATUS MESSAGE ──────────────────────────────────────────────────────
function showMessage(text, type) {
  statusMessage.textContent = text;
  statusMessage.className = `status-message ${type} show`;
  setTimeout(() => statusMessage.classList.remove("show"), 5000);
}

// ─── AUTO REFRESH ─────────────────────────────────────────────────────────────
setInterval(() => {
  if (walletAddress) {
    updatePoolStats();
    updateBalances();
  }
}, 30000);

// ─── METAMASK ACCOUNT CHANGE ──────────────────────────────────────────────────
window.ethereum.on("accountsChanged", (accounts) => {
  if (accounts.length === 0) {
    sessionStorage.removeItem("arc_connected_email");
    sessionStorage.removeItem("arc_connect_method");
    walletAddress = null;
    walletBtn.textContent = "Connect Wallet";
    walletBtn.classList.remove("connected");
    swapBtn.disabled = true;
    swapBtn.textContent = "Connect Wallet to Swap";
  } else {
    window.location.reload();
  }
});

tryAutoConnect();
