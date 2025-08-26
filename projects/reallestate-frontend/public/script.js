let accessToken = "";
let selectedDocHash = "";
function getAccessToken() { 
  fetch("/api/token")
    .then(res => res.json())
    .then(data => {
      accessToken = data.access_token;
      document.getElementById("token-display").textContent = `Access Token: ${accessToken}`;
      document.getElementById("docs-section").style.display = "block";
    })
    .catch(err => {
      console.error(err);
      alert("Failed to get access token.");
    });
}
function fetchDocuments() {
  fetch("/api/documents", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("document-list");
      list.innerHTML = "";
      data.forEach(doc => {
        const li = document.createElement("li");
        li.textContent = `Hash: ${doc.hash}`;
        selectedDocHash = doc.hash;
        list.appendChild(li);
      });
      document.getElementById("action-section").style.display = "block";
    })
    .catch(err => {
      console.error(err);
      alert("Failed to fetch documents.");
    });
}

function createAsset() {
  fetch("/api/create-asset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hash: selectedDocHash })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("status").textContent = "Asset created successfully!";
    })
    .catch(err => {
      console.error(err);
      alert("Asset creation failed.");
    });
}

function transferOwnership() {
  fetch("/api/transfer-ownership", {
    method: "POST"
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("status").textContent = "Ownership transferred successfully!";
    })
    .catch(err => {
      console.error(err);
      alert("Ownership transfer failed.");
    });
}










