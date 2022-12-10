const https = require("https");
const axios = require("axios");
const crypto = require('crypto');

const config = {
    clientCode: "ENRICH1",
    url: "https://api.idfcfirstbank.com/enrich1/executeTransaction?apikey=ENRICH1_Partner"
}

// Https Agent
const httpsAgent = new https.Agent({
    cert: fs.readFileSync(path.resolve(__dirname, '/etc/ssl/paizatto_com.crt')),
    key: fs.readFileSync(path.resolve(__dirname, '/etc/ssl/paizatto.com.key')),
    ca: fs.readFileSync(path.resolve(__dirname, '/etc/ssl/IDFC_API_PROD.crt')),
    maxVersion: "TLSv1.2",
    minVersion: "TLSv1.2"
});

const execute = async (request, response) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const clientCode = config.clientCode;

    const url = config.url;
    let timestamp = getTimestamp();
    let requestBody = {
        "paymentTransactionReq": {
            "msgHdr": { 
                "msgId": "847586859632",
                "cnvId": "",
                "extRefId": "",
                "bizObjId": "",
                "appId": "",
                "timestamp": timestamp 
            },
            "msgBdy": {
                "paymentReq": {
                    "custTxnRef": "847586859631", //request.body.custTxnRef
                    "beneAccNo": request.body.beneAccNo,
                    "beneName": request.body.beneName,
                    "beneAddr1": request.body.beneAddr1,
                    "beneAddr2": request.body.beneAddr2,
                    "ifsc": request.body.ifsc,
                    "valueDate": getTimestamp().split(" ")[0].split("-").join(""), // Converting From 2022-05-05 12:30:00 To 20220505
                    "tranCcy": request.body.tranCcy,
                    "tranAmount": request.body.tranAmount,
                    "purposeCode": request.body.purposeCode,
                    "remitInfo1": "",
                    "remitInfo2": "",
                    "clientCode": clientCode,
                    "paymentType": request.body.paymentType,
                    "beneAccType": "CA",
                    "remarks": request.body.remarks,
                    "beneMail": request.body.beneMail,
                    "beneMobile": request.body.beneMobile
                }
            }
        }
    }

    let contentToHmac = timestamp+JSON.stringify(requestBody);
    try {
        await axios.post(
            url,
            requestBody,
            {
                httpsAgent: httpsAgent,
                headers: {
                    "Content-Type": "application/json",
                    "sign": generateHmac(contentToHmac),
                    "TimeStamp": timestamp
                }
            }
        )
        .then((response) => {
            // Handle success
            console.log("Success", response);
            return response.status(500).json({"Message" : "Successfully executed.", "Content" : response});
        })
        .catch((error) => {
            // Handle Failure
            console.log(error.message);
            return response.status(500).json({"Message" : "Execution Failed", "Content" : error.message});
        });
    } catch (ex) {
        console.log('API Error', ex);
        return response.status(500).json(ex);
    }
}

// Get Timestamp
const getTimestamp = () => {
    let today = new Date();
    let date = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) +'-'+ ('0' + today.getDate()).slice(-2);
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return date +' '+ time;
}

// Generate HMac
const generateHmac = (contentToHmac) => {
    const secretKey = 'd1809690d1b67fe2'
    return crypto.createHmac('sha1', secretKey).update(contentToHmac).digest('hex');
}

module.exports = {
    execute
}