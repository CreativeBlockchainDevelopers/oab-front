import { ContractAbstraction, Wallet } from '@taquito/taquito';

async function getStorage(contract: ContractAbstraction<Wallet>): Promise<any> {
  return contract.storage();
}

async function sendMint(
  contract: ContractAbstraction<Wallet>,
  amount = 1,
): Promise<void> {
  console.log('Sending...');
  const op = await contract.methods.mint(amount).send();
  console.log('Waiting for confirmation...');
  await op.confirmation();
}

export default {
  getStorage,
  sendMint,
};
