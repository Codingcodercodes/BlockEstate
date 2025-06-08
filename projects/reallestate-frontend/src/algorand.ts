import algosdk from "algosdk";
import { waitForConfirmation } from "./utils.js";
import dotenv from "dotenv";
dotenv.config();

const algodClient = new algosdk.Algodv2(process.env.ALGOD_TOKEN!, process.env.ALGOD_ADDRESS!, "");

export async function createAsset(documentHash: string, creator: string, privateKey: Uint8Array): Promise<number | null> {
  try {
    const params = await algodClient.getTransactionParams().do();
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from: creator,
      assetName: "Land Verification",
      unitName: "LAND",
      total: 1,
      decimals: 0,
      assetURL: `https://your.document.storage/${documentHash}`,
      defaultFrozen: false,
      suggestedParams: params
    });

    const signed = txn.signTxn(privateKey);
    const txId = await algodClient.sendRawTransaction(signed).do();
    const confirmed = await waitForConfirmation(algodClient, txId.txId);
    return confirmed["asset-index"];
  } catch (error) {
    console.error("Error creating asset:", error);
    return null;
  }
}

export async function optInAsset(assetId: number, address: string, privateKey: Uint8Array): Promise<boolean> {
  try {
    const account = await algodClient.accountInformation(address).do();
    const optedIn = account.assets.some((a: any) => a["asset-id"] === assetId);
    if (optedIn) return true;

    const params = await algodClient.getTransactionParams().do();
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: address,
      to: address,
      amount: 0,
      assetIndex: assetId,
      suggestedParams: params,
    });

    const signed = txn.signTxn(privateKey);
    const txId = await algodClient.sendRawTransaction(signed).do();
    await waitForConfirmation(algodClient, txId.txId);
    return true;
  } catch (error) {
    console.error("Opt-in failed:", error);
    return false;
  }
}

export async function transferAsset(assetId: number, from: string, to: string, privateKey: Uint8Array): Promise<boolean> {
  try {
    const params = await algodClient.getTransactionParams().do();
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from,
      to,
      amount: 1,
      assetIndex: assetId,
      suggestedParams: params,
    });

    const signed = txn.signTxn(privateKey);
    const txId = await algodClient.sendRawTransaction(signed).do();
    await waitForConfirmation(algodClient, txId.txId);
    return true;
  } catch (error) {
    console.error("Transfer failed:", error);
    return false;
  }
}
