import React, { createContext, useEffect, useState } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

import { Web3Storage } from "web3.storage";
import axios from "axios";
import { MarketAddress, MarketAddressABI } from "./constants";
import images from "../assets";

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEYxNDNiNzUzRDZBRDM1QjkxZWJENTg1NDdEOTYyZTQxNzA5NUM5MTYiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NzAyODYyODY1MDYsIm5hbWUiOiIzRCJ9.yK9244pL_HgE13c3eIfLxOEXuHOi0aqqTot6vl8R5eI";

const client = new Web3Storage({ token });

const fetchContract = (signerOrProvider) =>
  new ethers.Contract(MarketAddress, MarketAddressABI, signerOrProvider);

export const NFTContext = createContext();

export const NFTProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [anotherAccount, setAnotherAccount] = useState("");
  const [isLoadingNFT, setIsLoadingNFT] = useState(false);
  const nftCurrency = "ETH";

  const createUser = async (name, image, router) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    try {
      await contract.createUser(
        name.length !== 0 ? name : "No Name",
        image || images.creator1
      );

      router.reload(window.location.pathname);
    } catch (error) {
      console.log(error);
    }
  };

  const createSale = async (url, formInputPrice, isReselling, id) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const price = ethers.utils.parseUnits(formInputPrice, "ether");
    const contract = fetchContract(signer);
    const listingPrice = await contract.getListingPrice();

    const { name } = await contract.getName(currentAccount);

    const transaction = !isReselling
      ? await contract.createToken(url, price, name || "No Name", {
          value: listingPrice.toString(),
        })
      : await contract.resellToken(id, price, name || "No Name", {
          value: listingPrice.toString(),
        });

    setIsLoadingNFT(true);
    await transaction.wait();
  };

  const createNFT = async (formInput, imageUrl, fileUrl, router, fileID) => {
    const { title, description, price } = formInput;

    if (!title || !description || !price || !imageUrl || !fileUrl) return;

    const data = JSON.stringify({
      title,
      description,
      image: imageUrl,
      glb: fileUrl,
    });

    const files = [new File([data], fileID)];

    try {
      const cid = await client.put(files);
      const url = `https://${cid}.ipfs.w3s.link/${fileID}`;

      await createSale(url, price);

      router.push("/");
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  const fetchNFTs = async () => {
    setIsLoadingNFT(false);

    const provider = new ethers.providers.JsonRpcProvider();
    const contract = fetchContract(provider);

    const data = await contract.fetchMarketItems();

    const items = await Promise.all(
      data.map(
        async ({ tokenId, name, seller, owner, price: unformattedPrice }) => {
          const tokenURI = await contract.tokenURI(tokenId);
          const {
            data: { image, glb, title, description },
          } = await axios.get(tokenURI);
          const price = ethers.utils.formatUnits(
            unformattedPrice.toString(),
            "ether"
          );

          return {
            price,
            tokenId: tokenId.toNumber(),
            seller,
            owner,
            image,
            glb,
            name,
            title,
            description,
            tokenURI,
          };
        }
      )
    );

    return items;
  };

  const fetchUsername = async (setAccount) => {
    const provider = new ethers.providers.JsonRpcProvider();
    const contract = fetchContract(provider);

    const data = await contract.getName(setAccount);

    return data;
  };

  const changeUsername = async (userId, name, router) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    try {
      await contract.changeName(userId, name);

      router.reload(window.location.pathname);
    } catch (error) {
      console.log("Error changing username: ", error);
    }
  };

  const changeProfilePicture = async (userId, image, router) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    try {
      await contract.changeProfileImage(userId, image);

      router.reload(window.location.pathname);
    } catch (error) {
      console.log("Error changing Profile Picture: ", error);
    }
  };

  const getCurrentTransaction = async (tokenId) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    const data = await contract.getTransaction(tokenId);

    const items = await Promise.all(
      data.map(
        async ({ owner, seller, cost: unformattedPrice, name, timestamp }) => {
          const price = ethers.utils.formatUnits(
            unformattedPrice.toString(),
            "ether"
          );

          return {
            owner,
            seller,
            price,
            name,
            timestamp,
          };
        }
      )
    );

    return items;
  };

  const fetchMyNFTsOrListedNFTs = async (type) => {
    setIsLoadingNFT(false);

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);

    const data =
      type === "fetchItemsListed"
        ? await contract.fetchItemsListed()
        : await contract.fetchMyNFTS(localStorage.getItem("anotherAccount"));

    const items = await Promise.all(
      data.map(
        async ({
          tokenId,
          name,
          seller,
          owner,
          price: unformattedPrice,
          timestamp,
          sold,
          oldSeller,
        }) => {
          const tokenURI = await contract.tokenURI(tokenId);
          const {
            data: { image, glb, title, description },
          } = await axios.get(tokenURI);
          const price = ethers.utils.formatUnits(
            unformattedPrice.toString(),
            "ether"
          );

          return {
            price,
            tokenId: tokenId.toNumber(),
            seller,
            owner,
            image,
            glb,
            name,
            title,
            description,
            tokenURI,
            timestamp,
            sold,
            oldSeller,
          };
        }
      )
    );

    return items;
  };

  const buyNFT = async (nft) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);

    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price,
    });

    setIsLoadingNFT(true);
    await transaction.wait();
    setIsLoadingNFT(false);
  };

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask.");

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setCurrentAccount(accounts[0]);
    localStorage.setItem("currentAccount", accounts[0]);
    window.location.reload();
  };

  const checkIfWalletIsConnect = async () => {
    if (!window.ethereum) return alert("Please install MetaMask.");

    const accounts = await window.ethereum.request({ method: "eth_accounts" });

    if (accounts.length) {
      setCurrentAccount(accounts[0]);
      localStorage.setItem("currentAccount", accounts[0]);
    } else {
      console.log("No accounts found");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnect();
    setCurrentAccount(localStorage.getItem("currentAccount"));
    setAnotherAccount(localStorage.getItem("anotherAccount"));
  }, [currentAccount, anotherAccount]);

  return (
    <NFTContext.Provider
      value={{
        nftCurrency,
        connectWallet,
        currentAccount,
        createNFT,
        fetchNFTs,
        fetchMyNFTsOrListedNFTs,
        buyNFT,
        createSale,
        createUser,
        fetchUsername,
        setAnotherAccount,
        anotherAccount,
        changeUsername,
        getCurrentTransaction,
        isLoadingNFT,
        changeProfilePicture,
      }}
    >
      {children}
    </NFTContext.Provider>
  );
};
