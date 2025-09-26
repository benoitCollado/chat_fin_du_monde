import { useAuthStore } from "../store/auth";
import { url } from "../variables/variables";

export async function postMessage(room:string, message:string){
    const auth = useAuthStore();
    console.log(message);
    const res = await fetch(url+`rooms/${room}/messages`,{
        method: "POST",
        headers:{
            "Authorization": "Bearer "+ auth.access_token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            content: message
        })
    });
    if(!res.ok){
        throw new Error("impossible de poster le message");
    }

    return res.status;
}

export async function postOpenDM(peer_id:number){
    const auth = useAuthStore();
    const res = await fetch(url+`dm/open`,{
        method: "POST",
        headers:{
            "Authorization": "Bearer "+ auth.access_token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            peer_id: peer_id
        })
    });
    if(!res.ok){
        throw new Error("impossible de poster le message");
    }

    const data = await res.json()
    return data.room_id;
}

export async function getMessage(room:string){
    const auth = useAuthStore();
    const res = await fetch(url+`rooms/${room}/messages`,{
        method: "GET",
        headers:{
            "Authorization": "Bearer "+ auth.access_token,
            "Content-Type": "application/json",
        },
    });
    if(!res.ok){
        throw new Error("impossible de récupérer les message");
    }
    const data = await res.json();
    return data;
}

export async function getMyRooms(){
    const auth = useAuthStore();
    const res = await fetch(url+`rooms/my-rooms`,{
        method: "GET",
        headers:{
            "Authorization": "Bearer "+ auth.access_token,
            "Content-Type": "application/json",
        },
    });
    if(!res.ok){
        throw new Error("impossible de récupérer les message");
    }
    const data = await res.json();
    return data;
}