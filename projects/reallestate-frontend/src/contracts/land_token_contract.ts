import algosdk from 'algosdk';
import { getAlgodClient } from '../utils/blockchain_config';  // A helper to get the Algorand client
import { waitForConfirmation } from '../utils/transactionUtils';  // A helper to wait for transaction confirmation
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Setup Algorand client
const algodClient = getAlgodClient();

// Function to create the land token asset
export async function createLandTokenAsset(
  creatorAddress: string,
  creatorPrivateKey: string,
  assetName: string = 'Land Token',  // Default name for the asset
  unitName: string = 'LAND',         // Default unit name
  totalSupply: number = 1,           // Default total supply (1 unit)
  assetURL: string = 'https://yourlandtokenurl.com', // Default URL for asset verification
) {
  try {
    // Fetch transaction parameters
    const params = await algodClient.getTransactionParams().do();

    // Create the Asset Config Transaction for Land Token
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParams(
      creatorAddress,    // The creator's address
      undefined,         // No note
      totalSupply,       // Total supply (1 unit)
      0,                 // No decimals
      false,             // Default frozen: false
      creatorAddress,    // Address for the URL (for verification purposes)
      assetName,         // Asset name
      unitName,          // Unit name
      assetURL,          // URL for asset verification
      undefined,         // No manager address
      undefined,         // No reserve address
      undefined,         // No freeze address
      undefined,         // No clawback address
      params             // Transaction parameters
    );

    // Sign the transaction with the creator's private key
    const signedTxn = txn.signTxn(Buffer.from(creatorPrivateKey, 'base64'));

    // Send the transaction to the Algorand network
    const txnId = await algodClient.sendRawTransaction(signedTxn).do();
    console.log(`Land token creation transaction submitted. Transaction ID: ${txnId}`);

    // Wait for confirmation of the transaction
    const confirmedTxn = await waitForConfirmation(txnId);
    if (confirmedTxn) {
      console.log(`Transaction confirmed in round ${confirmedTxn['confirmed-round']}`);
      return confirmedTxn;
    } else {
      console.error(`Transaction failed: ${txnId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error during land token creation: ${error.message}`);
    return null;
  }
}
