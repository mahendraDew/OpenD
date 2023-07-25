import Debug "mo:base/Debug";
import Principal "mo:base/Principal";

/*  let itemName = name;
    let nftOwner = owner;
    let imageBytes = content;

    each nft have a unique things (there unique principal id) so whenever we created canister we get the unique canister id these principla ids get created eg main canister OPEND has some canister id, nft canister have its own canister id. so every time when we programmatically(actors/block of program which is defined with class)  create a new NFT (means building the below actor class )
    then it will be assign new canister/principle id whick is uniquely identify that particular image/text/resouces and cant be exchanged to anything. 


*/
actor class NFT(name: Text, owner: Principal, content: [Nat8]) = this{ // content :- stores actuall bits of img data hence we are providing it as Nat8. it is an arrya of random values. 

    private let itemName = name;
    private var nftOwner = owner;
    private let imageBytes = content;

    public query func getName(): async Text {
        return itemName;
    };
    public query func getOwner(): async Principal{
        return nftOwner;
    };
    public query func getAsset(): async [Nat8]{
        return imageBytes;
    };


    public query func getCanisterId() : async Principal{
        return Principal.fromActor(this);
    };
    

    public shared(msg) func transferOwnership(newOwner: Principal) : async Text{
        if(msg.caller == nftOwner){
            nftOwner := newOwner;
            return "Success";
        }else{
            return "Error: Not initiated by NFT Owner.";
        }

    };

};

