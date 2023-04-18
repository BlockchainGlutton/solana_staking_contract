import { PublicKey } from '@solana/web3.js';
import idl from '../updatedStakingThree.json';

export const preflightCommitment = 'processed';
export const connectionConfig = {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000,
};
export const programID = new PublicKey(idl.metadata.address);
