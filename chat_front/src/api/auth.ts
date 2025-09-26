import { useAuthStore } from "../store/auth";
import {url} from "../variables/variables";

export async function loginUser(username: string, password: string) {

      const res = await fetch(url+"auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: username, password: password }),
        })

    if(!res.ok){
        throw new Error("Echec de la connexion");
    }

    const data = await res.json();
    const now = new Date();
    now.setMinutes(now.getMinutes() + data.expires_in)
    return {
        access_token : data.access_token,
        expiresAt: now.getTime()
    }
}

export async function registerUser(username: string, password:string){
    const res = await fetch(url+"auth/register", {
        method:"POST",
         headers: {
            "Content-Type": "application/json" // ✅ indique que c'est du JSON
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })

    if(!res.ok){
        throw new Error("Echec de la connexion");
    }

    return {
        status: res.status
    }
}

export async function getMyInfo(){
     const auth = useAuthStore();
    const res = await fetch(url+"auth/me", {
        method:"GET",
         headers: {
            "Authorization": "Bearer "+ auth.access_token,
            "Content-Type": "application/json" 
        }
    });

    if(!res.ok){
        throw new Error("Echec de la connexion");



        
    }

    return await res.json();
}
