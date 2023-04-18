import React, { useEffect } from 'react';

import { clusterApiUrl, Connection, PublicKey, Keypair } from '@solana/web3.js';
import { Provider, Program } from '@project-serum/anchor';

import { useAnchorWallet } from '@solana/wallet-adapter-react';
import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';

import idl from './updatedStakingThree.json';

const Main = () => {
  const preflightCommitment = 'processed';
  const connectionConfig = {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
  };
  const programID = new PublicKey(idl.metadata.address);

  // const devnet = clusterApiUrl('devnet');
  const mainnet = clusterApiUrl('mainnet-beta');
  const network = mainnet;

  const wallet = useAnchorWallet();
  // @ts-ignore
  const connection = new Connection(network, connectionConfig);
  // @ts-ignore
  const provider = new Provider(connection, wallet, preflightCommitment);
  // @ts-ignore
  const program = new Program(idl, programID, provider);

  /******************************/
  /* Set the User's Wallet here */
  const userPkString = '8j4BgThNpMsfWodBhMGCDoZBEms9Lq8ypNtTuKQcyhuL';
  const userPk = new PublicKey(userPkString);

  /**************/
  /* MAGAI Coin */
  const rewardMint = 'MAGf4MnUUkkAUUdiYbNFcDnE4EBGHJYLk9foJ2ae7BV';
  const rewardMintPk = new PublicKey(rewardMint);

  /***********************************/
  /* Set the User's NFT address here */
  const tokenMint = '2345';

  /************************************/
  /* Formats time i.e. unstaking date */
  //@ts-ignore
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear().toString().slice(2);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    // const seconds = '0' + date.getSeconds();

    const formattedTime = `${month}/${day}/${year} ${
      hours > 12 ? hours - 12 : hours
    }:${minutes < 10 ? '0' + minutes : minutes}${hours > 12 ? 'PM' : 'AM'}`;

    return formattedTime;
  };

  useEffect(() => {
    if (wallet) {
      const getInfo = async () => {
        console.log('wallet: ', wallet);
        console.log('program:', program);
        const _allVault = await program.account.stakeAccount.all();
        const accounts = _allVault.filter(
          //@ts-ignore
          (vault) =>
            vault.account.stakingTokenOwner.toString() ===
            userPkString.toString()
        );
        console.log('all user staking accounts:');
        console.log(accounts);
        accounts.forEach((account, index) => {
          console.log(`staking account ${index + 1}`);
          console.log('account PK: ', account.publicKey.toString());
          console.log('full account object:');
          console.log(account);
          console.log(
            'Owner Staking Token ATA: ',
            account.account.ownerStakingTokenAccount.toString()
          );
          console.log(
            'Owner Wallet: ',
            account.account.stakingTokenOwner.toString()
          );
          console.log('Mint: ', account.account.stakingMint.toString());
          console.log('Unstake Date', account.account.unstakeDate.toString());
          console.log(
            'Unstake Formatted Date',
            formatTime(account.account.unstakeDate.toString())
          );
          console.log(
            'Created Formatted Date',
            formatTime(account.account.created.toString())
          );
          const now = Math.floor(new Date().getTime() / 1000);
          console.log('Current Timestamp', now);
          console.log(
            'Token ready to Unstake: ',
            now > account.account.unstakeDate
          );
          console.log(
            'Token Reward Collected: ',
            account.account.rewardCollected
          );
        });
      };
      getInfo();
    }
  }, [wallet]);

  return (
    <div>
      <h1>Troubleshoot</h1>
      <div className='multi-wrapper'>
        <div className='button-wrapper'>
          <WalletModalProvider>
            <WalletMultiButton />
          </WalletModalProvider>
        </div>
      </div>
    </div>
  );
};

export default Main;
