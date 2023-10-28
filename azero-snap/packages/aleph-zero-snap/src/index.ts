import { KeyPairFactory } from './account';
import { ethErrors } from 'eth-rpc-errors';
import { RpcMethod, RpcParams } from 'snap-adapter';

import * as handlers from './handlers';
import { SnapState } from './state';
import { Bip44Node } from './types';
import { SubstrateApi } from './substrate-api';

let entropy: Bip44Node;
let state: SnapState;
let api: SubstrateApi;

type RequestObject = { method: RpcMethod; params: RpcParams };

wallet.registerRpcMessageHandler(async (originString: string, { method, params }: RequestObject) => {
  if (!entropy) {
    entropy = await wallet.request({
      method: `snap_getBip44Entropy_${KeyPairFactory.COIN_TYPE}`, // Ethereum BIP44 node 
    });
  }

  if (!api) {
    api = new SubstrateApi();
    await api.init();
  }

  state = await SnapState.fromPersisted(entropy);

  switch (method) {
    case "isEnabled":
      return handlers.isEnabled();

    case "getAccountFromSeed":
      return await handlers.getAccountFromSeed(state, params);

    case "generateNewAccount":
      return await handlers.generateAccount(state, entropy);

    case "signTransaction":
      return await handlers.signTransaction(state, params, api);

    case "getAccounts":
      return await handlers.getAccounts(state)

    default:
      throw ethErrors.rpc.methodNotFound({ data: { request: { method, params } } });
  }
});
