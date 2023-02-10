import React, { useContext, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import moment from "moment/moment";
import { useRouter } from "next/router";

import images from "../assets";
import { shortenAddress } from "../utils/shortenAddress";
import { NFTContext } from "../context/NFTContext";

const Table = ({ transaction }) => {
  const [toggle, setToggle] = useState(false);
  const { currentAccount, anotherAccount, setAnotherAccount } =
    useContext(NFTContext);
  const router = useRouter();
  const { theme } = useTheme();

  const compare = (a, b) => {
    if (a.timestamp.toString() < b.timestamp.toString()) {
      return 1;
    }
    if (a.timestamp.toString() > b.timestamp.toString()) {
      return -1;
    }
    return 0;

    //   a.timestamp.toString() > b.timestamp.toString()
    //     ? -1
    //     : b.timestamp.toString() > a.timestamp.toString()
    //     ? 1
    //     : 0
  };

  const onClickAddress = (address) => {
    localStorage.setItem("anotherAccount", address);
    // sessionStorage.setItem("anotherAccount", address);
    setAnotherAccount(address);
    if (currentAccount === anotherAccount.toLowerCase()) {
      router.push(`/collection?my-nft=${address}`);
    } else {
      router.push(`/collection?seller=${address}`);
    }
  };

  return (
    <div
      onClick={() => {
        setToggle((prevToggle) => !prevToggle);
      }}
      className="relative flexBetween sm:ml-0 sm:mt-2 min-w-190 cursor-pointer dark:bg-nft-black-2 bg-white border dark:border-nft-black-2 border-nft-gray-2 py-3 px-4 rounded-md"
    >
      <p className="font-poppins dark:text-white text-nft-black-1 font-normal text-xs">
        Transactions
      </p>
      <Image
        src={images.arrow}
        style={{ objectFit: "contain", width: 15, height: 15 }}
        sizes="auto"
        alt="arrow"
        className={theme === "light" ? "filter invert" : undefined}
      />
      {toggle && (
        <div
          className="absolute top-full left-0 right-0 w-full mt-3 z-10 dark:bg-nft-black-2 bg-white
         border dark:border-nft-black-2 dark:border-t-nft-black-4 border-nft-gray-2 
         rounded-md overflow-x-auto"
        >
          <table className="w-full text-sm text-left text-nft-black-1 dark:text-white">
            <thead className="text-xs text-nft-gray-3 uppercase bg-gray-50 dark:bg-nft-black-4 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Price
                </th>
                <th scope="col" className="px-6 py-3">
                  From
                </th>
                <th scope="col" className="px-6 py-3">
                  To
                </th>
                <th scope="col" className="px-6 py-3">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {transaction
                .sort(compare)
                .map(({ owner, seller, price, timestamp }) => (
                  <tr
                    key={timestamp}
                    className="bg-white border-b dark:bg-nft-black-2   dark:border-nft-black-3"
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {price}
                    </th>
                    <td
                      onClick={() => {
                        onClickAddress(seller);
                      }}
                      className="px-6 py-4"
                    >
                      {seller === "0x5FbDB2315678afecb367f032d93F642f64180aa3"
                        ? "Minted"
                        : shortenAddress(seller)}
                    </td>
                    <td
                      onClick={() => {
                        onClickAddress(owner);
                      }}
                      className="px-6 py-4"
                    >
                      {shortenAddress(owner)}{" "}
                    </td>
                    <td className="px-2 py-4">
                      {moment(timestamp.toString() * 1000).fromNow()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default Table;
