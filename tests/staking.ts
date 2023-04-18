import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Staking } from '../target/types/staking';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getMint,
  getAccount,
  createAssociatedTokenAccount,
  createCloseAccountInstruction,
  closeAccount,
} from '@solana/spl-token';
import { assert } from 'chai';

import {
  ownerWalletKeypair,
  payerKeypair, // Call this something better - attacker, etc
  rewardMintAuthorityKeypair,
} from './utils/users';

describe('staking', () => {
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Staking as Program<Staking>;

  /******************************/
  /* Set the User's Wallet here */
  // const userPkString = '79knEfWvQL5KWSVQvTbWHBhJMX2T1uZBP1WY2zSwnurR';

  // const userPk = new PublicKey(userPkString);

  /****************/
  /* Reward Mints */
  /****************/
  /* Tomek Wallet */
  /****************/
  // const rewardMint = '5wwzrurTXDNHDDrHw2PS78Ev38Hd9f7askUeVzDsnnQ7';
  /****************/
  /* MAGAI Devnet */
  /****************/
  const rewardMint = 'CoLyPNKkZvFhNMeh9BT3ELGj7dgk3MS234AWXPoFYemZ';
  /*****************/
  /* MAGAI Mainnet */
  /*****************/
  // const rewardMint = 'MAGf4MnUUkkAUUdiYbNFcDnE4EBGHJYLk9foJ2ae7BV';
  const rewardMintPk = new PublicKey(rewardMint);

  console.log('rewardMintPk', rewardMintPk);

  /* Used in Contract Testing Suite */
  const initializerMainAccount = ownerWalletKeypair;

  /***********************************/
  /* Set the User's NFT address here */
  const tokenMintKey = new PublicKey(
    '4y9Mr1wgjzg4Yxiy12aszPoSguq9Q5TPpEnyT7FaVvfC'
  );

  /* If searching for a known ATA, set the address here */
  // const ataPubkey = new PublicKey(
  //   '4JHm2oCnPqTCadUPDpc67pAoKpNcdHAGEKpMWkTM4Lv4'
  // );

  /* Used in Contract Testing Suite */
  let token;
  let rewardTokenAccount;

  /* Used if need to format a returned timestamp */
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear().toString().slice(2);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = '0' + date.getSeconds();

    const formattedTime = `${month}/${day}/${year} ${
      hours > 12 ? hours - 12 : hours
    }:${minutes < 10 ? '0' + minutes : minutes}${hours > 12 ? 'PM' : 'AM'}`;

    return formattedTime;
  };

  /**********************************************************************************/
  /**********************************************************************************/
  /**********************************************************************************/
  /**********************************************************************************/
  /**********************************************************************************/
  /**********************************************************************************/
  /**** The following tools that can be used tpo resolve certain staking issues *****/
  /**********************************************************************************/
  /**********************************************************************************/
  /**********************************************************************************/
  /**********************************************************************************/
  /**********************************************************************************/
  /**********************************************************************************/

  /**********************************************************************************/
  /* This function can be used in the case where a token account needs to be closed */
  /**********************************************************************************/
  // it('Closes a token account', async () => {
  // let tx = await new Transaction().add(
  //   createCloseAccountInstruction(
  //     ataPubkey, // token account which you want to close
  //     userPk, // destination
  //     userPk // owner of token account
  //   )
  // );
  // tx.feePayer = await rewardMintAuthorityKeypair;
  // const blockhashObj = await provider.connection.getRecentBlockhash();
  // tx.recentBlockhash = await blockhashObj.blockhash;
  // const signedTransaction2 = await provider.wallet.signTransaction(toTx);
  // const test = signedTransaction2.serialize();
  // const transactionId2 = await provider.connection.sendRawTransaction(test);
  // console.log(tx);
  // });

  /**********************************************************************************/
  /**** This function can be used to look up a specific EXISTING token account  *****/
  /**********************************************************************************/

  // it('Looks up and prints information about an existing ATA for an NFT or reward token', async () => {
  //   const tokenATA = (
  //     await provider.connection.getParsedTokenAccountsByOwner(
  //       userPk as PublicKey,
  //       {
  //         mint: tokenMintKey as PublicKey,
  //       }
  //     )
  //   ).value;

  //   console.log(tokenATA[0]);
  //   console.log(tokenATA[0].pubkey.toString());
  //   console.log(tokenATA[0].account.owner);
  //   console.log(tokenATA[0].account.data);
  //   console.log(tokenATA[0].account.data.parsed.info.tokenAmount);

  //   const rewardATA = (
  //     await provider.connection.getParsedTokenAccountsByOwner(
  //       userPk as PublicKey,
  //       {
  //         mint: rewardMintPk as PublicKey,
  //       }
  //     )
  //   ).value;

  //   console.log(rewardATA);
  //   console.log(rewardATA[0].pubkey.toString());
  //   console.log(rewardATA[0].account.owner);
  //   console.log(rewardATA[0].account.data);
  //   console.log(rewardATA[0].account.data.parsed.info.tokenAmount);
  // });

  /**********************************************************************************/
  /*** This function can be used to create a token account for an NFT or currency ***/
  /**********************************************************************************/

  // it('Creates a token account for a given NFT or Reward Token', async () => {
  // let rewardAta = await createAssociatedTokenAccount(
  //   provider.connection, // connection
  //   rewardMintAuthorityKeypair, // fee payer
  //   rewardMintPk, // mint
  //   userPk // owner,
  // );
  // console.log(rewardAta);
  //
  // let magAta = await createAssociatedTokenAccount(
  //   provider.connection, // connection
  //   rewardMintAuthorityKeypair, // fee payer
  //   tokenMintKey, // mint
  //   userPk // owner,
  // );
  // console.log(magAta);
  // });

  /**********************************************************************************/
  /**********************************************************************************/
  /**********************************************************************************/
  /**********************************************************************************/
  /**********************************************************************************/
  /**********************************************************************************/
  /*** This is the beginning of the actual Testing Suite for the Staking Contract ***/
  /**********************************************************************************/
  /**********************************************************************************/
  /**********************************************************************************/
  /**********************************************************************************/
  /**********************************************************************************/
  /**********************************************************************************/

  it('Sets the staking token account', async () => {
    console.log('wallet');
    console.log(initializerMainAccount.publicKey.toString());
    const stakingATA = (
      await provider.connection.getParsedTokenAccountsByOwner(
        initializerMainAccount.publicKey as PublicKey,
        {
          mint: tokenMintKey as PublicKey,
        }
      )
    ).value;
    token = stakingATA[0];
    const rewardATA = (
      await provider.connection.getParsedTokenAccountsByOwner(
        initializerMainAccount.publicKey as PublicKey,
        {
          mint: rewardMintPk as PublicKey,
        }
      )
    ).value;
    rewardTokenAccount = rewardATA[0];

    console.log('token');
    console.log(stakingATA);
    console.log(stakingATA[0].pubkey.toString());
    console.log(stakingATA[0].account.owner);
    console.log(stakingATA[0].account.data);
    console.log(stakingATA[0].account.data.parsed.info.tokenAmount);
    console.log('///////////////////////');
    console.log('reward');
    console.log(rewardATA);
    console.log(rewardATA[0].pubkey.toString());
    console.log(rewardATA[0].account.owner);
    console.log(rewardATA[0].account.data);
    console.log(rewardATA[0].account.data.parsed.info.tokenAmount);
  });

  // it('Initiates the PDA authority', async () => {
  //   const [_mint_authority_pda, _mint_authority_bump] =
  //     await PublicKey.findProgramAddress(
  //       [
  //         Buffer.from(anchor.utils.bytes.utf8.encode('authority')),
  //         rewardMintPk.toBuffer(),
  //       ],
  //       program.programId
  //     );

  //   console.log(_mint_authority_pda);
  //   console.log(_mint_authority_pda.toString());

  //   await program.rpc.initMintAuthority({
  //     accounts: {
  //       mintAuthority: _mint_authority_pda,
  //       rewardMint: rewardMintPk,
  //       admin: initializerMainAccount.publicKey,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //       rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  //     },
  //     signers: [initializerMainAccount],
  //   });
  // });

  // it('Stakes the selected token from the owner wallet', async () => {
  //   const tokenAccount = await getAccount(provider.connection, token.pubkey);
  //   console.log(tokenAccount);

  //   console.log(rewardTokenAccount);

  //   const tokenMintPk = token.account.data.parsed.info.mint;
  //   const tokenPk = new PublicKey(tokenMintPk);

  //   const stakingAccountKeypair = anchor.web3.Keypair.generate();

  // const [_vault_account_pda, _vault_account_bump] =
  //   await PublicKey.findProgramAddress(
  //     [
  //       Buffer.from(anchor.utils.bytes.utf8.encode('receipt')),
  //       stakingAccountKeypair.publicKey.toBuffer(),
  //       tokenPk.toBuffer(),
  //     ],
  //     program.programId
  //   );

  //   const vault_account_pda = _vault_account_pda;
  //   const vault_account_bump = _vault_account_bump;

  //   console.log('attempting to stake token...');

  //   await program.rpc.stake(0, true, {
  //     accounts: {
  //       stakingTokenOwner: initializerMainAccount.publicKey,
  //       stakingMint: tokenPk,
  //       vaultAccount: vault_account_pda,
  //       ownerStakingTokenAccount: tokenAccount.address,
  //       ownerRewardTokenAccount: rewardTokenAccount.pubkey,
  //       stakingAccount: stakingAccountKeypair.publicKey,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //       rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //     },
  //     signers: [stakingAccountKeypair, initializerMainAccount],
  //   });

  //   console.log('token successfuly staked!');

  //   const allStakingAccoounts = await program.account.stakeAccount.all();

  //   console.log(allStakingAccoounts);
  // });

  it('Checks the status', async () => {
    const allStakingAccoounts = await program.account.stakeAccount.all();

    console.log(allStakingAccoounts[0]);
    console.log(allStakingAccoounts[1]);
  });

  it('Collects the owed rewards before unstaking the token', async () => {
    console.log('attempting distribution...');

    let _allVault = await program.account.stakeAccount.all();
    let stakedToken = _allVault.filter(
      (token) =>
        token.account.stakingMint.toString() === tokenMintKey.toString()
    );

    console.log(stakedToken[0].account);
    console.log(stakedToken[0].account.created.toString());
    console.log(stakedToken[0].account.unstakeDate.toString());

    const [_mint_authority_pda, _mint_authority_bump] =
      await PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('authority')),
          rewardMintPk.toBuffer(),
        ],
        program.programId
      );

    console.log(_mint_authority_pda);
    console.log(_mint_authority_pda.toString());

    let retrievedRewardAta = (
      await provider.connection.getParsedTokenAccountsByOwner(
        ownerWalletKeypair.publicKey as PublicKey,
        {
          mint: rewardMintPk as PublicKey,
        }
      )
    ).value;

    console.log('rewardMintAuthorityKeypair.publicKey');
    console.log(rewardMintAuthorityKeypair.publicKey);

    const tx = await program.rpc.collect({
      accounts: {
        rewardMintAuthority: _mint_authority_pda,
        stakingTokenOwner: initializerMainAccount.publicKey,
        ownerStakingTokenAccount:
          stakedToken[0].account.ownerStakingTokenAccount,
        stakingAccount: stakedToken[0].publicKey,
        stakingMint: stakedToken[0].account.stakingMint,
        rewardMint: rewardMintPk,
        ownerRewardTokenAccount: retrievedRewardAta[0].pubkey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    });

    console.log('successfully collected rewards');
    console.log(tx);

    const allStakingAccoounts = await program.account.stakeAccount.all();

    console.log(allStakingAccoounts[0]);
    console.log(allStakingAccoounts[1]);
  });

  it('Checks the status', async () => {
    const allStakingAccoounts = await program.account.stakeAccount.all();

    console.log(allStakingAccoounts[0]);
    console.log(allStakingAccoounts[0].account.totalRewardCollected.toString());
    console.log(allStakingAccoounts[1]);
    console.log(allStakingAccoounts[1].account.totalRewardCollected.toString());
  });

  // it('V1 stakingAccount collects the owed rewards before unstaking the token', async () => {
  //   console.log('attempting distribution...');
  //   // console.log(tokenMintKey.toStirng())

  //   let _allVault = await program.account.stakeAccount.all();
  //   let selectedToken = _allVault.filter(
  //     (token) =>
  //       token.account.stakingMint.toString() ===
  //       'GJ63QQVxTCVhR92eBdow1WD8Q1r8MYkVbxztZCaJtvs5'
  //   );

  //   console.log(selectedToken);
  // console.log(selectedToken.account.stakingTokenOwner.toString());
  // console.log(selectedToken.account.stakingMint.toString());
  // console.log(selectedToken.account.unstakeDate.toString());
  // console.log(formatTime(selectedToken.account.unstakeDate.toString()));
  // const now = Math.floor(new Date().getTime() / 1000);
  // console.log(now);
  // console.log(now > parseInt(selectedToken.account.unstakeDate.toString()));

  // let retrievedRewardAta = (
  //   await provider.connection.getParsedTokenAccountsByOwner(
  //     ownerWalletKeypair.publicKey as PublicKey,
  //     {
  //       mint: rewardMintPk as PublicKey,
  //     }
  //   )
  // ).value;

  // const ATA = (
  //   await provider.connection.getParsedTokenAccountsByOwner(
  //     userPk as PublicKey,
  //     {
  //       mint: rewardMintPk as PublicKey,
  //     }
  //   )
  // ).value;

  // console.log('rewardMintAuthorityKeypair.publicKey');
  // console.log(rewardMintAuthorityKeypair.publicKey);

  // await program.rpc.collectFull({
  //   accounts: {
  //     rewardMintAuthority: rewardMintAuthorityKeypair.publicKey,
  //     // stakingTokenOwner: initializerMainAccount.publicKey,
  //     stakingTokenOwner: userPk,
  //     ownerStakingTokenAccount:
  //       selectedToken[0].account.ownerStakingTokenAccount,
  //     stakingAccount: selectedToken[0].publicKey,
  //     stakingMint: selectedToken[0].account.stakingMint,
  //     rewardMint: rewardMintPk,
  //     // ownerRewardTokenAccount: retrievedRewardAta[0].pubkey,
  //     ownerRewardTokenAccount: ATA[0].pubkey,
  //     tokenProgram: TOKEN_PROGRAM_ID,
  //   },
  // });

  //   console.log('successfully collected rewards');
  // });

  it('Unstakes a token', async () => {
    let _allVault = await program.account.stakeAccount.all();
    let stakedToken = _allVault.filter(
      (token) =>
        token.account.stakingMint.toString() === tokenMintKey.toString()
    );

    console.log(stakedToken[0].account);
    console.log(stakedToken[0].account.created.toString());
    console.log(stakedToken[0].account.unstakeDate.toString());

    console.log('attempting unstake...');

    const [_vault_account_pda, _vault_account_bump] =
      await PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('receipt')),
          stakedToken[0].publicKey.toBuffer(),
          stakedToken[0].account.stakingMint.toBuffer(),
        ],
        program.programId
      );

    const vault_account_pda = _vault_account_pda;
    const vault_account_bump = _vault_account_bump;

    const [_vault_authority_pda, _vault_authority_bump] =
      await PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode('vault')),
          stakedToken[0].publicKey.toBuffer(),
          stakedToken[0].account.stakingMint.toBuffer(),
        ],
        program.programId
      );

    const vault_authority_pda = _vault_authority_pda;

    await program.rpc.unstake({
      accounts: {
        stakingTokenOwner: initializerMainAccount.publicKey,

        stakingMint: stakedToken[0].account.stakingMint,
        ownerStakingTokenAccount:
          stakedToken[0].account.ownerStakingTokenAccount,
        vaultAccount: vault_account_pda,
        vaultAuthority: vault_authority_pda,
        stakingAccount: stakedToken[0].publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [initializerMainAccount],
    });

    _allVault = await program.account.stakeAccount.all();

    console.log(_allVault);
  });

  // it('Ejects a token before the staking period has elapsed', async () => {
  //   let _allVault = await program.account.stakeAccount.all();
  //   let stakedToken = _allVault.filter(
  //     (token) =>
  //       token.account.stakingMint.toString() === tokenMintKey.toString()
  //   );

  //   console.log(stakedToken[0].account);
  //   console.log(stakedToken[0].account.created.toString());
  //   console.log(stakedToken[0].account.unstakeDate.toString());

  //   console.log('attempting unstake...');

  //   const [_vault_account_pda, _vault_account_bump] =
  //     await PublicKey.findProgramAddress(
  //       [
  //         Buffer.from(anchor.utils.bytes.utf8.encode('receipt')),
  //         stakedToken[0].publicKey.toBuffer(),
  //         stakedToken[0].account.stakingMint.toBuffer(),
  //       ],
  //       program.programId
  //     );

  //   const vault_account_pda = _vault_account_pda;
  //   const vault_account_bump = _vault_account_bump;

  //   const [_vault_authority_pda, _vault_authority_bump] =
  //     await PublicKey.findProgramAddress(
  //       [
  //         Buffer.from(anchor.utils.bytes.utf8.encode('vault')),
  //         stakedToken[0].publicKey.toBuffer(),
  //         stakedToken[0].account.stakingMint.toBuffer(),
  //       ],
  //       program.programId
  //     );

  //   const vault_authority_pda = _vault_authority_pda;

  //   await program.rpc.eject({
  //     accounts: {
  //       stakingTokenOwner: initializerMainAccount.publicKey,

  //       stakingMint: stakedToken[0].account.stakingMint,
  //       ownerStakingTokenAccount:
  //         stakedToken[0].account.ownerStakingTokenAccount,
  //       vaultAccount: vault_account_pda,
  //       vaultAuthority: vault_authority_pda,
  //       stakingAccount: stakedToken[0].publicKey,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //     },
  //     signers: [initializerMainAccount],
  //   });

  //   _allVault = await program.account.stakeAccount.all();

  //   console.log(_allVault);
  // });
});
