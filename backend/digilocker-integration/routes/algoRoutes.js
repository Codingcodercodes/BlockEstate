const express = require('express');
const algosdk = require('algosdk');
const { getAlgodClient } = require('../utils/algorand');

const router = express.Router();

router.post('/transact', async (req, res) => {
  const algodClient = getAlgodClient();
  const { receiver, amount } = req.body;

  if (!algodClient) return res.status(500).json({ error: 'Algod client not initialized' });
  if (!receiver || !amount) return res.status(400).json({ message: 'Receiver and amount required' });

  try {
    const sender = algosdk.mnemonicToSecretKey(process.env.SENDER_MNEMONIC);
    const params = await algodClient.getTransactionParams().do();

    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: sender.addr,
      to: receiver,
      amount: algosdk.algosToMicroalgos(Number(amount)),
      suggestedParams: params,
    });

    const signedTxn = txn.signTxn(sender.sk);
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    await algosdk.waitForConfirmation(algodClient, txId, 4);

    res.json({ message: 'Transaction successful', txId });
  } catch (err) {
    console.error('Transaction error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
