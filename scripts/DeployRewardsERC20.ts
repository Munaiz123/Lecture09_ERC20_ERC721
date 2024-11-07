
import { viem } from "hardhat";
import { parseEther, formatEther } from "viem";

async function main() {
    const publicClient = await viem.getPublicClient();
    const [munzyTest, account1] = await viem.getWalletClients();
    console.log('MUNZYTEST ADDRESS === ', munzyTest.account.address)

    const tokenContract = await viem.deployContract("RewardsERC20");
    console.log(`Contract deployed at ${tokenContract.address}`);

    console.log('                                                  ')
    console.log('Assigning roles....')

    //granting MINTER Role to a differentAddress:
    const minterRoleTx = await tokenContract.write.grantRole([
        await tokenContract.read.MINTER_ROLE(),
        account1.account.address
    ])
    await publicClient.waitForTransactionReceipt({ hash: minterRoleTx });
    
    console.log('Done.')
    console.log(' ')



    let myBalance = await tokenContract.read.balanceOf([munzyTest.account.address]);
    let otherBalance = await tokenContract.read.balanceOf([account1.account.address]);

    console.log('My balance BEFORE = ', myBalance)
    console.log('Other balance BEFORE = ', otherBalance)

    // Minting new tokens and sending them to a my wallet 
    // Second wallet will be paying + signing txn
    const mintTx = await tokenContract.write.mint(
        [munzyTest.account.address, 2300n],
        { account: account1.account }
    );
    await publicClient.waitForTransactionReceipt({ hash: mintTx });
    console.log('                                                  ')

    myBalance = await tokenContract.read.balanceOf([munzyTest.account.address]);
    otherBalance = await tokenContract.read.balanceOf([account1.account.address]);
    
    console.log('My balance AFTER = ', myBalance)
    console.log('Other balance AFTER = ', otherBalance)


}


main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });