const algosdk = require('algosdk');

let algodClient;

function initAlgodClient() {
  const token = process.env.ALGOD_TOKEN?.trim();
  const server = process.env.ALGOD_SERVER?.trim();
  const port = parseInt(process.env.ALGOD_PORT, 10);

  if (!token || !server || isNaN(port)) {
    console.warn('⚠️ Algorand config missing');
    return;
  }

  try {
    algodClient = new algosdk.Algodv2(token, server, port);
    console.log('✅ Algorand client initialized');
  } catch (err) {
    console.error('❌ Algorand client error:', err.message);
  }
}

function getAlgodClient() {
  return algodClient;
}

module.exports = { initAlgodClient, getAlgodClient };
