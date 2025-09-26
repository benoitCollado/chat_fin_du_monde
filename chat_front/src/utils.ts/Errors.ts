export class IdentityAlreadyExistError extends Error {
  constructor(message = "Identity already exists") {
    super(message);
    this.name = "IdentityAlreadyExistError";
  }
}

export class WrongPasswordError extends Error {
  constructor(message = "Wrong password") {
    super(message);
    this.name = "WrongPasswordError";
  }
}

export class NoIdentity extends Error {
  constructor(message = "No identity on local storage") {
    super(message);
    this.name = "NoIdentity";
  }
}

export class NoPublicKeyOnServer extends Error {
  constructor(message = "No public key found on server") {
    super(message);
    this.name = "NoPublicKeyOnServer";
  }
}