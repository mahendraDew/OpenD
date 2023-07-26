import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { Principal } from "@dfinity/principal";
import Button from "./Button";
import { opend } from "../../../declarations/opend/index";
import CURRENT_USER_ID from "../index";
import PriceLable from "./PriceLabel";


function Item(props) { 

  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState();
  const [priceLable, setPriceLable] = useState();

  const id = props.id;

  // we are creating to fetch the owner/ name of our canister
  const localHost = "http://localhost:8080/";
  const agent = new HttpAgent({host: localHost});
  //todo: when deploy, remove the following line-
  agent.fetchRootKey();
  let NFTActor;

  async function loadNFT(){
    // idl factory basically translate our file, it basically gives frontend translated version of backend
    NFTActor = await Actor.createActor(idlFactory, {
      agent,
      canisterId: id,
    });


    const name = await NFTActor.getName();
    const owner = await NFTActor.getOwner();
    const imageData = await NFTActor.getAsset(); // this will be in Nat8 formate, so we have to convert it into some formate that can be used as an link

    const imageContent = new Uint8Array(imageData);  // this convert the Nat8 into something that is recognizable by js
    const image = URL.createObjectURL(new Blob([imageContent.buffer], {type: "image/png"}));

    setOwner(owner.toText());
    setName(name);
    setImage(image);

    if(props.role == "collection"){
      const nftIsListed = await opend.isListed(props.id);
      console.log("nftIsListed:"+nftIsListed);
      if(nftIsListed){
        setOwner("OpenD");
        setBlur({filter: "blur(4px)"});
      }else{
        setButton(<Button handleClick={handleSell} text={"sell"} />);

      }
    }else if(props.role == "discover"){
      console.log("in discover page")
      const originalOwner = await opend.getOriginalOwner(props.id);
      
      if(originalOwner.toText() != CURRENT_USER_ID.toText()){
        setButton(<Button handleClick={handleBuy} text={"Buy"} />);
      }

      const price = await opend.getListedNFTPrice(props.id);
      setPriceLable(<PriceLable sellPrice={price.toString()} />);
      

    }
    
  }
  // it will ensure the loadNFT() will call only onces
  useEffect(()=>{
    loadNFT();
  },[]);

  let price;
  async function handleSell(){
    console.log("button");
    setPriceInput(
    <input
        placeholder="Price in DAMM"
        type="number"
        className="price-input"
        value={price}
        onChange={(e)=>price=e.target.value}
      />
    );
    
    setButton(<Button handleClick={sellItem} text={"Confirm"} />);
    
  }

  async function sellItem(){
    setBlur({filter: "blur(4px)"});
    setLoaderHidden(false);
    const listingResult = await opend.listItem(props.id, Number(price));
    console.log("Listing:" + listingResult);
    if(listingResult == "Success"){
      const openDID = await opend.getOpendCanisterID();
      const transferResult = await NFTActor.transferOwnership(openDID);
      console.log("Transfer:" + transferResult);
      if(transferResult == "Success"){
        setLoaderHidden(true);
        setButton();
        setPriceInput();
        setOwner("OpenD");
      }
    }
  }


  async function handleBuy(){
    console.log("buy was trigger");
  }



  return (
    <div className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />
        <div className="lds-ellipsis" hidden={loaderHidden}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
        <div className="disCardContent-root">
          {priceLable}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"></span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
