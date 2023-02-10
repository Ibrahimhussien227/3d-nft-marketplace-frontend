import Image from "next/image";
import { useRouter } from "next/router";
import { useContext } from "react";

import images from "../assets";
import { NFTContext } from "../context/NFTContext";
import { getUserProfile } from "../utils/getUserProfile";
import { shortenAddress } from "../utils/shortenAddress";

const CreaterCard = ({ rank, creatorImage, creatorAddress, creatorEths }) => {
  const {
    nftCurrency,
    currentAccount,
    setAnotherAccount,
    anotherAccount,
    // fetchUsername,
  } = useContext(NFTContext);
  // const [names, setNames] = useState({
  //   id: "",
  //   name: "",
  // });
  const router = useRouter();

  // useEffect(() => {
  //   fetchUsername(creatorAddress)
  //     .then((items) => {
  //       setNames({ name: items.name, id: items.userId });
  //     })
  //     .catch((error) => {
  //       setNames("No Name");
  //       console.log(error);
  //     });
  // }, []);

  const { names } = getUserProfile(creatorAddress);

  const onClickAddress = (address, name) => {
    localStorage.setItem("anotherAccount", address);
    setAnotherAccount(address);
    if (currentAccount === anotherAccount.toLowerCase()) {
      return name === "No Name" || name.length === 0
        ? router.push(`/collection?my-nft=${address}`)
        : router.push(`/collection?my-nft=${name}`);
    }
    return name === "No Name" || name.length === 0
      ? router.push(`/collection?seller=${address}`)
      : router.push(`/collection?seller=${name}`);
  };

  return (
    <div
      onClick={() => onClickAddress(creatorAddress, names.name)}
      className="min-w-190 minlg:min-w-240 dark:bg-nft-black-3 bg-white border dark:border-nft-black-3 border-nft-gray-1 rounded-3xl flex flex-col p-4 m-4 cursor-pointer"
    >
      <div className="w-8 h-8 minlg:w-10 minlg:h-10 bg-nft-red-violet flexCenter rounded-full">
        <p className="font-poppins text-white font-semibold text-base minlg:text-lg">
          {rank}
        </p>
      </div>

      <div className="my-2 flex justify-center">
        <div className="relative w-20 h-20 minlg:w-28 minlg:h-28">
          <Image
            src={
              names.image.length === 0
                ? creatorImage
                : `/api/imageProxy?imageUrl=${names.image}`
            }
            fill
            sizes="true"
            alt="creatorImage"
            style={{ objectFit: "cover" }}
            className="rounded-full"
          />
          <div className="absolute w-4 h-4 minlg:w-7 minlg:h-7 bottom-2 -right-0">
            <Image
              src={images.tick}
              fill
              sizes="true"
              alt="tick"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 minlg:mt-7 text-center flexCenter flex-col">
        <p
          // suppressHydrationWarning
          className="font-poppins dark:text-white text-nft-black-1 font-semibold text-base"
        >
          {names.name.length !== 0
            ? names.name
            : shortenAddress(creatorAddress)}
        </p>
        <p className="mt-1 font-poppins dark:text-white text-nft-black-1 font-semibold text-base">
          {creatorEths.toFixed(2)}{" "}
          <span className="font-normal">{nftCurrency}</span>
        </p>
      </div>
    </div>
  );
};

export default CreaterCard;
