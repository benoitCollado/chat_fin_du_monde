// Tu remplaceras par des appels réels avec fetch ou axios
export async function loginUser(username: string, password: string) {

      const res = await fetch("http://localhost:8000/auth/login", {
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
    const res = await fetch("http://localhost:8000/auth/register", {
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
