import { useContext, useEffect, useState } from "react";
import { NFTContext } from "../context/NFTContext";

export const getUserProfile = (address = "") => {
  const { fetchUsername } = useContext(NFTContext);
  const [names, setNames] = useState({
    id: "",
    name: "",
    image: "",
  });
  const [check, setCheck] = useState(false);
  useEffect(() => {
    fetchUsername(
      address.length === 0 ? localStorage.getItem("anotherAccount") : address
    )
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
  }, []);

  return { names, check };
};
