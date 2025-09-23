export interface Identity {
    signPub: Uint8Array;
    signPriv: Uint8Array;
    dhPub: Uint8Array;
    dhPriv: Uint8Array;
}
export interface WirePayload {
    eph_pub: string;
    sig: string;
    nonce: string;
    ct: string;
}
export declare function generateIdentity(): Identity;
export declare function encryptForRecipient(plaintext: string, recipientDhPub_b64: string, senderSignPriv_b64: string): WirePayload;
export declare function decryptFromSender(payload: WirePayload, senderSignPub_b64: string, myDhPriv_b64: string): string;
export declare const serializeIdentity: (id: Identity) => {
    signPub: string;
    signPriv: string;
    dhPub: string;
    dhPriv: string;
};
//# sourceMappingURL=crypt_lib.d.ts.map