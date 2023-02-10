import React, { useCallback, useContext, useMemo, useState } from "react";
// import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { useTheme } from "next-themes";
// import { Web3Storage } from "web3.storage";
import { Web3Storage } from "web3.storage/dist/bundle.esm.min.js";

import axios from "axios";
import { Button, Input, Loader } from "../components";
import images from "../assets";
import { NFTContext } from "../context/NFTContext";

// const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEYxNDNiNzUzRDZBRDM1QjkxZWJENTg1NDdEOTYyZTQxNzA5NUM5MTYiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NzAyODYyODY1MDYsIm5hbWUiOiIzRCJ9.yK9244pL_HgE13c3eIfLxOEXuHOi0aqqTot6vl8R5eI";

const client = new Web3Storage({ token });

const CreateNFT = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [fileID, setFileID] = useState(null);
  const [formInput, setFormInput] = useState({
    title: "",
    description: "",
    price: "",
  });
  const { theme } = useTheme();
  const { createNFT, isLoadingNFT } = useContext(NFTContext);
  const router = useRouter();

  const uploadImageToInfura = async (file) => {
    try {
      const cid = await client.put(file);

      const url = `https://${cid}.ipfs.w3s.link/${file[0].name}`;
      setFileID(cid);

      setImageUrl(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  const uploadFileToInfura = async (file) => {
    try {
      const cid = await client.put([file]);

      const url = `https://${cid}.ipfs.w3s.link/${file.name}`;

      setFileUrl(url);
      console.log(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  const onDrop = useCallback(async (acceptedFile) => {
    await uploadImageToInfura(acceptedFile);
  }, []);

  const onFileUpload = useCallback(async (acceptedFile) => {
    await uploadFileToInfura(acceptedFile);
  }, []);

  const addToTheData = async (form) => {
    const formData = new FormData();
    formData.append("file", form);
    await axios
      .post("http://localhost:8080/api/add/images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        const { added } = res.data;

        if (added.length === 1) return onFileUpload(form);
      })
      .catch((error) => console.log(error.response));
  };

  const check = async (checkFile) => {
    const formData = new FormData();
    formData.append("file", checkFile);
    formData.append("dist", 10);
    await axios
      .post("http://localhost:8080/api/check", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        const { duplicated } = res.data;

        console.log(duplicated);
        if (duplicated) return alert("no double in my site");
        addToTheData(checkFile);
      })
      .catch((error) => console.log(error.response));
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    maxSize: 5000000,
  });

  const fileStyle = useMemo(
    () => `dark:bg-nft-black-1 bg-white border dark:border-white border-nft-gray-2 flex flex-col items-center p-5 rounded-sm border-dashed  
       ${isDragActive ? " border-file-active " : ""} 
       ${isDragAccept ? " border-file-accept " : ""} 
       ${isDragReject ? " border-file-reject " : ""}`,
    [isDragActive, isDragReject, isDragAccept]
  );

  if (isLoadingNFT)
    return (
      <div className="flexStart min-h-screen">
        <Loader />
      </div>
    );

  return (
    <div className="flex justify-center sm:px-4 p-12">
      <div className="w-3/5 md:w-full">
        <h1 className="font-poppins dark:text-white text-nft-black-1 text-2xl minlg:text-4xl font-semibold ml-4 xs:ml-0">
          Create new NFT
        </h1>

        <div className="mt-16">
          <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-xl">
            Upload File
          </p>
          <div className="mt-4">
            <div {...getRootProps()} className={fileStyle}>
              <input {...getInputProps()} />
              <div className="flexCenter flex-col text-center">
                {" "}
                <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-xl">
                  JPG, PNG, GIF, SVG, WEBM. Max 100mb.
                </p>
                <div className="my-12 w-full flex justify-center">
                  <Image
                    src={images.upload}
                    style={{ objectFit: "contain", width: 100, height: 100 }}
                    alt="file upload"
                    className={theme === "light" ? "filter invert" : undefined}
                  />
                </div>
                <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-sm">
                  Drag and Drop File
                </p>
                <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-sm mt-2">
                  or browse media on your device
                </p>
              </div>
            </div>
            {imageUrl && (
              <aside>
                <div>
                  <img src={imageUrl} alt="asset_file" />
                </div>
              </aside>
            )}
          </div>
        </div>

        <Input
          inputType="file"
          title="File GLB"
          // placeholder="Put Your GLB File Here"
          handleClick={(e) => {
            // onFileUpload(e.target.files[0]);
            check(e.target.files[0]);
            // console.log(e.target.files[0]);
            // setFileGLB(e.target.files[0]);
          }}
        />
        <Input
          inputType="input"
          title="Name"
          placeholder="NFT Name"
          handleClick={(e) =>
            setFormInput({ ...formInput, title: e.target.value })
          }
        />
        <Input
          inputType="textarea"
          title="Description"
          placeholder="NFT Description"
          handleClick={(e) =>
            setFormInput({ ...formInput, description: e.target.value })
          }
        />
        <Input
          inputType="number"
          title="Price"
          placeholder="NFT Price"
          handleClick={(e) =>
            setFormInput({ ...formInput, price: e.target.value })
          }
        />

        <div className="mt-7 w-full flex justify-end">
          <Button
            btnName="Create NFT"
            classStyles="rounded-xl"
            handleClick={() =>
              createNFT(formInput, imageUrl, fileUrl, router, fileID)
            }
          />
        </div>
      </div>
    </div>
  );
};

export default CreateNFT;
