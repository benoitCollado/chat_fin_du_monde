/** =========================
 *  Base64url (navigateur)
 *  ========================= */
export declare const b64u: {
    enc: (u8: Uint8Array) => string;
    dec: (s: string) => Uint8Array<ArrayBuffer>;
};
export declare function eccEncode(bytes: Uint8Array): Uint8Array;
export declare function eccDecode(bytes: Uint8Array): Uint8Array;
/** =========================
 *  Identité & Payload
 *  ========================= */
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
    aad?: string | undefined;
    ct: string;
}
export declare function generateIdentity(): Promise<Identity>;
/** =========================
 *  Chiffrement (avec ECC après)
 *  ========================= */
export declare function encryptForRecipient(plaintext: Uint8Array, recipientDhPub_b64u: string, senderSignPriv_b64u: string, aad?: Uint8Array): Promise<WirePayload>;
/** =========================
 *  Déchiffrement (avec ECC avant)
 *  ========================= */
export declare function decryptFromSender(payload: WirePayload, senderSignPub_b64u: string, myDhPriv_b64u: string): Promise<Uint8Array>;
//# sourceMappingURL=crypt_lib.d.ts.map