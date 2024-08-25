// backend/server.js
const express = require("express");
const Midtrans = require("midtrans-client");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

let snap = new Midtrans.Snap({
  isProduction: false,
  serverKey: "SB-Mid-server-GwahNiq5zOXTKfdYg1Ho_DOg", // Ganti dengan Server Key Anda
});

app.post("/create-transaction", async (req, res) => {
  try {
    const { transactionDetails, itemDetails } = req.body;

    const parameter = {
      transaction_details: {
        order_id: `ORDER-${Date.now()}`,
        gross_amount: transactionDetails.gross_amount,
      },
      item_details: itemDetails,
    }; // Hapus bagian credit_card

    console.log("Data yang dikirim ke Midtrans:", parameter);
    const transaction = await snap.createTransaction(parameter);
    res.json({ transactionToken: transaction.token });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Gagal membuat transaksi" });
  }
});

app.listen(port, () => {
  console.log(`Backend API berjalan di http://localhost:${port}`);
});
