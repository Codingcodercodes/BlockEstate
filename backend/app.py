import os
import logging
import requests
import time
from typing import Optional, Dict, Any
from algosdk import transaction
from algosdk.v2client import algod
from dotenv import load_dotenv
from requests.models import Response
load_dotenv()

logging.basicConfig(level=logging.INFO)
buyer_address = os.getenv("BUYER_ADDRESS")
buyer_private_key = os.getenv("BUYER_PRIVATE_KEY")
seller_address = os.getenv("SELLER_ADDRESS")
seller_private_key = os.getenv("SELLER_PRIVATE_KEY")
seller_private_key = os.getenv("SELLER_PRIVATE_KEY")
land_token_id = os.getenv("LAND_TOKEN_ID")
api_url = os.getenv("API_URL")
token_url = os.getenv("TOKEN_URL")
algod_token = os.getenv("ALGOD_TOKEN")
algod_address = os.getenv("ALGOD_ADDRESS")
required_vars = {
    "BUYER_ADDRESS": buyer_address,
    "BUYER_PRIVATE_KEY": buyer_private_key,
    "SELLER_ADDRESS": seller_address,
    "SELLER_PRIVATE_KEY": seller_private_key,
    "LAND_TOKEN_ID": land_token_id,
    "API_URL": api_url,
    "TOKEN_URL": token_url,
    "ALGOD_TOKEN": algod_token,
    "ALGOD_ADDRESS": algod_address,
}

missing_vars = [key for key, value in required_vars.items() if value is None]
if missing_vars:
    raise EnvironmentError(f"Missing required environment variables: {', '.join(missing_vars)}")
try:
    land_token_id = int(land_token_id)
except ValueError:
    raise ValueError(f"Invalid value for LAND_TOKEN_ID: {land_token_id}. It must be an integer.")
algod_client = algod.AlgodClient(algod_token, algod_address)
def get_access_token() -> Optional[str]:
    """Fetch access token using client credentials."""
    try:
        response: Response = requests.post(token_url, data={"grant_type": "client_credentials"})
        response.raise_for_status()
        access_token = response.json().get("access_token")
        if access_token:
            logging.info("Access token retrieved successfully.")
            return access_token
        logging.error("Access token not found in response.")
    except requests.RequestException as e:
        logging.error(f"Error retrieving access token: {e}")
    return None

def get_user_documents(access_token: str) -> Optional[list[Dict[str, Any]]]:
    """Retrieve user documents from the secured API."""
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        response: Response = requests.get(api_url, headers=headers)
        response.raise_for_status()
        documents = response.json()
        logging.info(f"Retrieved {len(documents)} documents successfully.")
        return documents
    except requests.RequestException as e:
        logging.error(f"Error retrieving user documents: {e}")
    return None

def wait_for_confirmation(txn_id: str, max_retries: int = 10, delay: int = 2) -> Optional[Dict[str, Any]]:
    """Wait for transaction to be confirmed on the network."""
    for attempt in range(max_retries):
        try:
            confirmed_txn = algod_client.pending_transaction_info(txn_id)
            if confirmed_txn.get('confirmed-round'):
                logging.info(f"Transaction {txn_id} confirmed in round {confirmed_txn['confirmed-round']}")
                return confirmed_txn
        except Exception as e:
            logging.warning(f"Waiting for confirmation failed: {e}")
        time.sleep(delay)
    logging.error(f"Transaction {txn_id} not confirmed after {max_retries} retries.")
    return None

def transfer_ownership(seller_key: str, sender: str, receiver: str, asset_id: int) -> Optional[Dict[str, Any]]:
    """Transfer ownership of a land token asset."""
    params = algod_client.suggested_params()
    try:
        txn = transaction.AssetTransferTxn(
            sender=sender,
            receiver=receiver,
            amt=1,
            index=asset_id,
            sp=params
        )
        signed_txn = txn.sign(seller_key)
        txn_id = algod_client.send_transaction(signed_txn)
        logging.info(f"Ownership transfer transaction submitted: {txn_id}")
        return wait_for_confirmation(txn_id)
    except Exception as e:
        logging.error(f"Error during ownership transfer: {e}")
    return None

def create_land_verification_asset(document_hash: str, creator_address: str, creator_key: str) -> Optional[Dict[str, Any]]:
    """Create a single-unit land verification asset on the Algorand blockchain."""
    asset_url = f"https://your.document.storage/{document_hash}"
    params = algod_client.suggested_params()
    try:
        txn = transaction.AssetConfigTxn(
            sender=creator_address,
            total=1,
            decimals=0,
            asset_name="Land Verification",
            unit_name="LAND",
            asset_url=asset_url,
            default_frozen=False,
            sp=params
        )
        signed_txn = txn.sign(creator_key)
        txn_id = algod_client.send_transaction(signed_txn)
        logging.info(f"Asset creation transaction submitted: {txn_id}")
        return wait_for_confirmation(txn_id)
    except Exception as e:
        logging.error(f"Error during asset creation: {e}")
    return None

def main():
    """Main workflow: Authenticate, verify documents, create asset, and transfer ownership."""
    access_token = get_access_token()
    if not access_token:
        logging.error("Access token retrieval failed.")
        return

    documents = get_user_documents(access_token)
    if not documents:
        logging.error("No documents retrieved or available.")
        return

    for doc in documents:
        document_hash = doc.get("hash")
        if not document_hash:
            logging.warning("Document hash missing, skipping.")
            continue

        logging.info(f"Creating asset for document: {document_hash}")
        asset_txn = create_land_verification_asset(document_hash, buyer_address, buyer_private_key)

        if not asset_txn:
            logging.error(f"Failed to create asset for document {document_hash}")
            continue

        logging.info("Asset created. Initiating ownership transfer...")
        transfer_txn = transfer_ownership(seller_private_key, seller_address, buyer_address, land_token_id)

        if transfer_txn:
            logging.info(f"Ownership transfer successful. Round: {transfer_txn.get('confirmed-round')}")
        else:
            logging.error("Ownership transfer failed.")

if __name__ == "__main__":
    main()
