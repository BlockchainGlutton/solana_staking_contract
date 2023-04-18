# Magnum AI Staking Contract

This repo contains a staking contract written using Rust/Anchor Framework, a suite of tests/admin scripts written in TypeScript, and a React/Typescript app that allows admins to pull up staking accounts associated with a particular user or NFT.

# Staking Contract

The contract is a fairly standard "token lock-up" program. It allows users to initiate the transfer of an NFT from their wallet's Associated Token Account into a Program Derived Address. As part of this process, a "staking account" is created as a record of the transaction. The staking account's structure:

/// UPDATE ONCE SOTERIA DOES

```
pub struct StakeAccount {
    pub staking_token_owner: Pubkey, (owner's wallet)
    pub owner_staking_token_account: Pubkey, (owner's NFT ATA)
    pub staking_mint: Pubkey, (token's mint address)
    pub created: i64, (date created)
    pub unstake_date: i64, (NFT locked up until date)
    pub staking_period: u16, (reference to minimum time that must elapse before unstaking)
    pub is_one_of_one: bool, (if the token is a one-of-one)
    pub reward_collected: bool (has the total reward been collected?)
}
```

The staking account contains all the information necessary to validate subsequent calls to the contract in relation to reward collection and unstaking. It can also be used by whatever front end queries it to display information about tokens currently staked.

Public Functions:
Stake: Create staking acount, transfer NFT to PDA.
Collect: Collect accumulated rewards over the course of the staking period. Can be called every 24 hours, starting 24 hours after initial staking.
Collect_Full: Collect all remaining rewards due. Required to be called before unstaking, as Unstake checks for a true value on reward_collect.
Unstake: Transfer NFT back to owner, close staking account.

The contract is in the process of being audited by Soteria, and is expected to be protected from all standard exploitations.

# Test Suite and Admin Scripts

Located in /tests/staking.ts

Admin Scripts

The admin scripts allow the execution of specific support tasks related to Associated Token Accounts. In order to make ful use of these tools, you need to have both the user's wallet address, as well as the mint of the NFT in question.

With that information in hand, you can look up the user's ATA for the NFT and/or MAGAI token.

Common scenarios:
If the user/NFT ATA does not exist, it could indicate that they gave you the wrong wallet address. Look up the NFT on solscan and see if that wallet appears in the owner history. It should be the second most recent (most recent being the staking_acount's ATA for the token).

If the wallet address in question DOES appear, then there is a chance that the ATA was closed after the transfer (i.e. Slope wallet). Check the NFTs transaction history on SolScan. You should find one for the Stake function, which will show it transferring from the user ATA to the staking account ATA. Copy the user ATA and look it up on SolScan.

If you see that a Close Account Instruction was executed, then using the script to create a new ATA for that user/NFT should reoolve the issue. If you see that the ATA is still open, then some further investigation is needed. Most likely, they have another wallet that was actually used for staking, so they need to make sure they are logged in with the correct wallet.

You can also plug in the address of the staking account (get through client app tool) to get the staking account's NFT ATA. This can be sueful to confirm that the staked token is being stored in the correct place.

Finally, there can be a rare scenario that requires us to close an ATA on behalf of a user for some reason. The third script in our admin tools allows for this.

Test Suite

Tests the core functionality of the contract and its handling of most common edge cases.

# Utility App

Finally, there is a React app that allows the admin to query the contract for all active staking accounts and filter by wallet address and/or token mint and prints the information to console. This is a more dynamic tool than the scripts, and is the recommended first step when first checking out a ticket to confirm top level details such as that the token is where it should be, that the staking account info checks out, and that it has the expected status.

From here, you can either immediately close out simple tickets, or gather information needed for further investigation. A common workflow for more complext tickets is to use this interface first, collect necessary information, then deep dive into SolScan to build the transaction history story, and finally use the admin scripts if you need to get your hands dirty with any ATA creation/closing.
