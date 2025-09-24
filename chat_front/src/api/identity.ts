import type { Identity } from "../services/crypto";
import { useAuthStore } from "../store/auth"
import { encodeBase64, decodeBase64 } from "tweetnacl-util";

export function PutPublicKey(signPub:Uint8Array, dhPub: Uint8Array){
    const auth = useAuthStore();
    const res = fetch("http://localhost:8000//users/me/public_key", {
        method:"post",
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
}