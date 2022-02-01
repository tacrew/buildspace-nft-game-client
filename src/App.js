import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";

import { SelectCharacter } from "./Components/SelectCharacter";
import { Arena } from "./Components/Arena";
import LoadingIndicator from "./Components/LoadingIndicator";

import { CONTRACT_ADDRESS, transformCharacterData } from "./constants";
import myEpicGame from "./utils/MyEpicGame.json";

// Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        setIsLoading(false);
        return;
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (!accounts.length) {
        setIsLoading(false);
        return;
      }

      const account = accounts[0];
      setCurrentAccount(account);

      if (ethereum.networkVersion !== "4") {
        alert("Please connect to Rinkeby");
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) return;
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log("Checking for Character NFT on address:", currentAccount);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log("User has character NFT");
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log("No character NFT found");
      }

      setIsLoading(false);
    };

    if (currentAccount) {
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Metaverse Slayer ⚔️</p>
          <p className="sub-text">Team up to protect the Metaverse!</p>
          {isLoading && <LoadingIndicator />}
          {!isLoading && !currentAccount && (
            <div className="connect-wallet-container">
              <video
                src="https://i.imgur.com/NUyttbn.mp4"
                alt="Monty Python Gif"
                type="video/mp4"
              />
              <button
                className="cta-button connect-wallet-button"
                onClick={connectWalletAction}
              >
                Connect Wallet To Get Started
              </button>
            </div>
          )}
          {!isLoading && currentAccount && !characterNFT && (
            <SelectCharacter setCharacterNFT={setCharacterNFT} />
          )}
          {!isLoading && currentAccount && characterNFT && (
            <Arena
              characterNFT={characterNFT}
              setCharacterNFT={setCharacterNFT}
            />
          )}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
