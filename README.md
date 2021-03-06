# 🐲 latude owner portal

This is the layer where hotel/property manager will be able to create and edit their assets. 

### How to Contribute

Any contributions are welcome!

### Prerequisites

This is what you need to install before building the application

```
npm ^5.3.0
node ^6.11.2
ganache ^1.2.0
truffle ^4.0.0
metamask ^3.12.0
geth 1.7.2
```

### Get & Build

For an unknown reason I did recommand to run this command. This will help when installing the web3 package. Otherwise there's an error.
```
npm install --global --production windows-build-tools
```

Clone the current repo.

```
git clone https://github.com/lerer00/latude-owner-portal.git
npm install --global --production windows-build-tools
```

### Run locally with **ganache**

First there's a line in the ExchangeRates.sol constructor that you need to uncomment.
```
OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);
```

Make sure that your ganache rpc is started and running on port 7545 and execute those commands.

```
grunt rpc_bridge
grunt deploy_ganache
```

Now that every contracts are deployed, start the application.

```
npm start
```

### Run locally with **RinkeBy**

This line in the ExchangeRates.sol constructor should be commented.

```
OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);
```

Follow those grunt commands.

This command start the rinkeby rpc using geth. You'll need to create yourself an account first following those [instructions](https://github.com/ethereum/go-ethereum/wiki/Managing-your-accounts#creating-an-account). Take your account address and paste it in the appropriate location in the gruntfile.js exec:local_geth_rinkeby function. Make sure to remember your passphrase because you'll need it.

```
grunt rpc_rinkeby
```

This command clean previous build, compile all solidity contracts with truffle and migrate them against the desired rpc.

```
grunt deploy_rinkeby
```

This should start the application in your prefered browser.

```
npm start
```

## Authors

* [**Francis Boily**](https://github.com/lerer00) - *Initial work*
* [**Simon B.Robert**](https://github.com/carte7000) - *Active development*
* [**Vadim Stepanov**](https://github.com/vadimkerr) - *Work on contracts*

