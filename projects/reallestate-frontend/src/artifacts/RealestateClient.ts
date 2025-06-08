import algosdk, { Algodv2, Indexer, SuggestedParams } from 'algosdk';

const ALGOD_TOKEN = process.env.ALGOD_TOKEN || 'your-algod-token';
const ALGOD_ADDRESS = process.env.ALGOD_ADDRESS || 'http://localhost:4001'; 
const INDEXER_TOKEN = process.env.INDEXER_TOKEN || 'your-indexer-token';
const INDEXER_ADDRESS = process.env.INDEXER_ADDRESS || 'http://localhost:8980';

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || 'your-contract-address';
const CONTRACT_ID = parseInt(process.env.CONTRACT_ID || '1'); // Ensure this is a valid number

export class RealestateClient {
  private algodClient: Algodv2;
  private indexerClient: Indexer;

  constructor() {
    this.algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_ADDRESS, '');
    this.indexerClient = new algosdk.Indexer(INDEXER_TOKEN, INDEXER_ADDRESS, '');
  }

  public async getAccountInfo(address: string) {
    try {
      return await this.algodClient.accountInformation(address).do();
    } catch (error) {
      console.error('Error fetching account info:', error);
      throw error;
    }
  }

  public async getContractGlobalState() {
    try {
      const response = await this.indexerClient.lookupAccountCreatedApplications(CONTRACT_ADDRESS).do();
      const app = response['created-apps']?.find((app) => app.id === CONTRACT_ID);
      return app?.params['global-state'];
    } catch (error) {
      console.error('Error fetching global state:', error);
      throw error;
    }
  }

  public async callRealEstateContract(
    method: string,
    args: Uint8Array[],
    sender: string,
    senderPrivateKey: Uint8Array
  ) {
    try {
      const params: SuggestedParams = await this.algodClient.getTransactionParams().do();

      const txn = algosdk.makeApplicationNoOpTxn(sender, params, CONTRACT_ID, args, undefined, undefined, undefined, undefined, {
        note: new TextEncoder().encode(method),
      });

      const signedTxn = txn.signTxn(senderPrivateKey);

      const { txId } = await this.algodClient.sendRawTransaction(signedTxn).do();
      await this.waitForConfirmation(txId);

      return txId;
    } catch (error) {
      console.error(`Error calling contract method "${method}":`, error);
      throw error;
    }
  }

  private async waitForConfirmation(txId: string): Promise<void> {
    const status = await this.algodClient.status().do();
    let lastRound = status['last-round'];

    for (let i = 0; i < 10; i++) {
      const pendingInfo = await this.algodClient.pendingTransactionInformation(txId).do();
      if (pendingInfo['confirmed-round'] !== null && pendingInfo['confirmed-round'] > 0) {
        console.log(`Transaction confirmed in round ${pendingInfo['confirmed-round']}`);
        return;
      }
      lastRound++;
      await this.algodClient.statusAfterBlock(lastRound).do();
    }

    throw new Error('Transaction not confirmed after 10 rounds');
  }
}
