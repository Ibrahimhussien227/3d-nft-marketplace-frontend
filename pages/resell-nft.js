import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";

import axios from "axios";
import { NFTContext } from "../context/NFTContext";
import { Input, Loader, Button } from "../components";

const ResellNFT = () => {
  const { createSale, isLoadingNFT } = useContext(NFTContext);
  const router = useRouter();
  const { tokenId, tokenURI } = router.query;
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [glb, setGlb] = useState("");

  const fetchNFT = async () => {
    const { data } = await axios.get(tokenURI);

    setImage(data.image);
    setGlb(data.glb);
  };

  useEffect(() => {
    if (tokenURI) fetchNFT();
  }, [tokenURI]);

  const resell = async () => {
    await createSale(tokenURI, price, true, tokenId);

    router.push("/");
  };

  if (isLoadingNFT)
    return (
      <div className="flexStart min-h-screen">
        <Loader />
      </div>
    );

  return (
    <div className="flex justify-center sm:px-4 p-12">
      <div className="w-3/5 md:w-full">
        <h1 className="font-poppins dark:text-white text-nft-black-1 font-semibold text-2xl">
          Resell NFT
        </h1>

        <Input
          inputType="number"
          title="Price"
          placeholder="NFT Price"
          handleClick={(e) => setPrice(e.target.value)}
        />

        {image && glb && (
          <model-viewer
            alt="A 3D model"
            src={glb}
            ios-src=""
            poster={image}
            shadow-intensity="10"
            camera-controls
            auto-rotate
            ar
            style={{
              objectFit: "cover",
              height: "557px",
              margin: "auto",
              width: "350px",
              marginTop: "16px",
            }}
          />
        )}

        <div className="mt-7 w-full flex justify-end">
          <Button
            btnName="List NFT"
            classStyles="rounded-xl"
            handleClick={resell}
          />
        </div>
      </div>
    </div>
  );
};

export default ResellNFT;
