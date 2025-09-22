## Registre

````bash
  http://0.0.0.0:8000/auth/register

JSON : {"username": "alice", "password": "s3cret"}
````

## Authentication 
````bash
  http://localhost:8000/auth/login

JSON : {"username": "alice", "password": "s3cret"}
JSON : {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbGljZSIsInZlciI6MCwianRpIjoiYWE2NzkyMWYtOTc5NS00YjIwLWJkNmQtZDFmNGFhN2E2N2IxIiwiaWF0IjoxNzU4NTQzODQ4LCJleHAiOjE3NTg1NDQ3NDh9.NkrmgYX80Qboxh2TwgMH6srWjJmWpIuMo6Y__FpGQ50",
    "token_type": "bearer",
    "expires_in": 15
}
````

## Me
````bash
  http://localhost:8000/auth/me
  
Autorization Bearer Token

JSON : {"username": "alice", "password": "s3cret"}
````

## Messages
````bash
  http://localhost:8000/rooms/local/messages
  
Autorization Bearer Token

BODY JSON : {"content":"hi"}
````


