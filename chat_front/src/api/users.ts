import { useAuthStore } from "../store/auth"



export async function getUsersAPI(){
    const auth = useAuthStore();
    const res = await fetch("http://localhost:8000/users", {
        method:"GET",
        headers:{
            "Authorization": "Bearer "+ auth.access_token,
            "Content-Type": "application/json",
        }
    });
    if (!res.ok){
        throw new Error("un problème est survenu")
    }
    const data = await res.json();

    return data;
}