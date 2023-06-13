import { useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/modal";
import { WALLET_ADAPTERS, CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import { CUSTOM_LOGIN_PROVIDER_TYPE, ColorPalette, OpenloginAdapter, OpenloginUserInfo } from "@web3auth/openlogin-adapter";
import { TorusWalletConnectorPlugin } from "@web3auth/torus-wallet-connector-plugin";
import RPC from "./ethersRPC";
import "./App.css";
import logo from "./logo.svg"
import { CoinbaseAdapter } from "@web3auth/coinbase-adapter";
import { TorusWalletAdapter } from "@web3auth/torus-evm-adapter";

const clientId = "BNX8_CA7UJ4znVaCpZtf4RvTm80Dugw8fjZ73s1QdlvATjHdNFDYEi-uoIH_mQeEgNNqmF_Eda06xCMIM_3fDwA"; // get from https://dashboard.web3auth.io

function App() {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);
  const [torusPlugin, setTorusPlugin] = useState<TorusWalletConnectorPlugin | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3Auth({
          clientId,
          web3AuthNetwork: "mainnet",
          storageKey:"local", // mainnet, aqua, celeste, cyan or testnet
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            displayName: "Sepolia",
            chainId: "0xaa36a7",
            rpcTarget: "https://eth-sepolia.public.blastapi.io",
            blockExplorer: "https://goerli-optimism.etherscan.io/"// This is the public RPC we have added, please pass on your own endpoint while creating an app
          },
          uiConfig: {
            theme: "dark",
            loginMethodsOrder: ["google", "twitter", "discord", "facebook", "reddit", "twitch", "apple", "line", "github", "kakao", "linkedin", "weibo", "wechat", "email_passwordless"],
            appLogo: "https://svgshare.com/i/u7L.svg", // Your App Logo Here
          },
          authMode: "DAPP",
        });

        const openloginAdapter = new OpenloginAdapter({
          clientId,
          web3AuthNetwork: "mainnet", // mainnet, aqua, celeste, cyan or testnet
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            displayName: "Sepolia",
            chainId: "0xaa36a7",
            rpcTarget: "https://eth-sepolia.public.blastapi.io",
            blockExplorer: "https://goerli-optimism.etherscan.io/"// This is the public RPC we have added, please pass on your own endpoint while creating an app
          },
          adapterSettings: {
            whiteLabel: {
              name: "FXDX",
              logoDark: "https://svgshare.com/i/u7L.svg",
              logoLight: "https://svgshare.com/i/u7L.svg",
              dark: true

            }
          }
        });

        const coinbaseAdapter = new CoinbaseAdapter({
          sessionTime: 3600, // 1 hour in seconds
          web3AuthNetwork: "mainnet", // mainnet, aqua, celeste, cyan or testnet
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            displayName: "Sepolia",
            chainId: "0xaa36a7",
            rpcTarget: "https://eth-sepolia.public.blastapi.io",
            blockExplorer: "https://goerli-optimism.etherscan.io/"// This is the public RPC we have added, please pass on your own endpoint while creating an app
          },
        });

        web3auth.configureAdapter(openloginAdapter);
        web3auth.configureAdapter(coinbaseAdapter);
        setWeb3auth(web3auth);

        await web3auth.initModal({

        });

        // if (web3auth.provider) {
        //   setProvider(web3auth.provider);
        // };

      } catch (error) {
        console.error(error);
      }
    };
    init();
  }, []);

  useEffect(() => {

    const initTorusWallet = async () => {
      console.log("Torus init called")
      if (web3auth && !torusPlugin) {
        const torusPlugin = new TorusWalletConnectorPlugin({
          torusWalletOpts: {
            buttonPosition:"top-right"
          },
          walletInitOptions: {
            whiteLabel: {
              theme: { isDark: true, colors: { primary: "#00a8ff" } },
              logoDark: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
              logoLight: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
            },
          }
        });
         
        const torusWalletAdapter=new TorusWalletAdapter({
          clientId:clientId,
          web3AuthNetwork:"mainnet",
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            displayName: "Sepolia",
            chainId: "0xaa36a7",
            rpcTarget: "https://eth-sepolia.public.blastapi.io",
            blockExplorer: "https://goerli-optimism.etherscan.io/"// This is the public RPC we have added, please pass on your own endpoint while creating an app
          },
        })
        web3auth.configureAdapter(torusWalletAdapter);
        setTorusPlugin(torusPlugin);
        await web3auth.addPlugin(torusPlugin);
        setProvider((torusPlugin?.proxyProvider as SafeEventEmitterProvider) || web3auth?.provider);
      }
    }
    initTorusWallet();
  }, [web3auth])


  const login = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);
  };

  const authenticateUser = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const idToken = await web3auth.authenticateUser();
    uiConsole(idToken);
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    uiConsole(user);
  };

  const logout = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
  };

  const getChainId = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const chainId = await rpc.getChainId();
    uiConsole(chainId);
  };
  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const address = await rpc.getAccounts();
    uiConsole(address);
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getBalance();
    uiConsole(balance);
  };

  const sendTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const receipt = await rpc.sendTransaction();
    uiConsole(receipt);
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const signedMessage = await rpc.signMessage();
    uiConsole(signedMessage);
  };

  const getPrivateKey = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const privateKey = await rpc.getPrivateKey();
    uiConsole(privateKey);
  };

  const showWCM = async () => {
    if (!torusPlugin) {
      uiConsole("torus plugin not initialized yet");
      return;
    }
    torusPlugin.showWalletConnectScanner();
    uiConsole();
  };

  const initiateTopUp = async () => {
    try {
      if (!provider) {
        uiConsole("provider not initialized yet");
        return;
      }
      const rpc = new RPC(provider);
      const user_address = await rpc.getAccounts();
      console.log(user_address)
      if (!torusPlugin) {
        uiConsole("torus plugin not initialized yet");
        return;
      }
      // let user_info=await web3auth?.getUserInfo();
      // console.log(user_info)
      // let new_user_info:OpenloginUserInfo={
      //   email:user_info?.email,
      //   name:user_info?.name,
      //   profileImage: user_info?.profileImage,
      //   aggregateVerifier:user_info?.aggregateVerifier,
      //   verifier:user_info?.verifier||"",
      //   verifierId: user_info?.verifierId||"",
      //   typeOfLogin: user_info?.typeOfLogin||"",
      //   dappShare:user_info?.dappShare
      // }

      // torusPlugin.initWithProvider(provider,new_user_info);

      torusPlugin.initiateTopup("moonpay", {
        selectedAddress: user_address,
        selectedCurrency: "USD", // Fiat currency
        fiatValue: 100, // Fiat Value
        selectedCryptoCurrency: "ETH", // Cryptocurreny `SOL`, `MATIC` etc.
        chainNetwork:"optimism_mainnet", // Blockchain network
      }  );
      

    }
    catch (e) {
            console.log(e);
    }
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }

  const loggedInView = (
    <>
      <div className="flex-container">
        <div>
          <button onClick={getUserInfo} className="card">
            Get User Info
          </button>
        </div>
        <div>
          <button onClick={authenticateUser} className="card">
            Get ID Token
          </button>
        </div>
        <div>
          <button onClick={getChainId} className="card">
            Get Chain ID
          </button>
        </div>
        <div>
          <button onClick={getAccounts} className="card">
            Get Accounts
          </button>
        </div>
        <div>
          <button onClick={getBalance} className="card">
            Get Balance
          </button>
        </div>
        <div>
          <button onClick={signMessage} className="card">
            Sign Message
          </button>
        </div>
        <div>
          <button onClick={sendTransaction} className="card">
            Send Transaction
          </button>
        </div>
        <div>
          <button onClick={getPrivateKey} className="card">
            Get Private Key
          </button>
        </div>
        <div>
          <button onClick={logout} className="card">
            Log Out
          </button>
        </div>
        {/* <div>
          <button onClick={initiateTopUp} className="card">
            TopUp
          </button>
        </div> */}
      </div>

      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}>Logged in Successfully!</p>
      </div>
    </>
  );

  const unloggedInView = (
    <button onClick={login} className="card">
      Login
    </button>
  );

  return (
    <div className="container">

      <div className="grid">{provider ? loggedInView : unloggedInView}</div>

      <footer className="footer">
      </footer>
    </div>
  );
}

export default App;