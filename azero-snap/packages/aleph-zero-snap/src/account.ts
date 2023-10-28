
import { ApiPromise, Keyring } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import { SignerPayloadJSON } from "@polkadot/types/types";
import { hexToU8a, stringToU8a, u8aToHex } from '@polkadot/util';
import { ethErrors } from 'eth-rpc-errors';
import { SnapState } from 'state';
import { SubstrateApi } from 'substrate-api';
import { Bip44Node } from './types';

export type PayloadToSign = SignerPayloadJSON;

export interface PrivateAccount extends PublicAccount {
    seed: string;
}

export interface PublicAccount {
    address: string;
    // hex value
    publicKey: string;
}

export const persistAccount = async (pair: PrivateAccount, state: SnapState) => {
    const newWalletState = state.wallet.importAccount(pair);
    await state.setState(newWalletState);
}

export const recoverAccount = async (state: SnapState, seed: string): Promise<PublicAccount> => {
    const pair = KeyPairFactory.fromSeed(hexToU8a(seed));

    const publicAccount: PublicAccount = { address: pair.address, publicKey: u8aToHex(pair.publicKey) };

    await persistAccount({ ...publicAccount, seed }, state);

    return publicAccount;
}

export const generateAccountFromEntropy = async (state: SnapState, bip44Node: Bip44Node): Promise<PublicAccount> => {
    // generate keys
    const seed = bip44Node.key.slice(0, 32);
    const binSeed = stringToU8a(seed);

    const pair = KeyPairFactory.fromSeed(binSeed);

    const publicAccount: PublicAccount = { address: pair.address, publicKey: u8aToHex(pair.publicKey) };

    await persistAccount({ ...publicAccount, seed: u8aToHex(binSeed) }, state);

    return publicAccount;
}

export const signTx = async (state: SnapState, transaction: PayloadToSign, api: SubstrateApi) => {
    const accounts = Object.values(state.wallet.accountMap);
    if (accounts.length < 1) {
        throw ethErrors.rpc.resourceNotFound("No default account to sign transaction with");
    }

    const account = accounts[0];
    const keyPair = KeyPairFactory.fromSeed(hexToU8a(account.seed));

    const toSign = api.createTxPayload(transaction);

    return toSign.sign(keyPair);
}


export class KeyPairFactory {

    //TODO: ask guys from aleph or check on ui
    static SS58FORMAT = 42; // default
    static COIN_TYPE = 434; // kusama


    static fromSeed(seed: Uint8Array): KeyringPair {
        const keyring = new Keyring({ ss58Format: KeyPairFactory.SS58FORMAT, type: "sr25519" });
        return keyring.addFromSeed(seed);
    }
}

