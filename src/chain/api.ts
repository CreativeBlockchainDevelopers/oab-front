import { ContractAbstraction, Wallet } from '@taquito/taquito';
import axios from 'axios';

async function getStorage(contract: ContractAbstraction<Wallet>): Promise<any> {
  return contract.storage();
}

async function sendMint(
  contract: ContractAbstraction<Wallet>,
  tokenPrice: number,
  amount = 1,
): Promise<void> {
  console.log('Sending...');
  const op = await contract.methods.mint(amount).send({
    amount: tokenPrice * amount,
    mutez: true,
  });
  console.log('Waiting for confirmation...');
  await op.confirmation();
}

async function requestUris(uris: string[]): Promise<any> {
  return Promise.all(uris.map(async (uri) => (await axios.get(uri)).data));
}

export default {
  getStorage,
  sendMint,
  requestUris,
};
