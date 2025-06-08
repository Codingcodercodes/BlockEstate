import { getAccessToken } from "./auth.js";
import { fetchUserDocuments } from "./api.js";
import { createAsset, optInAsset, transferAsset } from "./algorand.js";
import dotenv from "dotenv";
import algosdk from "algosdk";
dotenv.config();

// Load environment variables
const buyerAddr = process.env.BUYER_ADDRESS!;
const buyerKey = algosdk.mnemonicToSecretKey(process.env.BUYER_PRIVATE_KEY!).sk;
const sellerAddr = process.env.SELLER_ADDRESS!;
const sellerKey = algosdk.mnemonicToSecretKey(process.env.SELLER_PRIVATE_KEY!).sk;

// Helper function to log errors with context
const logError = (message: string, error: any) => {
  console.error(`[ERROR] ${message}`, error);
};

// Function to handle the creation, opt-in, and transfer process for each document
async function processDocument(doc: any) {
  try {
    console.log(`Processing document with hash: ${doc.hash}`);

    const assetId = await createAsset(doc.hash, buyerAddr, buyerKey);
    if (!assetId) {
      throw new Error(`Failed to create asset for document ${doc.hash}`);
    }

    await optInAsset(assetId, buyerAddr, buyerKey);

    const success = await transferAsset(assetId, sellerAddr, buyerAddr, sellerKey);
    if (success) {
      console.log(`✅ Transferred asset ${assetId} successfully`);
    } else {
      console.log(`❌ Failed to transfer asset ${assetId}`);
    }
  } catch (error) {
    logError(`Error processing document with hash ${doc.hash}`, error);
  }
}

// Main function to drive the process
async function main() {
  try {
    const token = await getAccessToken();
    if (!token) {
      console.log("Failed to get access token");
      return;
    }

    const documents = await fetchUserDocuments(token);
    if (!documents) {
      console.log("No documents found or failed to fetch documents");
      return;
    }

    // Parallelize document processing with concurrency control (e.g., limit to 5 at a time)
    const maxConcurrency = 5;
    const documentChunks = [];

    for (let i = 0; i < documents.length; i += maxConcurrency) {
      documentChunks.push(documents.slice(i, i + maxConcurrency));
    }

    for (const chunk of documentChunks) {
      await Promise.all(chunk.map(doc => processDocument(doc)));
    }

    console.log("All documents processed.");
  } catch (error) {
    logError("Error in main function", error);
  }
}

main();
