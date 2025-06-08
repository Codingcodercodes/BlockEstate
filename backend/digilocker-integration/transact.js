const express = require('express');
const algosdk = require('algosdk');
require('dotenv').config();

const router = express.Router();

// Load environment variables from .env
const algodToken = process.env.ALGOD_TOKEN;
const algodServer = process.env.ALGOD_SERVER;
const algodPort = process.env.ALGOD_PORT;
const senderMnemonic = process.env.SENDER_MNEMONIC; // The mnemonic of the wallet sending the funds

const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

router.post('/api/transact', async (req, res) => {
  const { receiver, amount } = req.body;

  try {
    const senderAccount = algosdk.mnemonicToSecretKey(senderMnemonic);

    const suggestedParams = await algodClient.getTransactionParams().do();

    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: senderAccount.addr,
      to: receiver,
      amount: algosdk.algosToMicroalgos(parseFloat(amount)), // Convert ALGO to microAlgos
      suggestedParams,
    });

    const signedTxn = txn.signTxn(senderAccount.sk);
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();

    await algosdk.waitForConfirmation(algodClient, txId, 4);

    res.status(200).json({ message: 'Transaction successful', txId });
  } catch (err) {
    console.error('Transaction error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
