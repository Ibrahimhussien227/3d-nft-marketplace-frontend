import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

import { NFTContext } from "../context/NFTContext";
import { Button, Loader, Modal, Table } from "../components";
import { shortenAddress } from "../utils/shortenAddress";
import images from "../assets";

const PaymentBodyCmp = ({ nft, nftCurrency }) => (
  <div className="flex flex-col">
    <div className="flexBetween">
      <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-base minlg:text-xl">
        Item
      </p>{" "}
      <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-base minlg:text-xl">
        Subtotal
      </p>
    </div>

    <div className="flexBetweenStart my-5">
      <div className="flex-1 flexStartCenter">
        <div className="relative w-24 h-52">
          <Image
            src={`/api/imageProxy?imageUrl=${nft.image}`}
            fill
            sizes="true"
            style={{ objectFit: "cover" }}
            alt="nft-detail-samll-image"
          />
        </div>
        <div className="flexCenterStart flex-col ml-5">
          <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-sm minlg:text-xl">
            {shortenAddress(nft.seller)}
          </p>
          <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-sm minlg:text-xl">
            {nft.name}
          </p>
        </div>
      </div>

      <div>
        <p className="font-poppins dark:text-white text-nft-black-1 font-normal text-sm minlg:text-xl">
          {nft.price} <span className="font-semibold">{nftCurrency}</span>
        </p>
      </div>
    </div>

    <div className="flexBetween mt-10">
      <p className="font-poppins dark:text-white text-nft-black-1 font-normal text-base minlg:text-xl">
        Total
      </p>{" "}
      <p className="font-poppins dark:text-white text-nft-black-1 font-normal text-sm minlg:text-xl">
        {nft.price} <span className="font-semibold">{nftCurrency}</span>
      </p>
    </div>
  </div>
);

