import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
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

    <div class="row">
      <div class="label">Mode</div>
      <div class="value">${tx.mode || "Instant"}</div>
    </div>

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
