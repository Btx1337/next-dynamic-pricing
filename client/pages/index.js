import React from 'react'
import { useState, useEffect } from 'react'
import {ethers, providers} from 'ethers'
// import contract ABI

const nftContractAddress = "" // Insert Contract Address
const contractABI = abi.abi; // add contract ABI


const checkIfWalletIsConnected = async () => {
  try {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    /*
    * Check if we're authorized to access the user's wallet
    */
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      getAllWaves(); // replace
      setupEventListener()  // Setup eventListener for users that already have come to the page and connected their wallets
    } else {
      console.log("No authorized account found")
    }
  } catch (error) {
    console.log(error);
  }


}


const setupEventListener = async () => {
  try {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const dynamicPricingContract = new ethers.Contract(nftContractAddress, contractABI, signer);
      dynamicPricingContract.on("NewNFTMinted", (from, tokenId) => {
        console.log(from, tokenId.toNumber())
        alert(`NFT minted and sent to your wallet! It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${nftContractAddress}/${tokenId.toNumber()}`)
      });
      console.log("Setup event listener")
    } else {
      console.log("Ethereum object doesn't exist");
    }
  } catch (error) {
    console.log(error)
  }


  async function connectWallet() {
    try {
      const { ethereum } = window

      if (!ethereum) {
        console.log('Metamask not detected')
        return
      }
      let chainId = await ethereum.request({ method: 'eth_chainId' })
      console.log('Connected to chain:' + chainId)

      const mumbaiChainId = '0x80001'

      if (chainId !== mumbaiChainId) {
        alert('You are not connected to the Mumbai Testnet!')
        return
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

      console.log('Found account', accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log('Error connecting to metamask', error)
    }
  }




const HomePage = () => {
 


  return (
    
    <div>
    <div className='text-3xl text-green-600 p-2'>
      Hello Geeks!
    </div>
    <div>
    <button onClick={connectWallet}>Connect</button>
   <GetBlockNumber />
    </div>
    </div>
  )
}
  
export default HomePage