const NFTDetails = () => {
  const {
    nftCurrency,
    buyNFT,
    setAnotherAccount,
    currentAccount,
    fetchUsername,
    anotherAccount,
    getCurrentTransaction,
    isLoadingNFT,
  } = useContext(NFTContext);
  const [isLoading, setIsLoading] = useState(true);
  const [nft, setNft] = useState({
    image: "",
    glb: "",
    tokenId: "",
    title: "",
    name: "",
    owner: "",
    price: "",
    seller: "",
    sold: false,
  });
  const [transaction, setTransaction] = useState([]);
  const router = useRouter();
  const [paymentModal, setPaymentModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [names, setNames] = useState({
    id: "",
    name: "",
    image: "",
  });

  useEffect(() => {
    if (!router.isReady) return;

    setNft(router.query);

    fetchUsername(
      router.query.seller === "0x0000000000000000000000000000000000000000"
        ? router.query.owner
        : router.query.seller
    )
      .then((items) => {
        setNames({ name: items.name, id: items.userId, image: items.image });
      })
      .catch((error) => {
        setNames("No Name");
        console.log(error);
      });

    setIsLoading(false);
    getCurrentTransaction(router.query.tokenId).then((items) => {
      setTransaction(items);
    });
  }, [router.isReady]);

  const checkout = async () => {
    await buyNFT(nft);

    setPaymentModal(false);
    setSuccessModal(true);
  };

  const onClickAddres = (sellerAddress, ownerAddress, name) => {
    if (sellerAddress === "0x0000000000000000000000000000000000000000") {
      localStorage.setItem("anotherAccount", ownerAddress);
      // sessionStorage.setItem("anotherAccount", ownerAddress);
      setAnotherAccount(ownerAddress);
    } else {
      localStorage.setItem("anotherAccount", sellerAddress);
      // sessionStorage.setItem("anotherAccount", sellerAddress);
      setAnotherAccount(sellerAddress);
    }

    if (sellerAddress === "0x5FbDB2315678afecb367f032d93F642f64180aa3") return;
    if (currentAccount === anotherAccount.toLowerCase()) {
      return name === "No Name" || name.length === 0
        ? router.push(`/collection?my-nft=${currentAccount}`)
        : router.push(`/collection?my-nft=${name}`);
    }
    if (sellerAddress === "0x0000000000000000000000000000000000000000") {
      return name === "No Name"
        ? router.push(`/collection?seller=${ownerAddress}`)
        : router.push(`/collection?seller=${name}`);
    }
    return name === "No Name" || name.length === 0
      ? router.push(`/collection?seller=${sellerAddress}`)
      : router.push(`/collection?seller=${name}`);
  };

  if (isLoading) return <Loader />;

  return (
    <div className="relative flex justify-center md:flex-col min-h-screen">
      <div className="relative flex-1 flexCenter sm:px-4 p-12 border-r md:border-r-0 md:border-b dark:border-nft-black-1 border-nft-gray-1">
        <div className="relative w-557 minmd:w-2/3 minmd:h-2/3 sm:w-full sm:h-300 h-557">
          <model-viewer
            alt="A 3D model"
            src={nft.glb}
            ios-src=""
            poster={nft.image}
            shadow-intensity="10"
            camera-controls
            auto-rotate
            ar
            style={{
              objectFit: "cover",
              height: 560,
              margin: "auto",
            }}
          />
        </div>
      </div>

      <div className="flex-1 justify-start sm:px-4 p-12 sm:pb-4 sm:mt-52">
        <div className="flex flex-row sm:flex-col">
          <h2 className="font-poppins dark:text-white text-nft-black-1 font-semibold text-2xl minlg:text-3xl">
            {nft.title}
          </h2>
        </div>
        <h2 className="font-poppins dark:text-white text-nft-black-1 font-semibold text-2xl minlg:text-3xl">
          {`${nft.name} #${nft.tokenId}`}
        </h2>
        <div className="mt-10">
          <p className="font-poppins dark:text-white text-nft-black-1 text-xs minlg:text-base font-normal">
            Creator
          </p>
          <div
            className="flex flex-row items-center mt-3 cursor-pointer"
            onClick={() => {
              onClickAddres(nft.seller, nft.owner, names.name);
            }}
          >
            <div className="relative w-12 h-12 minlg:w-20 minlg:h-20 mr-2">
              <Image
                src={
                  names.image.length === 0
                    ? images.creator1
                    : `/api/imageProxy?imageUrl=${names.image}`
                }
                style={{ objectFit: "cover" }}
                fill
                sizes="true"
                className="rounded-full"
                alt="creator"
              />
            </div>
            <p className="font-poppins dark:text-white text-nft-black-1 text-xs minlg:text-base font-semibold ">
              {names.name.length !== 0
                ? names.name
                : nft.seller === "0x0000000000000000000000000000000000000000"
                ? shortenAddress(nft.owner)
                : shortenAddress(nft.seller)}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col">
          <div className="w-full border-b dark:border-nft-black-1 border-nft-gray-1 flex flex-row">
            <p className="font-poppins dark:text-white text-nft-black-1 text-base minlg:text-base font-medium mb-2">
              Details
            </p>
          </div>
          <div className="mt-3">
            <p className="font-poppins dark:text-white text-nft-black-1 text-base font-normal">
              {nft.description}
            </p>
          </div>
        </div>
        <div className="flex flex-row sm:flex-col mt-10">
          {currentAccount === nft.seller.toLowerCase() ? (
            <p className="font-poppins dark:text-white text-nft-black-1 text-base font-normal border border-gray-500 p-2">
              You cannot buy your own NFT
            </p>
          ) : currentAccount === nft.owner.toLowerCase() ? (
            <Button
              btnName="List on Marketplace"
              classStyles="mr-5 sm:mr-0 sm:mb-5 rounded-xl"
              handleClick={() =>
                router.push(
                  `/resell-nft?tokenId=${nft.tokenId}&tokenURI=${nft.tokenURI}`
                )
              }
            />
          ) : nft.sold === "true" &&
            nft.owner.toLowerCase() !== currentAccount ? (
            <p className="font-poppins dark:text-white text-nft-black-1 text-base font-normal border border-gray-500 p-2">
              Not For Sell Yet
            </p>
          ) : (
            <Button
              btnName={`Buy for ${nft.price} ${nftCurrency}`}
              classStyles="mr-5 sm:mr-0 sm:mb-5 rounded-xl"
              handleClick={() => setPaymentModal(true)}
            />
          )}
        </div>
        <div className="mt-10">
          <Table
            nft={nft}
            transaction={transaction}
            onClickAddres={onClickAddres}
          />
        </div>
      </div>

      {paymentModal && (
        <Modal
          header="Check Out"
          body={<PaymentBodyCmp nft={nft} nftCurrency={nftCurrency} />}
          footer={
            <div className="flex flex-row sm:flex-col">
              <Button
                btnName="Checkout"
                classStyles="mr-5 sm:mb-5 sm:mr-0 rounded-xl"
                handleClick={checkout}
              />
              <Button
                btnName="Cancel"
                classStyles="rounded-xl"
                handleClick={() => setPaymentModal(false)}
              />
            </div>
          }
          handleClose={() => setPaymentModal(false)}
        />
      )}

      {isLoadingNFT && (
        <Modal
          header="Buying NFT..."
          body={
            <div className="flexCenter flex-col text-center">
              <div className="relative w-52 h-52">
                <Loader />
              </div>
            </div>
          }
        />
      )}

      {successModal && (
        <Modal
          header="Payment Successful"
          body={
            <div
              className="flexCenter flex-col text-center"
              onClick={() => setSuccessModal(false)}
            >
              <div className="relative w-52 h-96">
                <Image
                  src={`/api/imageProxy?imageUrl=${nft.image}`}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="true"
                  alt="nft-detail"
                />
              </div>
              <p className="font-poppins dark:text-white text-nft-black-1 font-normal text-sm minlg:text-xl mt-10">
                You successfully purchased
                <span className="font-semibold"> {nft.name}</span> from{" "}
                <span className="font-semibold">
                  {shortenAddress(nft.seller)}
                </span>
              </p>
            </div>
          }
          footer={
            <div className="flexCenter flex-col">
              <Button
                btnName="Check it out"
                classStyles="sm:mb-5 sm:mr-0 rounded-xl"
                handleClick={() => {
                  localStorage.setItem("anotherAccount", currentAccount);
                  // sessionStorage.setItem("anotherAccount", currentAccount);
                  router.push(`/collection?my-nft=${currentAccount}`);
                }}
              />
            </div>
          }
          handleClose={() => setSuccessModal(false)}
        />
      )}
    </div>
  );
};

export default NFTDetails;
