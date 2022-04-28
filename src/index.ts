// npm run start:dev
const Moralis = require("moralis/node");
require('dotenv').config();
import * as fs from 'fs';
import * as path from 'path';
const ethers = require('ethers');
const axios = require("axios");

let ipfsArray: { path: string; content: string; }[] = [];
let metaDataArray: any [] = [];
let promises: any[] = [];
let pathArray :any[] = [];
let metadataResultArray :any[] = [];
let fileCount = parseInt(process.env.FILE_COUNT || "0");

async function uploadVideos() : Promise<any[]>{



    for (let i = 1; i <= fileCount; i++) {
        let readFiledata = await fs.readFileSync(`${__dirname}/videos/${i}.mp4`);
        let temp1 = readFiledata.toString('hex'); 
        let base64String = Buffer.from(temp1, 'hex').toString('base64')

        ipfsArray.push({
            path: `CampaTestVideos/${i}.mp4`,
            content: base64String
        })
    }

    await Promise.all(promises).then( async () => {
        await axios.post("https://deep-index.moralis.io/api/v2/ipfs/uploadFolder", 
            ipfsArray,
            {
                headers: {
                    "X-API-KEY": process.env.API_KEY,
                    "Content-Type": "application/json",
                    "accept": "application/json"
                }
            }
        ).then( (res: { data: any; }) => {
            pathArray.push(res.data);
        })
        .catch ( (error: any) => {
            console.log(error)
        })
    })

    return pathArray;

}

async function uploadMetadata() : Promise<any[]> {

    for (let i = 1; i <= fileCount; i++) {

        let readFiledata = await fs.readFileSync(`${__dirname}/metadata/${i}.json`);
        let JSONfromBase64 =  JSON.parse(readFiledata.toString());

        JSONfromBase64['external_url'] = pathArray[0][i-1].path;

        console.log("---> Updated Json File : ", JSONfromBase64);

        let obj = {
            path: `CampaTestMetadata/${i}.json`,
            content: JSONfromBase64,
        }
        metaDataArray.push( obj );
        
    }

    await Promise.all(promises).then( async () => {
    await axios.post("https://deep-index.moralis.io/api/v2/ipfs/uploadFolder", 
        metaDataArray,
        {
            headers: {
                "X-API-KEY": process.env.API_KEY,
                "Content-Type": "application/json",
                "accept": "application/json"
            }
        }
    ).then( (res: { data: any; }) => {
        metadataResultArray.push(res.data);
    })
    .catch ( (error: any) => {
        console.log(error)
    })

    });

    return metadataResultArray;
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
    await uploadVideos();
    console.log("---> videoResultArray : ", pathArray);
    await uploadMetadata();
    console.log("---> metadataResultArray : ", metadataResultArray);

}


bootstrap();
