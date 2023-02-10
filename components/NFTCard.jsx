import React, { useContext } from "react";
import Image from "next/image";
import Link from "next/link";

import images from "../assets";
import { NFTContext } from "../context/NFTContext";
import { shortenAddress } from "../utils/shortenAddress";

const NFTCard = ({ nft, onProfilePage }) => {
  const { nftCurrency, currentAccount, anotherAccount } =
    useContext(NFTContext);

  return (
    <Link href={{ pathname: "/nft-details", query: nft }}>
      <div className="flex-1 min-w-215 max-w-max xs:max-w-none sm:w-full xxs:min-w-240 sm:min-w-155 minmd:min-w-256 minlg:min-w-327 dark:bg-nft-black-3 bg-white rounded-2xl p-4 m-4 minlg:m-8 sm:my-2 sm:mx-2 xxs:mx-4 cursor-pointer shadow-md">
        <div className="relative w-full h-52 sm:h-36 minmd:h-60 minlg:h-300 rounded-2xl overflow-hidden">
          <Image
            src={
              `/api/imageProxy?imageUrl=${nft.image}` || images[`nft${nft.i}`]
            }
            fill
            sizes="(max-width: 768px) 100vw,
            (max-width: 1200px) 50vw,
            33vw"
            priority
            alt={`nft${nft.i}`}
          />
        </div>
        <div className="mt-3 flex flex-col">
          <div className="flexBetween flex-row xs:flex-col xs:items-start">
            <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-sm minlg:text-xl">
              {nft.title}
            </p>
            {nft.sold && nft.owner.toLowerCase() === anotherAccount ? (
              <p className="font-poppins dark:text-white text-nft-black-1 text-base font-normal border border-gray-500 p-1">
                Sell It
              </p>
            ) : nft.sold && nft.oldSeller === anotherAccount ? (
              <p className="font-poppins dark:text-white text-nft-black-1 text-base font-normal border border-gray-500 p-1">
                Recently Sold
              </p>
            ) : (
              nft.sold &&
              nft.owner.toLowerCase() !== currentAccount && (
                <p className="font-poppins dark:text-white text-nft-black-1 text-base font-normal border border-gray-500 p-1">
                  Not For Sell Yet
                </p>
              )
            )}
          </div>
          <div className="flexBetween mt-1 minlg:mt-3 flex-row xs:flex-col xs:items-start xs:mt-3">
            <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-xs minlg:text-lg">
              {nft.price} <span className="normal">{nftCurrency}</span>
            </p>
            <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-xs minlg:text-lg">
              {shortenAddress(
                !onProfilePage
                  ? nft.seller
                  : nft.seller.toLowerCase() === currentAccount ||
                    nft.owner.toLowerCase() === currentAccount
                  ? currentAccount
                  : nft.sold && nft.oldSeller === anotherAccount
                  ? nft.owner
                  : anotherAccount
              )}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NFTCard;
