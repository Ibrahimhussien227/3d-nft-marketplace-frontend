import { useCallback, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { Web3Storage } from "web3.storage/dist/bundle.esm.min.js";

import { NFTContext } from "../context/NFTContext";
import {
  Banner,
  Button,
  Input,
  Loader,
  NFTCard,
  SearchBar,
} from "../components";
import images from "../assets";
import { shortenAddress } from "../utils/shortenAddress";
// import { getUserProfile } from "../utils/getUserProfile";

const MyNFTS = () => {
  const {
    fetchMyNFTsOrListedNFTs,
    fetchUsername,
    anotherAccount,
    currentAccount,
    createUser,
    changeUsername,
    isLoadingNFT,
    changeProfilePicture,
  } = useContext(NFTContext);
  const [nfts, setNfts] = useState([]);
  const [nftsCopy, setNftsCopy] = useState([]);
  const [names, setNames] = useState({
    id: "",
    name: "",
    image: "",
  });
  const [edit, setEdit] = useState(false);
  const { theme } = useTheme();
  // const [isLoading, setIsLoading] = useState(true);
  const [activeSelect, setActiveSelect] = useState("Recently Added");
  const [userName, setUserName] = useState("");
  const [check, setCheck] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchMyNFTsOrListedNFTs("fetchMyNFTs")
      .then((items) => {
        setNfts(items);
        setNftsCopy(items);
        // setIsLoading(false);
      })
      .catch((error) => console.log(error));

    fetchUsername(localStorage.getItem("anotherAccount"))
      .then((items) => {
        setNames({ name: items.name, id: items.userId, image: items.image });

        if (items.name) {
          setCheck(true);
        }
      })
      .catch((error) => {
        setNames("No Name");
        console.log(error);
      });
  }, [anotherAccount]);

  useEffect(() => {
    const sortNfts = [...nfts];

    switch (activeSelect) {
      case "Price (low to high)":
        setNfts(sortNfts.sort((a, b) => a.price - b.price));
        break;

      case "Price (high to low)":
        setNfts(sortNfts.sort((a, b) => b.price - a.price));
        break;

      case "Recently added":
        setNfts(sortNfts.sort((a, b) => b.tokenId - a.tokenId));
        break;

      default:
        setNfts(nftsCopy);
        break;
    }
  }, [activeSelect]);

  const handleEdit = () => {
    setEdit((prevEdit) => !prevEdit);
  };

  const onHandleSearch = (value) => {
    const filteredNfts = nfts.filter(({ title }) =>
      title.toLowerCase().includes(value.toLowerCase())
    );

    if (filteredNfts.length) {
      setNfts(filteredNfts);
    } else {
      setNfts(nftsCopy);
    }
  };

  const onClearSearch = () => {
    if (nfts.length && nftsCopy.length) {
      setNfts(nftsCopy);
    }
  };

  const [imageUrl, setImageUrl] = useState(null);

  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEYxNDNiNzUzRDZBRDM1QjkxZWJENTg1NDdEOTYyZTQxNzA5NUM5MTYiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NzAyODYyODY1MDYsIm5hbWUiOiIzRCJ9.yK9244pL_HgE13c3eIfLxOEXuHOi0aqqTot6vl8R5eI";

  const client = new Web3Storage({ token });

  const uploadImageToInfura = async (file) => {
    try {
      const cid = await client.put([file]);

      const url = `https://${cid}.ipfs.w3s.link/${file.name}`;

      setImageUrl(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  const onDrop = useCallback(async (acceptedFile) => {
    await uploadImageToInfura(acceptedFile);
  }, []);

  // const { names, check } = getUserProfile();

  if (isLoadingNFT)
    return (
      <div className="flexStart min-h-screen">
        <Loader />
      </div>
    );

  return (
    <div className="w-full flex justify-start items-center flex-col min-h-screen">
      <div className="w-full flexCenter flex-col">
        <Banner
          name="Your Nifty NFTs"
          childStyles="text-center mb-4"
          parentStyles="h-80 justify-center"
        />

        <div className="flexCenter  flex-col -mt-20 z-0">
          <div className="flexCenter relative w-40 h-40 sm:w-36 sm:h-36 p-1 bg-nft-black-2 rounded-full">
            {imageUrl ? (
              <aside>
                <div>
                  {/* <img src={imageUrl} alt="asset_file" /> */}
                  <Image
                    alt="creator"
                    src={
                      `/api/imageProxy?imageUrl=${imageUrl}` || images.creator1
                    }
                    fill
                    sizes="true"
                    style={{ objectFit: "cover" }}
                    priority
                    className="rounded-full"
                  />
                </div>
              </aside>
            ) : (
              <Image
                alt="creator"
                src={
                  names.image.length === 0
                    ? images.creator1
                    : `/api/imageProxy?imageUrl=${names.image}`
                }
                style={{ objectFit: "cover" }}
                priority
                sizes="true"
                fill
                className="rounded-full"
              />
            )}
          </div>

          {edit ? (
            <>
              <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-2xl mr-2 mt-6">
                {shortenAddress(anotherAccount)}
              </p>
              <div className="flex justify-center sm:px-4">
                <div className="flex flex-col justify-center items-center ml-56 w-full">
                  <div className="flex w-full flex-col justify-center gap-5">
                    <Input
                      inputType="image"
                      title="Choose your profile picture"
                      handleClick={(e) => onDrop(e.target.files[0])}
                    />
                    {check ? (
                      <Button
                        btnName="Change picture"
                        classStyles="rounded-xl"
                        handleClick={() => {
                          if (imageUrl) {
                            changeProfilePicture(names.id, imageUrl, router);
                          }
                        }}
                      />
                    ) : (
                      ""
                    )}
                  </div>
                  <div className="flex flex-col w-full justify-center gap-5">
                    <Input
                      inputType="input"
                      title={check ? "Change Username" : "Create Username"}
                      placeholder="Username"
                      handleClick={(e) => setUserName(e.target.value)}
                    />
                    {check ? (
                      <Button
                        btnName="Change Username"
                        classStyles="rounded-xl"
                        handleClick={() => {
                          if (userName) {
                            changeUsername(names.id, userName, router);
                          }
                        }}
                      />
                    ) : (
                      <Button
                        btnName="Create User"
                        classStyles="rounded-xl"
                        handleClick={() => {
                          console.log(imageUrl, userName);
                          if (userName || imageUrl) {
                            createUser(userName, imageUrl, router);
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
                <div className="w-full flex justify-end mt-20 gap-10">
                  {/* {check ? (
                    <Button
                      btnName="Change Username"
                      classStyles="rounded-xl"
                      handleClick={() => {
                        if (userName) {
                          changeUsername(names.id, userName, router);
                        }
                      }}
                    />
                  ) : (
                    <Button
                      btnName="Create User"
                      classStyles="rounded-xl"
                      handleClick={() => {
                        if (userName) {
                          createUser(userName, router);
                        }
                      }}
                    />
                  )} */}
                  <div className="flex justify-start">
                    <div
                      className="relative w-3 h-3 cursor-pointer"
                      onClick={handleEdit}
                    >
                      <Image
                        alt="cross"
                        src={images.cross}
                        fill
                        sizes="true"
                        className={
                          theme === "light" ? "filter invert" : undefined
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-row justify-center items-center">
              <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-2xl mt-6">
                {names.name || "No Name"}
              </p>
              {currentAccount === anotherAccount.toLowerCase() && (
                <div className="flex justify-end mt-6">
                  <div
                    className="relative w-5 h-5 minlg:w-6 minlg:h-6 cursor-pointer left-10"
                    onClick={handleEdit}
                  >
                    <Image
                      alt="edit"
                      src={images.edit}
                      fill
                      sizes="true"
                      className={
                        theme === "light" ? undefined : "filter invert"
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {!edit && (
            <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-2xl mr-2 mt-6">
              {shortenAddress(anotherAccount)}
            </p>
          )}
        </div>
      </div>

      {!isLoadingNFT && !nfts.length && !nftsCopy.length ? (
        <div className="flexCenter sm:p-4 p-16">
          <h1 className="font-poppins dark:text-white text-nft-black-1 font-extrabold text-3xl">
            No NFTs Owned
          </h1>
        </div>
      ) : (
        <div className="p-12 sm:px-4 w-full minmd:w-4/5 flexCenter flex-col">
          <div className="flex-1 w-full flex flex-row sm:flex-col px-4 xs:px-0 minlg:px-8">
            <SearchBar
              activeSelect={activeSelect}
              setActiveSelect={setActiveSelect}
              handleSearch={onHandleSearch}
              clearSearch={onClearSearch}
            />
          </div>
          <div className="mt-3 w-full flex flex-wrap gap-2">
            {nfts.map((nft) => (
              <NFTCard key={nft.tokenId} nft={nft} onProfilePage />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyNFTS;
