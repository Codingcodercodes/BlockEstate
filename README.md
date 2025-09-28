BlockEstate

A Decentralized Real Estate Registry System powered by Algorand

BlockEstate is a blockchain-based solution designed to bring transparency, trust, and tamper-proof verification to the real estate ecosystem in India. Built on the Algorand blockchain using AlgoKit, this platform enables government officials and landowners to register, verify, and transfer property ownership seamlessly and securely.

It is a decentralized property marketplace that enables secure house buying and selling using the Algorand blockchain. It leverages AlgoKit and PyTeal for smart contracts, ensuring transparent ownership transfer and tamper-proof transactions. The platform uses Node.js and TypeScript for a real-time web interface, with AlgoPy handling backend logic for a seamless user experience.

🔧 Features

Government-approved property registration workflow

Land ownership verification using on-chain smart contracts

Role-based access: Government officials & landowners

Tamper-proof, immutable registry system

Secure house buying and selling marketplace

Built on Algorand using AlgoKit

Tech Stack

Algorand Blockchain

PyTEAL Smart Contracts

AlgoKit

React.js (Frontend)

Python (Backend)

Node.js (Express backend API)

IPFS (optional for storing property documents)

Tailwind CSS + DaisyUI

AlgoPy for backend Algorand interactions

🧰 Prerequisites & Initial Setup

Before you begin working with BlockEstate, please ensure the following tools are installed on your machine. These are required to build, run, and interact with the decentralized property marketplace locally.

Tool	Version	Purpose
Python	3.12.x (exactly)	Backend logic & smart contract tooling
Docker	Latest stable	Local blockchain environment (optional)
Git	Latest stable	Clone the repository
Node.js	18.x or newer	Frontend build tools & CLI scripts
AlgoKit	Latest stable (algokit)	Algorand development CLI

⚠️ Python 3.13 or higher is not supported at this time. Please ensure you're using Python 3.12.

Getting Started
Clone the Repository
git clone https://github.com/Codingcodercodes/BlockEstate.git
cd BlockEstate

Install Dependencies & Setup
Install Required Tools

Python 3.12
Download Python 3.12

(Make sure to add Python to your system PATH)

Docker Desktop (optional for localnet sandbox)
Install Docker

Git
Install Git

Node.js
Download Node.js
 (LTS version recommended)

AlgoKit CLI
Follow official guide:
AlgoKit Installation

Bootstrap & Build Project
# Bootstrap the project environment
algokit project bootstrap all

# Generate local environment file for smart contracts
cd reallestate-contracts
algokit generate env-file -a target_network localnet

# Build the entire project (contracts + frontend clients)
cd ..
algokit project run build

Running Locally
Frontend
cd projects/reallestate-frontend

# Create local .env file from template
cp .env.template .env

# Install dependencies
npm install

# Start the development server
npm run dev


Open the provided localhost URL (e.g., http://localhost:5173
) in your browser.

Backend
cd ../../backend

# Install required Node.js modules
npm install express dotenv multer jsonwebtoken body-parser mongodb algosdk axios express-session cors

# Start the backend server
node server.js

🔗 Smart Contract Integration

Smart contracts reside in the reallestate-contracts directory.

Frontend smart contract clients are generated automatically into projects/reallestate-frontend/src/contracts.

After compiling contracts, run:

npm run generate:app-clients


Use the generated clients in your React components for interacting with the blockchain.

🛠️ Tools & Technologies Used

Algorand blockchain with AlgoKit, PyTeal, and AlgoPy

Python with Poetry, pytest, pip-audit

React + TypeScript frontend with Tailwind CSS, daisyUI, use-wallet

Node.js backend API with Express and middleware

VS Code configured for productivity (.vscode included)
