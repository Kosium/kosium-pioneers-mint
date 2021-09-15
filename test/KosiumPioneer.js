const Web3 = require('web3');

let web3 = new Web3('ws://localhost:7545');
// console.log(web3);//shows all methods

const KosiumPioneer = artifacts.require(
    "../contracts/KosiumPioneer.sol"
);
  
//need to test if MAX_PIONEERS are minted that it stops minting with correct error msg
//need to set up reentrancy test
  
contract("KosiumPioneer", (accounts) => {
    let kosiumPioneer;

    before(async () => {
        kosiumPioneer = await KosiumPioneer.deployed();
    });

    it('should reserve a pioneer', async ()=>{
        let reserveReturn = await kosiumPioneer.reservePioneers(40, {gas: 5000000});
        assert(reserveReturn.hasOwnProperty('tx'));
        let addrOwner = await kosiumPioneer.ownerOf(0);
        // console.log('addrOwner: ', addrOwner);
        assert.equal(accounts[0], addrOwner);
    });

    it('should set base uri', async()=>{
        let baseUri = 'ipfs://QmdrX4RFbkmt2uhTA1ETPrQoJqtS1yiXA1qop2j3Mzt64T/';
        await kosiumPioneer.setBaseTokenURI(baseUri);
        let uri0 = await kosiumPioneer.tokenURI(0);
        // console.log('uri0: ', uri0);
        let correctURI0 = baseUri + '0';
        assert.equal(correctURI0, uri0);
    });

    it('should start the presale', async()=>{
        await kosiumPioneer.whitelistAddressForPresale(accounts[0]);
        let errHappened = false;
        try{
            let errMsg = await kosiumPioneer.mintPresalePioneer(1);
        }
        catch(e){
            errHappened = true;
        }
        assert(errHappened);
        await kosiumPioneer.flipPresaleState();
        let successMint = await kosiumPioneer.mintPresalePioneer(2,{value: 160000000000000000});
        assert(successMint.hasOwnProperty('tx'));
    });

    it('should start the sale', async()=>{
        let errHappened = false;
        try{
            let errMsg = await kosiumPioneer.mintPioneer(1);
        }
        catch(e){
            // console.log('error: ', e);
            errHappened = true;
        }
        assert(errHappened);
        await kosiumPioneer.flipSaleState();
        let successMint = await kosiumPioneer.mintPioneer(1,{value: 80000000000000000});
        // console.log('should be txn: ', successMint);
        assert(successMint.hasOwnProperty('tx'));
    });

    it('should withdraw the balance', async()=>{
        let balanceBefore = await web3.eth.getBalance(accounts[0]);//instance.address);
        let txn = await kosiumPioneer.withdraw();
        let balance = await web3.eth.getBalance(accounts[0]);//instance.address);

        let balanceIncrease = balance - balanceBefore;
        expect(balanceIncrease).to.be.above(78000000000000000);
    });
});
  