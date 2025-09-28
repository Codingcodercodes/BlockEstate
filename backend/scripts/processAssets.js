
import { getAccessToken } from "../services/auth.js";
import { fetchUserDocuments } from "../services/api.js";
import { createAsset, optInAsset, transferAsset } from "../algorand/assetUtils.js";
import dotenv from "dotenv";
import algosdk from "algosdk";
dotenv.config();

// Load environment variables
const buyerAddr = process.env.BUYER_ADDRESS;
const buyerKey = algosdk.mnemonicToSecretKey(process.env.BUYER_PRIVATE_KEY).sk;

const sellerAddr = process.env.SELLER_ADDRESS;
const sellerKey = algosdk.mnemonicToSecretKey(process.env.SELLER_PRIVATE_KEY).sk;

// Exportable function for use in scripts or routes
export async function processAssets() {
  try {
    const token = await getAccessToken();
    if (!token) { 
      console.error("❌ Failed to get access token.");
      return;
    }

    const documents = await fetchUserDocuments(token);
    if (!documents || documents.length === 0) {
      console.warn("⚠️ No documents found to process.");
      return;
    }

    for (const doc of documents) {
      console.log(`📄 Processing document: ${doc.name || doc.id || doc.hash}`);
      const assetId = await createAsset(doc.hash, buyerAddr, buyerKey);
      if (!assetId) {
        console.warn("❌ Asset creation failed, skipping document.");
        continue;
      }

      await optInAsset(assetId, buyerAddr, buyerKey);

      const success = await transferAsset(assetId, sellerAddr, buyerAddr, sellerKey);
      console.log(success ? `✅ Transferred asset ${assetId}` : `❌ Failed to transfer asset`);
    }
  } catch (err) {
    console.error("🔥 Error during asset processing:", err);
    throw err;
  }
}

// If run directly via `node processAssets.js`
if (process.argv[1] === new URL(import.meta.url).pathname) {
  processAssets();
}
