import { Contract } from 'web3-eth-contract';

async function getPrice(contract: Contract): Promise<bigint> {
  return new Promise((resolve, reject) => {
    contract.methods.PRICE().call({}, "latest", (error: any, data: string) => {
      if (error) {
        reject(error);
      }
      resolve(BigInt(data));
    });
  });
}

async function getMaxTokens(contract: Contract): Promise<number> {
  return new Promise((resolve, reject) => {
    contract.methods.MAX_TOKENS().call({}, "latest", (error: any, data: string) => {
      if (error) {
        reject(error);
      }
      resolve(Number(data));
    });
  });
}

async function getTotalSupply(contract: Contract): Promise<number> {
  return new Promise((resolve, reject) => {
    contract.methods.totalSupply().call({}, "latest", (error: any, data: string) => {
      if (error) {
        reject(error);
      }
      resolve(Number(data));
    });
  });
}

async function getSaleState(contract: Contract): Promise<boolean> {
  return new Promise((resolve, reject) => {
    contract.methods.saleIsActive().call({}, "latest", (error: any, data: string) => {
      if (error) {
        reject(error);
      }
      resolve(Boolean(data));
    });
  });
}

async function sendMint(contract: Contract, tokenPrice: bigint, amount = 1): Promise<string> {
  const n = BigInt(amount);
  return new Promise((resolve, reject) => {
    if (contract === null) {
      return reject();
    }
    contract.methods.mint(n).send({
      value: (n * tokenPrice).toString(),
    }, (error: any, data: string) => {
      if (error) {
        reject(error);
      }
      resolve(String(data));
    });
  });
}

export default {
    getPrice,
    getMaxTokens,
    getTotalSupply,
    getSaleState,
    sendMint,
}
