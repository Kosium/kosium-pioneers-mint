/* Contracts in this test */
const Web3 = require('web3');

let web3 = new Web3('ws://localhost:7545');
// console.log(web3);//shows all methods

const KosiumPioneer = artifacts.require(
    "../contracts/KosiumPioneer.sol"
);
  
  
contract("KosiumPioneer", (accounts) => {
    // const URI_BASE = 'https://creatures-api.opensea.io';
    // const CONTRACT_URI = `${URI_BASE}/contract/opensea-erc1155`;
    let kosiumPioneer;

    before(async () => {
        kosiumPioneer = await KosiumPioneer.deployed();
    });

    // This is all we test for now

    // This also tests contractURI()

    // describe('#constructor()', () => {
    //     it('should set the contractURI to the supplied value', async () => {
    //     assert.equal(await creatureAccessory.contractURI(), CONTRACT_URI);
    //     });
    // });

    it('should reserve a pioneer', async ()=>{
        let reserveReturn = await kosiumPioneer.reservePioneers(1);
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

    // it('should mint a pioneer', async()=>{
    //     //
    // });

    it('should withdraw the balance', async()=>{
        let balanceBefore = await web3.eth.getBalance(accounts[0]);//instance.address);
        let txn = await kosiumPioneer.withdraw();
        let balance = await web3.eth.getBalance(accounts[0]);//instance.address);

        let balanceIncrease = balance - balanceBefore;
        expect(balanceIncrease).to.be.above(78000000000000000);
    });
});
  