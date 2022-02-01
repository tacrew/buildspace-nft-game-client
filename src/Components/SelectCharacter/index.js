import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import "./SelectCharacter.css";

import { CONTRACT_ADDRESS, transformCharacterData } from "../../constants";
import myEpicGame from "../../utils/MyEpicGame.json";

import LoadingIndicator from "../LoadingIndicator";

export const SelectCharacter = ({ setCharacterNFT }) => {
  const [characters, setCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);
  const [mintingCharacter, setMintingCharacter] = useState(false);

  useEffect(() => {
    const { ethereum } = window;

    if (ethers) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      setGameContract(gameContract);
    }
  }, []);

  useEffect(() => {
    const getCharacters = async () => {
      try {
        const charactersTxn = await gameContract.getAllDefaultCharacters();
        const characters = charactersTxn.map((characterData) =>
          transformCharacterData(characterData)
        );
        console.log(characters);
        setCharacters(characters);
      } catch (error) {
        console.error(`Something went wrong fetching characters: ${error}`);
      }
    };

    const onCharacterMint = async (sender, tokenId, characterIndex) => {
      if (!gameContract) return;
      const characterNFT = await gameContract.checkIfUserHasNFT();
      setCharacterNFT(transformCharacterData(characterNFT));
    };

    if (gameContract) {
      getCharacters();
      gameContract.on("CharacterNFTMinted", onCharacterMint);
    }

    return () => {
      if (gameContract) {
        gameContract.off("CharacterNFTMinted", onCharacterMint);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameContract]);

  const mintCharacterNFTAction = async (characterId) => {
    try {
      if (!gameContract) return;
      setMintingCharacter(true);
      const mintTxn = await gameContract.mintCharacterNFT(characterId);
      await mintTxn.wait();
    } catch (error) {
      console.warn(`MintCharacterAction Error:`, error);
    }
    setMintingCharacter(false);
  };

  return (
    <div className="select-character-container">
      <h2>Mint Your Hero. Choose wisely.</h2>
      {characters.length > 0 && (
        <div className="character-grid">
          {characters.map((character, index) => (
            <div className="character-item" key={character.name}>
              <div className="name-container">
                <p>{character.name}</p>
              </div>
              <img src={character.imageURI} alt={character.name} />
              <button
                type="button"
                className="character-mint-button"
                onClick={() => mintCharacterNFTAction(index)}
              >{`Mint ${character.name}`}</button>
            </div>
          ))}
        </div>
      )}
      {mintingCharacter && (
        <div className="loading">
          <div className="indicator">
            <LoadingIndicator />
            <p>Minting In Progress...</p>
          </div>
          <img
            src="https://media2.giphy.com/media/61tYloUgq1eOk/giphy.gif?cid=ecf05e47dg95zbpabxhmhaksvoy8h526f96k4em0ndvx078s&rid=giphy.gif&ct=g"
            alt="Minting loading indicator"
          />
        </div>
      )}
    </div>
  );
};
