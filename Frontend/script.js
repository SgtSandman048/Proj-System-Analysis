// ดักการ submit ที่หน้าแรก
if (document.getElementById("tradeForm")) {
  document.getElementById("tradeForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const tradeData = {
      type: document.getElementById("type").value,
      game: document.getElementById("game").value,
      item: document.getElementById("item").value,
      imageUrl: document.getElementById("imageUrl").value,
      price: document.getElementById("price").value,
      quantity: document.getElementById("quantity").value
    };
    localStorage.setItem("tradeData", JSON.stringify(tradeData));
    window.location.href = "confirm.html";
  });
}

// หน้า confirm
if (document.getElementById("confirmData")) {
  const data = JSON.parse(localStorage.getItem("tradeData"));
  document.getElementById("confirmData").innerHTML = `
    <p><b>Type:</b> ${data.type}</p>
    <p><b>Game:</b> ${data.game}</p>
    <p><b>Item:</b> ${data.item}</p>
    <p><b>Price:</b> ${data.price}</p>
    <p><b>Quantity:</b> ${data.quantity}</p>
    ${data.imageUrl ? `<img src="${data.imageUrl}" width="150">` : ""}
  `;

  document.getElementById("confirmBtn").addEventListener("click", async () => {
    const res = await fetch("http://localhost:5000/api/trade/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    alert("Trade Added Successfully!");
    localStorage.removeItem("tradeData");
    window.location.href = "index.html";
  });
}
