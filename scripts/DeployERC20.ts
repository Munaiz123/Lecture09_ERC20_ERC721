import { viem } from "hardhat";
import { parseEther, formatEther } from "viem";

async function main() {
    const publicClient = await viem.getPublicClient();
    const [deployer, account1, account2] = await viem.getWalletClients();

    // Deploying with hardhat helper functions
    const tokenContract = await viem.deployContract("MyToken");
    console.log(`Contract deployed at ${tokenContract.address}`);
    
    // fetching token 
    const initialSupply = await tokenContract.read.totalSupply();
    console.log({ initialSupply });

    // Fetching the role code
    const roleTx = await tokenContract.write.grantRole([
        await tokenContract.read.MINTER_ROLE(), // fetching the role's code that's being granted (defined by keccak256 func)
        account2.account.address, // the address to which the role is being granted
    ]);
    console.log('ASSIGNING ROLE....')
    console.log('                                                  ')

    await publicClient.waitForTransactionReceipt({ hash: roleTx });
    console.log('Done!')
    console.log('                                                  ')

    // trying to mint
    const mintTx = await tokenContract.write.mint(
        [deployer.account.address, parseEther("10")],
        { account: account2.account }
    );
    console.log('MINTING....')
    await publicClient.waitForTransactionReceipt({ hash: mintTx });
    console.log('Done!')
    console.log('                                                  ')

    
    //Fetching token data with Promise.all()
    const [name, symbol, decimals, totalSupply] = await Promise.all([
        tokenContract.read.name(),
        tokenContract.read.symbol(),
        tokenContract.read.decimals(),
        tokenContract.read.totalSupply(),
    ]); 
    // console.log("Token Date => ",{ name, symbol, decimals, totalSupply });

    let myBalance = await tokenContract.read.balanceOf([deployer.account.address]);
    let otherBalance = await tokenContract.read.balanceOf([account1.account.address]);

    console.log(`My Balance BEFORE transfer: ${formatEther(myBalance)} ${symbol}`);
    console.log(`The Balance of Acc1 BEFORE transfer: ${formatEther(otherBalance)} ${symbol}`);
    console.log('                                                  ')

    // Sending a transaction
    const tx = await tokenContract.write.transfer([account1.account.address, parseEther("2")]);
    await publicClient.waitForTransactionReceipt({ hash: tx });



    // Viewing Balances
    // const myBalance = await tokenContract.read.balanceOf([deployer.account.address]);
    // console.log(`My Balance is ${myBalance} decimals units`);

    // const otherBalance = await tokenContract.read.balanceOf([account1.account.address]);
    // console.log( `The Balance of Acc1 is ${otherBalance} decimals units`);

    //viewing converted balances 
    myBalance = await tokenContract.read.balanceOf([deployer.account.address]);
    console.log(`My Balance AFTER transfer: ${formatEther(myBalance)} ${symbol}`);
    
    otherBalance = await tokenContract.read.balanceOf([account1.account.address]);
    console.log(`The Balance of AFTER transfer: ${formatEther(otherBalance)} ${symbol}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});