import { defineStore } from 'pinia'
import { ref} from 'vue'
import { generateIdentity, SaveIdentityTolocalStorage, loadIdentityFromLocalStorage, isFalsyUint8Array} from '../services/crypto';
import type { Identity } from '../services/crypto';
import { WrongPasswordError, NoIdentity, IdentityAlreadyExistError, NoPublicKeyOnServer } from '../utils.ts/Errors';
import { PutPublicKey, GetMyPublicKey } from '../api/identity';


export const useIdentityStore = defineStore('identity', () => {
  // --- State ---
  const identity = ref<Identity>({  signPub: new Uint8Array(0),
  signPriv:new Uint8Array(0),
  dhPub: new Uint8Array(0),
  dhPriv:new Uint8Array(0),});

  async function generateKeys(){
    const already = alreadHasKeys();
    if(isFalsyUint8Array(identity.value.signPub) && !already){
        const id : Identity = await generateIdentity();
        identity.value = id;
        await PutPublicKey(identity.value.signPub, identity.value.dhPub);
    }else{
        throw new IdentityAlreadyExistError("un trousseaux de clé existe déjà");
    }
  }

  function alreadHasKeys(): boolean{
    const already = localStorage.getItem("myIdentity");

    return !!already;
  }

  async function saveKeysLocal(){
    try{
        await generateKeys();
        console.log("onarrive là");
        let mdp1 : string | null = null
        let mdp2 : string | null= null
        do{
            console.log("puis là");
            mdp1 = prompt("Veuillez entrer un mot de passe pour sauvegarder de manière sécuriée vos clés vous ne pourrez plsu le changer");
            mdp2 = prompt('Veuillez confirer votre mot de passe');
            if(mdp1 !== mdp2){
                alert("Les mots de passes ne correspondent pas");
            }
        }while(mdp1 !== mdp2 && mdp1 === null && mdp2 === null);
        console.log("sav1")
        SaveIdentityTolocalStorage(mdp1 as string, identity.value);
    }
    catch(e){
        if (e instanceof IdentityAlreadyExistError) {
            alert("Chargement de vos clés")
            getKeysLocal();
        } else if (e instanceof WrongPasswordError) {
            alert(e.message);
        } 
        else if (e instanceof NoIdentity){
            alert(e.message  + " " + e.name);
        }
        else if (e instanceof Error) {
            alert(e.message  + " " + e.name);
        } else {
            alert("Une erreur inattendue est survenue");
        }
    }
}

  async function getKeysLocal(){
    let password = prompt("entrez votre mot de passe pour récupérer");
    password = password || "123"

    try{
        identity.value = loadIdentityFromLocalStorage(password);
        const public_key = await GetMyPublicKey();

        console.log("my keys:", identity.value);
        console.log("my pub keys sur le serveur", public_key);
    }catch(e){
        if (e instanceof IdentityAlreadyExistError) {
            alert(e.message);
        } else if (e instanceof WrongPasswordError) {
            alert(e.message);
        } 
        else if ( e instanceof NoPublicKeyOnServer){
            alert("no public key foound on server putng public key on server");
            await PutPublicKey(identity.value.signPub, identity.value.dhPub);
            const public_key = await GetMyPublicKey();

        console.log("my keys:", identity.value);
        console.log("my pub keys sur le serveur", public_key);
        }
        else if (e instanceof Error) {
            alert(e.message);
        } else {
            alert("Une erreur inattendue est survenue");
        }
    }
    
  }

  function resetIdentyStore(){
    identity.value = {
          signPub: new Uint8Array(0),
  signPriv:new Uint8Array(0),
  dhPub: new Uint8Array(0),
  dhPriv:new Uint8Array(0),
    }
  }


  return {
    identity,
    saveKeysLocal,
    getKeysLocal,
    resetIdentyStore
  }
})