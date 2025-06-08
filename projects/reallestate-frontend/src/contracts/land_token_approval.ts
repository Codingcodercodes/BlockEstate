import algosdk from 'algosdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration - Fetch from environment
const ALGOD_TOKEN = process.env.ALGOD_TOKEN || '';
const ALGOD_ADDRESS = process.env.ALGOD_ADDRESS || '';
const LAND_TOKEN_ID = process.env.LAND_TOKEN_ID || ''; // Land token asset ID
const CREATOR_ADDRESS = process.env.CREATOR_ADDRESS || '';
const CREATOR_PRIVATE_KEY = process.env.CREATOR_PRIVATE_KEY || '';

// Initialize the Algorand client
const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_ADDRESS, '');

// Approval Program for the smart contract (this is a simplified version)
const approvalProgram = `
#pragma version 2
txn Type
int 0
==
txn Sender
addr ${CREATOR_ADDRESS}
==
&&
txn AssetReceiver
addr ${CREATOR_ADDRESS}
==
&&
txn Amount
int 1
==
&&
`;

// Clear Program - This is the clear state program (simplified)
const clearProgram = `
#pragma version 2
int 1
return
`;

async function compileSmartContract() {
  try {
    // Compile the approval and clear programs
    const approvalResult = await algodClient.compile(approvalProgram).do();
    const clearResult = await algodClient.compile(clearProgram).do();

    // Print the compiled programs
    console.log('Approval Program:', approvalResult.result);
    console.log('Clear Program:', clearResult.result);

    return {
      approvalProgram: approvalResult.result,
      clearProgram: clearResult.result
    };
  } catch (error) {
    console.error('Error compiling smart contract:', error);
    return null;
  }
}

async function createSmartContract() {
  try {
    // Compile smart contract
    const compiled = await compileSmartContract();
    if (!compiled) {
      console.error('Failed to compile smart contract');
      return;
    }

    const params = await algodClient.getTransactionParams().do();

    // Create a transaction to create the smart contract
    const txn = algosdk.makeApplicationCreateTxn(
      CREATOR_ADDRESS,
      params,
      algosdk.OnCompletion.NoOp,  // Type of transaction
      compiled.approvalProgram,
      compiled.clearProgram,
      0,  // Number of global state variables
      0,  // Number of local state variables
      [LAND_TOKEN_ID]  // Link the land token asset
    );

    // Sign the transaction with the creator's private key
    const signedTxn = txn.signTxn(Buffer.from(CREATOR_PRIVATE_KEY, 'base64'));

    // Send the transaction
    const txnId = await algodClient.sendRawTransaction(signedTxn).do();
    console.log('Transaction ID:', txnId);

    // Wait for the transaction to be confirmed
    const confirmation = await waitForConfirmation(txnId);
    if (confirmation) {
      console.log('Smart contract created successfully!');
      return confirmation;
    } else {
      console.error('Smart contract creation failed');
      return null;
    }
  } catch (error) {
    console.error('Error creating smart contract:', error);
    return null;
  }
}

// Helper function to wait for a transaction to be confirmed
async function waitForConfirmation(txnId: string, maxRetries: number = 10, delay: number = 2) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const confirmedTxn = await algodClient.pendingTransactionInformation(txnId).do();
      if (confirmedTxn['confirmed-round']) {
        return confirmedTxn;
      }
    } catch (error) {
      console.warn('Waiting for confirmation failed:', error.message);
    }

    await new Promise((resolve) => setTimeout(resolve, delay * 1000));
  }

  console.error(`Transaction ${txnId} not confirmed after ${maxRetries} retries.`);
  return null;
}

createSmartContract().catch((error) => {
  console.error('Error executing script:', error);
});
