import { ContractAbstraction, Wallet } from '@taquito/taquito';

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

export default {
  getStorage,
  sendMint,
};
