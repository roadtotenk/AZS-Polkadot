// Copyright 2017-2022 @polkadot/react-signer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Signer, SignerResult } from '@polkadot/api/types';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { Registry, SignerPayloadJSON } from '@polkadot/types/types';
import * as snap from "snap-adapter";

import { objectSpread } from '@polkadot/util';

import { lockAccount } from '../util';

let id = 0;

export default class AccountSigner implements Signer {
  readonly #keyringPair: KeyringPair;
  readonly #registry: Registry;

  constructor (registry: Registry, keyringPair: KeyringPair) {
    this.#keyringPair = keyringPair;
    this.#registry = registry;
  }

  public async signPayload (payload: SignerPayloadJSON): Promise<SignerResult> {
    const signed = await snap.signTransaction(payload);

    return new Promise((resolve): void => {
      lockAccount(this.#keyringPair);
      resolve(
        objectSpread({ id: ++id }, signed)
      );
    });
  }
}
