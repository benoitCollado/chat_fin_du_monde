import { useAuthStore } from "../store/auth"
import { decodeBase64 } from "tweetnacl-util";
import type { User } from "../store/users";
import { url } from "../variables/variables";


export interface UserGet{
    id:number,
    username:string,
    public_key: string | null,
}
export interface UserPubKey{
    signPub:Uint8Array,
    dhPub: Uint8Array
}

export async function getUsersAPI(){
    const auth = useAuthStore();
    const res = await fetch(url+"users/annuaire?only_with_key=true", {
        method:"GET",
        headers:{
            "Authorization": "Bearer "+ auth.access_token,
            "Content-Type": "application/json",
        }
    });
    if (!res.ok){
        throw new Error("un problème est survenu")
    }
    const data : UserGet[]= await res.json();
    console.log("les users reçus " ,data);
    const users : User[] = []
    data.forEach(user=>{
        console.log("on est ici");
        if(user.public_key !== null && typeof user.public_key === "string"){
            try{
            let public_key = JSON.parse(user.public_key);
            let pub_key : UserPubKey | null = null;
            console.log(pub_key);
            if (!public_key.signPub || !public_key.dhPub) {
                console.warn("Clés incomplètes pour user:", user.username);
            }else{
                public_key.signPub = decodeBase64(public_key.signPub);
                public_key.dhPub = decodeBase64(public_key.dhPub);
                pub_key = public_key;
            }
            users.push({
                id:user.id,
                username:user.username,
                public_key:public_key
            });
        }catch{
            console.log("une erreur innattendue est survenue")
        }
        }else{
            users.push(user as User);
        }
    });
    
    
    console.log("les users modifiés", users)
    return users;
}

export async function getPublicKey(user_id:number){
    const auth = useAuthStore();
    const res = await fetch(url+`users/${user_id}/public_key`, {
        method:"post",
        headers:{
            "Authorization": "Bearer "+ auth.access_token,
            "Content-Type": "application/json",
        }
    })

    if(!res.ok){
        throw new Error("erreur dans la plublication des pub_keys");
    }

    const dataString= await res.json();
    dataString.public_key = await dataString.public_key.json();
    
    return dataString;
    
}