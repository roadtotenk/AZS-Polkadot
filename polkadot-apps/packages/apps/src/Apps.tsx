// Copyright 2017-2022 @polkadot/apps authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BareProps as Props, ThemeDef } from '@polkadot/react-components/types';
import { keyring } from '@polkadot/ui-keyring';

import React, { useContext, useEffect, useMemo, useState } from 'react';
import styled, { ThemeContext } from 'styled-components';

import AccountSidebar from '@polkadot/app-accounts/Sidebar';
import { getSystemColor } from '@polkadot/apps-config';
import GlobalStyle from '@polkadot/react-components/styles';
import { useApi } from '@polkadot/react-hooks';
import Signer from '@polkadot/react-signer';

import * as snap from "snap-adapter";

import ConnectingOverlay from './overlays/Connecting';
import Content from './Content';
import Menu from './Menu';
import WarmUp from './WarmUp';

export const PORTAL_ID = 'portals';

function Apps({ className = '' }: Props): React.ReactElement<Props> {
  const { theme } = useContext(ThemeContext as React.Context<ThemeDef>);
  const { isDevelopment, specName, systemChain, systemName } = useApi();


  const [snapConnected, setSnapConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seed, setSeed] = useState("");

  const uiHighlight = useMemo(
    () => isDevelopment
      ? undefined
      : getSystemColor(systemChain, systemName, specName),
    [isDevelopment, specName, systemChain, systemName]
  );

  useEffect(() => {
    const connectSnap = async () => {
      const isEnabled =  (await snap.getAccounts()).length > 0;
      setLoading(isEnabled);
      setSnapConnected(isEnabled);
    }
    connectSnap().catch(console.error);
  }, []);

  const doConnectSnap = async () => {
    setLoading(true);
    setSnapConnected(false);
    try {
      await snap.connect();
      setSnapConnected(true);
      let accounts = await snap.getAccounts();

      if (accounts.length < 1) {
          if(seed === "") {
            const account = await snap.generateNewAccount();
            keyring.addExternal(account.address);
            
          } else {
            const account = await snap.getAccountFromSeed(seed);
            keyring.addExternal(account.address);
          }
        }


    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <>
      <GlobalStyle uiHighlight={uiHighlight} />
      <div className={`apps--Wrapper theme--${theme} ${className}`}>
        {!snapConnected && (
          <>
            <h1>Connect and install snap</h1>
            <p>
              New Aleph Zero account will be automatically created from your MetaMask private key.
            </p>
            <p>
              Please take a not of snap permission, that you will be asked for.
            </p>
            <p>
              Note: We recommend using a throw-away MetaMask account.
            </p>
            <p>
              This demo uses MetaMask flask (canary release). In order to use it, please follow installation instructions in readme: https://github.com/roadtotenk/azs/tree/docs#installing-metamask-flask.
            </p>
            {loading && <p>Loading...</p>}
              {!loading &&
              <div>
              <div>
                <input height={"40px"} placeholder={'seed in hex (optional)'} onChange={(e) => setSeed(e.target.value)}></input>
              </div>
              <div>
              <button
                disabled={snapConnected}
                onClick={doConnectSnap}
              >
                Create account
              </button>
              </div>
              </div>}
          </>
        )}
        {snapConnected && (
          <>                  <Menu />
            <AccountSidebar>
              <Signer>
                <Content />
              </Signer>
              <ConnectingOverlay />
              <div id={PORTAL_ID} />
            </AccountSidebar>
          </>

        )}
      </div>
      <WarmUp />
    </>
  );
}

export default React.memo(styled(Apps)`
  background: var(--bg-page);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  .--hidden {
    display: none;
  }
`);
