import Image from "next/image";

import images from "../assets";

const Loader = () => (
  <div className="flexCenter w-full my-4">
    <Image
      src={images.loader}
      alt="loader"
      style={{ objectFit: "contain", width: 100 }}
      priority
    />
  </div>
);

export default Loader;
