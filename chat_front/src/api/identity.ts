import { useAuthStore } from "../store/auth"
import { encodeBase64, decodeBase64 } from "tweetnacl-util";
import { NoPublicKeyOnServer } from "../utils.ts/Errors";
import { url } from "../variables/variables";

export async function PutPublicKey(signPub:Uint8Array, dhPub: Uint8Array){
    const auth = useAuthStore();
    /*JSON.stringify({
                signPub:encodeBase64(signPub),
                dhPub:encodeBase64(dhPub)
            })*/
    const res = await fetch(url+"users/me/public_key", {
        method:"PUT",
        headers:{
            "Authorization": "Bearer "+ auth.access_token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            public_key: JSON.stringify({
                signPub:encodeBase64(signPub),
                dhPub:encodeBase64(dhPub)
            })
        }),
    })

    if(!res.ok){
        throw new Error("erreur dans la plublication des pub_keys")
    }

}

export async function GetMyPublicKey(){
    const auth = useAuthStore();
    const res = await fetch(url+"users/me/public_key", {
        method:"GET",
        headers:{
            "Authorization": "Bearer "+ auth.access_token,
            "Content-Type": "application/json",
        }
    })

    if(!res.ok){
        throw new Error("erreur dans la plublication des pub_keys")
    }

    const data = await res.json();
    console.log(data);
    if(data.public_key === null){
        throw new NoPublicKeyOnServer();
    }
    data.public_key = JSON.parse(data.public_key);
    data.public_key.signPub = decodeBase64(data.public_key.signPub);
    data.public_key.dhPub = decodeBase64(data.public_key.dhPub);

    return data;
}

