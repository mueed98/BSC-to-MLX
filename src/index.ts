// npm run start:dev
const Moralis = require("moralis/node");
require('dotenv').config();
const converter = require('json-2-csv');
const fs = require('fs');

async function getTransations() {

    let transactions = await Moralis.Web3API.account.getTokenTransfers({
        address: process.env.SENDER?.toLowerCase(),
        chain: process.env.CHAIN?.toLowerCase(),
    });

    let result = transactions.result.filter(
        ({ from_address, address }: any) =>
            from_address === process.env.SENDER?.toLowerCase() && address === process.env.CONTRACT?.toLowerCase()
    );

    let cleanArray = result.map((item: { transaction_hash: any; to_address: any; from_address: any; value: any; }) => ({
        tx: item.transaction_hash, 
        Sender: item.from_address,
        Receiver: item.to_address,
        amount : item.value / (10 ** 18)
    }));

    converter.json2csv(cleanArray, (err: any, csv: any) => {
        if (err) {
            throw err;
        }
    
        // print CSV string
        console.log(csv);
        fs.writeFileSync('transactions.csv', csv);
    });

    

 
}


async function bootstrap() {
  // Moralis Server Connection
  const serverUrl  = process.env.SERVER_URL;
  const appId  = process.env.APP_ID;
  const masterKey = process.env.MASTER_KEY;

  try {
    await Moralis.start({ serverUrl , appId, masterKey });
  } catch (err) {
    console.log(err);
    return "Moralis Start Error";
  }

  console.log("-> Moralis Connected");
    await getTransations();

}


bootstrap();


