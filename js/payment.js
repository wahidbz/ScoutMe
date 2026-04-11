window.Payment = (() => {
  const WALLET = window.SCOUTME_CONFIG ? window.SCOUTME_CONFIG.wallet : "";
  const PLANS = {
    boost: { key: "boost", label: "Profile Boost", amount: 1, icon: "🚀", description: "Boost your profile for 7 days.", effect: { boosted: true, boostDays: 7 } },
    unlock_contact: { key: "unlock_contact", label: "Unlock Contact", amount: 2, icon: "🔓", description: "Unlock direct contact access.", effect: { contactUnlocked: true } },
    hall_of_fame: { key: "hall_of_fame", label: "Hall of Fame Entry", amount: 3, icon: "🏛️", description: "Create a Hall of Fame card instantly.", effect: { hallEntry: true } },
    club_subscription: { key: "club_subscription", label: "Club Subscription", amount: 5, icon: "🏟️", description: "30-day club premium plan.", effect: { clubPremium: true } }
  };

  let accessToken = null;
  let username = "";
  let hasPaymentsScope = false;

  // Sandbox detection logic from Wallet Pi
  const params = new URLSearchParams(window.location.search);
  const sandboxParam = params.get("sandbox");
  let rememberedSandbox = null;
  try {
    if (sandboxParam === "1" || sandboxParam === "true") localStorage.setItem("pi_sandbox", "1");
    if (sandboxParam === "0" || sandboxParam === "false") localStorage.setItem("pi_sandbox", "0");
    rememberedSandbox = localStorage.getItem("pi_sandbox");
  } catch (e) { }

  const ref = (document.referrer || "").toLowerCase();
  const isFromSandboxUi = ref.includes("sandbox.minepi.com");

  const isSandbox =
    sandboxParam === "1" ||
    sandboxParam === "true" ||
    rememberedSandbox === "1" ||
    isFromSandboxUi ||
    window.location.hostname === "sandbox.minepi.com" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (window.Pi) {
    Pi.init({ version: "2.0", sandbox: isSandbox });
  }

  async function apiPost(path, payload) {
    // Netlify function mapping as per Wallet Pi
    const isNetlify = window.location.hostname.endsWith(".netlify.app") || window.location.hostname.endsWith(".netlify.live");
    const functionMap = {
      "/payment/approve": "/.netlify/functions/payment-approve",
      "/payment/complete": "/.netlify/functions/payment-complete",
      "/payment/cancel": "/.netlify/functions/payment-cancel"
    };
    const url = isNetlify && functionMap[path] ? functionMap[path] : path;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {})
    });

    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = text;
    }

    if (!response.ok) {
      throw new Error(typeof data === "string" ? data : JSON.stringify(data));
    }
    return data;
  }

  async function ensureAuth(scopes) {
    const requestedScopes = Array.isArray(scopes) && scopes.length ? scopes : ["username"];
    const needsPayments = requestedScopes.includes("payments");

    if (accessToken && (!needsPayments || hasPaymentsScope)) {
      return { accessToken, username, hasPaymentsScope };
    }

    const auth = await Pi.authenticate(requestedScopes, async function (payment) {
      try {
        const paymentId = payment && payment.identifier;
        const txid = payment && payment.transaction && payment.transaction.txid;
        if (paymentId && txid) {
          await apiPost("/payment/complete", { paymentId, txid });
        } else if (paymentId) {
          await apiPost("/payment/cancel", { paymentId });
        }
      } catch (err) {
        console.error("Auth callback error:", err);
      }
    });

    accessToken = auth && auth.accessToken ? auth.accessToken : null;
    username = auth && auth.user && auth.user.username ? auth.user.username : "";
    if (needsPayments) hasPaymentsScope = true;

    return { accessToken, username, hasPaymentsScope };
  }

  async function createPayment(planKey, user, metadata = {}) {
    const plan = PLANS[planKey];
    if (!plan) throw new Error("Unknown payment plan.");
    if (!window.Pi) throw new Error("Pi SDK not available.");

    Utils.showLoader(`Initiating ${plan.label}...`);

    try {
      // Step 1: Ensure Auth
      await ensureAuth(["username", "payments"]);

      // Step 2: Create Payment
      return Pi.createPayment(
        {
          amount: plan.amount,
          memo: `ScoutMe • ${plan.label}`,
          metadata: {
            uid: user.uid,
            username: user.username,
            plan: plan.key,
            ...metadata
          }
        },
        {
          onReadyForServerApproval: async function (paymentId) {
            try {
              Utils.showLoader("Approving payment on server...");
              await apiPost("/payment/approve", { paymentId, accessToken });
            } catch (err) {
              console.error(err);
              Utils.toast("error", "Server Approval Failed", "Please ensure PI_SERVER_API_KEY is set.");
              Utils.hideLoader();
            }
          },
          onReadyForServerCompletion: async function (paymentId, txid) {
            try {
              Utils.showLoader("Completing transaction...");
              await apiPost("/payment/complete", { paymentId, txid, accessToken });
              await applyPlan(planKey, user, paymentId, txid);
            } catch (err) {
              console.error(err);
              Utils.toast("error", "Transaction Sync Failed", "Payment might be completed, but server sync failed.");
            } finally {
              Utils.hideLoader();
            }
          },
          onCancel: function (paymentId) {
            Utils.hideLoader();
            Utils.toast("warning", "Cancelled", "Payment was cancelled.");
            if (paymentId) {
              apiPost("/payment/cancel", { paymentId }).catch(() => { });
            }
          },
          onError: function (error) {
            Utils.hideLoader();
            Utils.toast("error", "Payment Error", error.message || "An unexpected error occurred.");
          }
        }
      );
    } catch (e) {
      Utils.hideLoader();
      console.error(e);
      Utils.toast("error", "Pi Auth Failed", "Open in Pi Browser and grant permissions.");
    }
  }

  async function applyPlan(planKey, user, paymentId, txid) {
    const plan = PLANS[planKey];
    if (!plan) return;

    if (planKey === "boost") {
      const boostUntil = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString();
      await DB.updateUser(user.uid, { boosted: true, boostUntil });
    } else if (planKey === "unlock_contact") {
      await DB.updateUser(user.uid, { contactUnlocked: true });
    } else if (planKey === "hall_of_fame") {
      await ScoutMeFirebase.getDB().collection("hall_of_fame").add({
        uid: user.uid,
        playerId: user.uid,
        playerName: user.username,
        clubName: "ScoutMe Spotlight",
        sport: user.sport,
        transferValue: plan.amount,
        currency: "PI",
        season: "2026",
        type: "paid_hall_entry",
        createdAt: ScoutMeFirebase.serverTimestamp()
      });
    } else if (planKey === "club_subscription") {
      const until = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString();
      await DB.updateUser(user.uid, { clubPremium: true, clubSubscriptionUntil: until });
    }

    await DB.addNotification(user.uid, {
      type: "payment_completed",
      title: `${plan.label} activated`,
      message: `Transaction successful! TX: ${txid.slice(0, 8)}...`,
      link: "/dashboard.html"
    });

    Utils.toast("success", "Payment Success", `${plan.label} is now active.`);
  }

  function plansHTML() {
    return Object.values(PLANS).map((plan) => `
      <div class="reward-card glass mb-2">
        <div class="row-between">
          <div>
            <div style="font-weight:800; font-size:1.1rem">${plan.icon} ${plan.label}</div>
            <div class="small text-muted mt-1">${plan.description}</div>
          </div>
          <div class="badge gold">${plan.amount} Pi</div>
        </div>
        <button class="btn-pi mt-2" data-pay="${plan.key}">Purchase with Pi</button>
      </div>
    `).join("");
  }

  return { WALLET, PLANS, createPayment, applyPlan, plansHTML, ensureAuth };
})();
