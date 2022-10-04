import React from 'react'
import { useState, useEffect } from 'react'
import { ethers, providers, utils } from 'ethers'
// import contract ABI


import contractABI from './../utils/DynamicPriceToken.json'


const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");

  const [maxSupply, setMaxSupply] = useState("");
  const [offeringPrice, setOfferingPrice] = useState("");
  const [durationTime, setDurationTime] = useState(""); 

  const nftContractAddress = "0x3058BF5DA554F7DCE3A96fFaaFbDD52DE4334b12" // Insert Contract Address
  //const contractABI = "./utils/DynamicPriceToken.abi"; // add contract ABI

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


  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(nftContractAddress, contractABI.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`NewNFTMinted`)
        });

        connectedContract.on("InitOffering", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`InitOffering`)
        });

        connectedContract.on("PriceClaimed", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`PriceClaimed`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(nftContractAddress, contractABI.abi, signer);

        console.log("Going to pop wallet now to pay gas...")

        let nftTxn = await connectedContract.safeMint();

        console.log("Mining...please wait.")
        await nftTxn.wait();
        console.log(nftTxn);
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const InitOffering = async () => {


    console.log(maxSupply, offeringPrice, durationTime);

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(nftContractAddress, contractABI.abi, signer);

        console.log("Going init offering...")

        let ioffTxn = await connectedContract.initOffering(maxSupply, offeringPrice, durationTime);

        console.log("Offering..please wait.")
        await ioffTxn.wait();
        console.log(ioffTxn);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }


  const connectWallet = async () => {

    // async function connectWallet() { 

    try {
      const { ethereum } = window

      if (!ethereum) {
        console.log('Metamask not detected')
        return
      }
      let chainId = await ethereum.request({ method: 'eth_chainId' })
      console.log('Connected to chain:' + chainId)

      const mumbaiChainId = '0x13881'
      // const mumbaiChainId = '0x80001'

      if (chainId !== mumbaiChainId) {
        alert('You are not connected to the Mumbai Testnet!')
        return
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

      console.log('Found account', accounts[0])
      setCurrentAccount(accounts[0])

      setupEventListener();


    } catch (error) {
      console.log('Error connecting to metamask', error)
    }
  }

  const handleInput = () => {
    console.log(maxSupply, offeringPrice, durationTime);

  };

  return (
    <div>

      <div className="max-w-sm rounded overflow-hidden shadow-lg">
        <img className="w-full" src="https://static01.nyt.com/images/2018/10/03/arts/03wineauctions-inyt1/03wineauctions-inyt1-jumbo.jpg" alt="wine"></img>
        <div className="px-6 py-4">
          <div className="font-bold text-xl mb-2">Blockchain-based Dynamic Pricing</div>
                 

          <ul className="space-y-4">
            <li className="flex items-center">
              <svg className="h-6 w-6 flex-none fill-sky-100 stroke-sky-500 stroke-2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="11" />
                <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
              </svg>
              <p className="ml-4">
              Connect:
                <code className="text-sm font-bold text-gray-900">   Connect your wallet</code>
              </p>
            </li>
            <li className="flex items-center">
              <svg className="h-6 w-6 flex-none fill-sky-100 stroke-sky-500 stroke-2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="11" />
                <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
              </svg>
              <p className="ml-4">
              Mint/Buy:
                <code className="text-sm font-bold text-gray-900">    Buy an NFT for the Price Offered</code>
              </p>
            </li>
            <li className="flex items-center">
              <svg className="h-6 w-6 flex-none fill-sky-100 stroke-sky-500 stroke-2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="11" />
                <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
              </svg>
              <p className="ml-4">
              InitOffering:
                <code className="text-sm font-bold text-gray-900">    Start an auction as a Seller</code>
              </p>
            </li>
            <li className="flex items-center">
              <svg className="h-6 w-6 flex-none fill-sky-100 stroke-sky-500 stroke-2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="11" />
                <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
              </svg>
              <p className="ml-4">
              GET PRICE:
                <code className="text-sm font-bold text-gray-900">    Get the current Price Level</code>
              </p>
            </li>

          </ul>                                          

          

          <div>
            <p>
            <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" onClick={connectWallet}>Connect</button>
            <button className="bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded" onClick={askContractToMintNft}>Mint/Buy</button>
            
            <input className="placeholder:text-blue-300 placeholder:italic placeholder:uppercase w-96 px-5 py-2 rounded-full outline-none" placeholder='maxSupply' onChange={e => setMaxSupply(e.target.value)} />
            <input className="placeholder:text-blue-300 placeholder:italic placeholder:uppercase w-96 px-5 py-2 rounded-full outline-none" placeholder='offeringPrice' onChange={e => setOfferingPrice(e.target.value)} />
            <input className="placeholder:text-blue-300 placeholder:italic placeholder:uppercase w-96 px-5 py-2 rounded-full outline-none" placeholder='durationTime' onChange={e => setDurationTime(e.target.value)} />

            <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" onClick={() => InitOffering()} > InitOffering</button>

            <button className="bg-transparent hover:bg-grey-500 text-grey-700 font-semibold hover:text-white py-2 px-4 border border-grey-500 hover:border-transparent rounded" onClick={askContractToMintNft}>GET PRICE</button>
            </p>
            
            {/* <GetBlockNumber /> */}
          </div>
        </div>
        <div className="px-6 pt-4 pb-2">
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#blessed</span>
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#smart</span>
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#dodge</span>

          
        </div>

        <div className="font-bold text-xl mb-2">CHECK CONTRACT: 0x3058BF5DA554F7DCE3A96f
        FaaFbDD52DE4334b12 </div>

        <img className="w-full" src="https://blog.griddynamics.com/content/images/2019/03/r3-dynamic-pricing-reinforcement-learning-discrete-price.png" alt="wine"></img>
      </div>
    </div>


  )


}

export default App;