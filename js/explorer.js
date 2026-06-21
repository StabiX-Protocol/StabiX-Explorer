import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBNs4efcfPoHYk13cU8xuCdnTHOXL1yzT4",
  authDomain: "stabix-backend-v1.firebaseapp.com",
  projectId: "stabix-backend-v1",
  storageBucket: "stabix-backend-v1.firebasestorage.app",
  messagingSenderId: "351361221507",
  appId: "1:351361221507:web:ebaf0d15e86d4b184c6cb6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


window.verifySTR = async () => {

  const str = document
    .getElementById("strInput")
    .value
    .trim()
    .toUpperCase();

  if(!str) return;

  const q = query(
    collection(db,"transactions"),
    where("str","==",str)
  );

  const snap = await getDocs(q);

  const card = document.getElementById("resultCard")

  if(snap.empty){
    card.style.display = "block";
    card.innerHTML = `
      <div class="label">Status</div>
      <div class="value">Transaction Not Found</div>
    `;
    return;
    document.getElementById("resultCard").style.display = "block";
  }

  const tx = snap.docs[0].data();
  
  const dateText = tx.createdAt?.toDate
  ? tx.createdAt.toDate().toLocaleString()
  : tx.createdAt?.seconds
  ? new Date(tx.createdAt.seconds * 1000).toLocaleString()
  : "-";

  
  card.style.display = "block";

  card.innerHTML = `
    <div class="row">
      <div class="label">STR ID</div>
      <div class="value">${tx.str || "-"}</div>
    </div>

    <div class="row">
      <div class="label">Type</div>
      <div class="value">${tx.type || "-"}</div>
    </div>

    <div class="row">
      <div class="label">Asset</div>
      <div class="value">${tx.asset || "-"}</div>
    </div>

    <div class="row">
      <div class="label">Amount</div>
      <div class="value">${tx.amount || "-"}</div>
    </div>

    ${(tx.type === "deposit" || tx.type === "withdraw") ? `
<div class="row">
  <div class="label">Mode</div>
  <div class="value">${tx.mode || "Instant"}</div>
</div>
` : ``}

    <div class="row">
  <div class="label">Date</div>
  <div class="value">${dateText}</div>
</div>

${tx.type === "deposit" ? `
<div class="row">
  <div class="label">From</div>
  <div class="value">${tx.eoa || "-"}</div>
</div>

<div class="row">
  <div class="label">To</div>
  <div class="value">${tx.userId || "-"}</div>
</div>
` : tx.type === "withdraw" ? `
<div class="row">
  <div class="label">From</div>
  <div class="value">${tx.userId || "-"}</div>
</div>

<div class="row">
  <div class="label">To</div>
  <div class="value">${tx.eoa || "-"}</div>
</div>
` : `
<div class="row">
  <div class="label">From</div>
  <div class="value">${tx.userId || "-"}</div>
</div>

<div class="row">
  <div class="label">To</div>
  <div class="value">${tx.counterparty || "-"}</div>
</div>
`}
  `;
};
document.getElementById("verifyBtn").onclick = window.verifySTR;
document.getElementById("verifyBtn").addEventListener("click", window.verifySTR);
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("strInfo").addEventListener("click", () => {
    alert(
    "STR (StabiX Transaction Record) is the unique proof ID assigned to every transaction including deposit,withdraw,sent and receive in StabiX. Use it to verify your transaction details."
  );
  });
});

async function loadLiveTransactions(){

  const txRef = query(
    collection(db, "transactions"),
    orderBy("createdAt", "desc"),
    limit(5)
  );

  onSnapshot(txRef, (snapshot)=>{

    if(snapshot.empty){
  document.getElementById("liveTxList").innerHTML =
    `<div class="liveTxItem">No live transactions yet.</div>`;
  return;
    }

    let html = "";

    snapshot.forEach((doc)=>{

      const tx = doc.data();

      html += `
<div class="liveTxItem">
  <span class="liveSTR">
    ${tx.str.slice(0,3)}***${tx.str.slice(-4)}
  </span>

  <span class="liveTime">
    ${new Date(tx.createdAt?.toDate()).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })}
  </span>

  <span class="liveAsset">
    ${tx.asset}
  </span>

  <span class="liveAmount">
    ${tx.amount}
  </span>
</div>
`;
    });

    document.getElementById("liveTxList").innerHTML = html;

  });

}

loadLiveTransactions();

async function loadOverview(){

  const txRef = collection(db, "transactions");

  onSnapshot(txRef, (snapshot)=>{

    let totalTx = snapshot.size;
    let totalVolume = 0;

    snapshot.forEach((doc)=>{
      const tx = doc.data();
      totalVolume += Number(tx.amount || 0);
    });

    document.getElementById("totalTx").innerText = totalTx;
    document.getElementById("totalVolume").innerText = "$" + totalVolume;

  });

}

loadOverview();
