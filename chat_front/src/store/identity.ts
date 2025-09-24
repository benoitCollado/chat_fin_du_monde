import { defineStore } from 'pinia'
import { ref} from 'vue'
import { generateIdentity, SaveIdentityTolocalStorage, loadIdentityFromLocalStorage, isFalsyUint8Array} from '../services/crypto';
import type { Identity } from '../services/crypto';
import { WrongPasswordError, NoIdentity, IdentityAlreadyExistError } from '../utils.ts/Errors';


export const useIdentityStore = defineStore('identity', () => {
  // --- State ---
  const identity = ref<Identity>({  signPub: new Uint8Array(0),
  signPriv:new Uint8Array(0),
  dhPub: new Uint8Array(0),
  dhPriv:new Uint8Array(0),});

  async function generateKeys(){
    console.log("gen1");
    const already = alreadHasKeys();
    if(isFalsyUint8Array(identity.value.signPub) && !already){
        console.log("gen2");
        const id : Identity = await generateIdentity();
        console.log(id);
        console.log("gen3");
        identity.value = id;
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
        } else if (e instanceof Error) {
            alert(e.message  + " " + e.name);
        } else {
            alert("Une erreur inattendue est survenue");
        }
    }
}

  function getKeysLocal(){
    let password = prompt("entrez votre mot de passe pour récupérer");
    password = password || "123"

    try{
        identity.value = loadIdentityFromLocalStorage(password);
    }catch(e){
        if (e instanceof IdentityAlreadyExistError) {
            alert(e.message);
        } else if (e instanceof WrongPasswordError) {
            alert(e.message);
        } else if (e instanceof Error) {
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