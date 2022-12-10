const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode');
var Associate = require('../model/associate')
var Level = require('../model/level')

let crypto = require('crypto');
let rand = require('csprng');
let uuid = require('uuid');
let ifsc = require('ifsc');
let pinvalidatemodule = require('pincode-validator');
let Formatter = require('../services/formatter')
    //const { response } = require('../app');
    //Google Distance Module and API key kept here, move api key to env file
const distanceCalc = require('google-distance');
distanceCalc.apiKey = '';
var axios = require('axios');
    //Need to move these keys to env file
var algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
var key = 'password';
const imageUpload = require('../services/image_upload.service');
const AllConstants = require('../services/constants');
const excel = require("exceljs");
var fs = require('fs');
var path = require('path');
   

const register_associate = catchAsync(async(req, res) => {
    let values = req.body;
    if(values.phoneNumber != '' && values.phoneNumber != undefined && values.phoneNumber != null)
    {
        // let query = {
        //     phoneNumber: values.phoneNumber,
        //     uid: values.uid,
        // };
        var query = {};
        if (values.hasOwnProperty("uid")) {
            query = {
                uid: values.uid
            }
        }
        if (values.hasOwnProperty("phoneNumber")) {
            query = {
                phoneNumber: values.phoneNumber
            }
        }
        console.log(query);
        Associate.findOne(query).lean().exec().then((Result) => {
            if (Result == null) {
                Associate.find().sort({ _id: -1 }).limit(1).then(async (Result) => {
                   var  finalStringGenerated ='';
                   let suid = uuid.v4();
                    if (Result.length > 0) {
                        let LastUID = Result[0].username;
                        let idchars = parseInt(LastUID.slice(2, 10)) + 1;
                        let lengthofdigits = idchars.toString().length;
                        let generatedUIDString = LastUID.slice(-10, 10 - lengthofdigits);
                        finalStringGenerated = generatedUIDString + idchars;
                    } else {
                        finalStringGenerated = "A000000001";
                    }
                    let salt = rand(80, 24);
                    let pass = Math.floor(100000 + Math.random() * 900000).toString();
                    console.log(pass);
                    var cipher = crypto.createCipher(algorithm, key);
                    var LevelData = await Level.findOne({ 'orderBy': 0 }).lean().exec();
                    let Data = {
                        uid: values.uid,
                        username: finalStringGenerated,
                        phoneNumber: values.phoneNumber,
                        firstName: null,
                        lastName: null,
                        fcmToken:values.fcmToken,
                        Password: cipher.update(pass, 'utf8', 'hex') + cipher.final('hex'),
                        PasswordSalt: salt,
                        createdAt: new Date(),
                        lastModifiedAt: new Date(),
                        createdBy: "Node API Hardcoded",
                        Address: {
                            pincode: values.pincode
                        },
                        Levels: LevelData,
                        deeplink: "https://paizatto.com/register?" + "referralid=" + suid,
                        updated_time: new Date(),
                        status: 0,
                        isVerifyUPI: true ,
                        isPhone:true //Inorder to skip upi screen we have added this flag while registering associate
                    };
                    ValidateReferralIdAndGetReferralData(values).then((ReferralUserData) => {
                    
                    if (values.hasOwnProperty("firstName") && values.firstName != '' && values.firstName != null && values.firstName != undefined) {
                        Data.firstName = values.firstName;
                    }
                    if (values.hasOwnProperty("lastName") && values.lastName != '' && values.lastName != null && values.lastName != undefined) {
                        Data.lastName = values.lastName;
                    }
                    let referrer = {};
                    if (isEmpty(ReferralUserData)) 
                    {
                        referrer.referralid = "";
                    } else 
                    {
                        referrer.referralid = ReferralUserData.username;
                    }
                    Data.referrer = referrer;
                    let accessToken = jwt.sign({ username:finalStringGenerated }, "09f26e402586e2faa8da4c98a35f1b20d6b033c60", { expiresIn: "120s" });
                    let refreshToken = jwt.sign({ username:finalStringGenerated }, "09f26e402586e2faa8da4c98a35f1b20d6b033c60", { expiresIn: "1d" });
                    Associate(Data).save().then((Result) => {
                        let templateid = AllConstants.SMSTemplateIds.AssociateSignupSMS;
                        let senderid = AllConstants.SenderId.AssociateSignupSMS;
                        let content = AllConstants.SMSContent.AssociateSignupSMS;
                        content = content.replace("{#var#}", Result.username)
                        content = content.replace("{#var#}", pass)
                        let number = values.phoneNumber;
                        let message = "";
                       SendSMSInAssociate(templateid, senderid, content, number, message).then((Resp) => {
                            //console.log("RESP------->",Resp)
                            let templateid1 = AllConstants.SMSTemplateIds.AssociateAppLink;
                            let senderid1 = AllConstants.SenderId.AssociateAppLink;
                            let content1 = AllConstants.SMSContent.AssociateAppLink;
                            content1 = content1.replace("{#var#}", AllConstants.Links.associateapplink)
                            let number1 = values.phoneNumber;
                            let message1 = "";
                            SendSMSInAssociate(templateid1, senderid1, content1, number1, message1).then(() => {
                                res.send({
                                    code: 200,
                                    success: true,
                                    status: "Registered Successfully",
                                    Data: {
                                        uid: Result.uid,
                                        username: Result.username,
                                        firstName: Result.firstName,
                                        lastName: Result.lastName,
                                        phoneNumber: Result.PhoneNumber,
                                        accessToken: accessToken,
                                        refreshToken: refreshToken,
                                        isVerifyUPI: Result.isVerifyUPI,
                                        isBank: Result.isBank,
                                        isPersonal: Result.isPersonal,
                                        isPhone:true,
                                        isfavourite:Result.is_favourite
                                    },
                                    timestamp: new Date()
                                });
                           });
                       });
                    });
                    }).catch(err => {
                        console.log("Error at validate referral id", err)
                        res.json(err)
                    });
                });
            } else if (Result != null) {
                res.send({
                    code: 201,
                    success: false,
                    status: "Phone Number and Uid  Exists Already.",
                    timestamp: new Date()
                });
            }
        });
        
    }
    else
    {
        res.send({
            code: 201,
            success: false,
            status: "All Fields are Mandatory",
            timestamp: new Date()
        });
    }
});

const ValidateReferralIdAndGetReferralData = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                console.log(values.ReferralId);
                if (values.ReferralId) {
                    if (values.ReferralId != null && values.ReferralId != undefined) {
                        let query = {
                            username: values.ReferralId.toUpperCase()
                        };
                        Associate.findOne(query).lean().exec().then((Result) => {
                            if (Result == null) {
                                reject({
                                    code: 201,
                                    success: false,
                                    message: "No such user exists.",
                                    timestamp: new Date()
                                })
                            } else if (Result != null) {
                                resolve(Result)
                            }
                        }).catch((err) => {
                            reject({
                                code: 201,
                                success: false,
                                message: "Database Error.",
                                timestamp: new Date()
                            });
                        })
                    } else {
                        reject({
                            code: 201,
                            success: false,
                            message: "Invalid ReferralId.",
                            timestamp: new Date()
                        })
                    }
                } else {
                    resolve({
                        uid: "OL00000001",
                        username: "OL00000001",
                        firstName: "Company Referral",
                        lastName: "Company Network"
                    })
                }
            } catch (error) {
                console.error('Something Error');
                console.error(error);
            }
        });
    });
}

const SendSMSInAssociate = async(templateid, senderid, content, number, message) => {
    let apiurl = "https://sms.textspeed.in/vb/apikey.php?apikey=";
    let apikey = "KVJDmTqcjcY69RYN";
    let sendSMSurl = apiurl + apikey + '&senderid=' + senderid + '&templateid=' + templateid + '&number=' + number + '&message=' + content + message;

    var config = {
        method: 'get',
        url: '',
        headers: {}
    };
    config.url = sendSMSurl;
    console.log("Send SMS URL", sendSMSurl);
    await axios(config).then(function(response) {
        console.log("Send SMS Response----->", response.data)
        return (response.data);
    }).catch(function(error) {
        console.log("error------>", error)
        return (error);
    });
}

const login_associate = catchAsync(async(req, res) => {
    let values = req.body;
    let query ={};
    if(values.phoneNumber != undefined)
    {
        query = {
            phoneNumber: values.phoneNumber
        }
    }
    else
    {
        query = {
            username: values.username.toUpperCase(),
        }
    }
    
    Associate.findOne(query).lean().exec().then((Result) => {
        console.log(Result);
        if(Result) 
        {
            let query = {
                id:Result.id
            }
            if(values.fcmToken != '' && values.fcmToken != null && values.fcmToken != undefined)
            {
                for(var i=0; i<Result.fcmToken.length; i++)
                {
                    
                    if(Result.fcmToken[i] != values.fcmToken)
                    {
                        let changes = {
                            $set:{
                                fcmToken: [values.fcmToken,Result.fcmToken[i]]
                            }
                        }
                        Associate.updateMany(query, changes).lean().exec();
                    }
                    
                }
            }
            
            if (values.Password != '' && values.Password != null && values.Password != undefined)
            {
                ValidateReferralIdAndGetReferralData(values).then((ReferralUserData) => {
                    let referrer = {};
                    if (isEmpty(ReferralUserData)) 
                    {
                        referrer.referralid = "";
                    } else 
                    {
                        referrer.referralid = ReferralUserData.username;
                    }
                     let changes = {
                            $set:{
                                referrer
                            }
                        }
                        Associate.updateMany(query, changes).lean().exec();
                });
                let password = values.Password;
                var decipher = crypto.createDecipher(algorithm, key);
                let SavedPassword = Result.Password;
                console.log(Result.Password);
               
                let encryptedPassword = decipher.update(SavedPassword, 'hex', 'utf8') + decipher.final('utf8');
                console.log(encryptedPassword);
                if (encryptedPassword == password || password == AllConstants.Universals.VendorUniversalPassword) 
                {
                    if (Result.status == 0 || Result.status == 1 || Result.status == 2 || Result.status == 3) 
                    {
                        let accessToken = jwt.sign({ username: Result.username }, "09f26e402586e2faa8da4c98a35f1b20d6b033c60", { expiresIn: "120s" });
                        let refreshToken = jwt.sign({ username: Result.username }, "09f26e402586e2faa8da4c98a35f1b20d6b033c60", { expiresIn: "1d" });
                        res.send({
                            success: true,
                            code: 200,
                            accessToken: accessToken,
                            refreshToken: refreshToken,
                            Data: {
                                //username: Result.username,
                                isVerifyUPI: Result.isVerifyUPI,
                                isBank: Result.isBank,
                                isPersonal: Result.isPersonal,
                                isPhone:Result.isPhone,
                                isfavourite:Result.isfavourite,
                                deeplink:Result.deeplink,
                                status: Result.status
                                
                            }
                        })
                    }
                    else 
                    {
                        res.send({
                            code: 201,
                            success: false,
                            message: "User Blocked.",
                            timestamp: new Date()
                        });
                    }
                }
                else 
                {
                    res.send({
                        code: 201,
                        success: false,
                        message: "Incorrect Password.",
                        timestamp: new Date()
                    });
                }
                
            }
            else 
            {
                res.send({
                    code: 201,
                    success: false,
                    message: "Please provide a valid password.",
                    timestamp: new Date()
                });
            }
            
        } 
        else 
        {
            res.send({
                success: false,
                code: 201,
                Status: "Phone Number or Username Doesn't Exist.",
                "timestamp": new Date()
            });
        
        }
    });
});


const updateprofiledetails = catchAsync(async(req, res) => {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        var decodedHeader = jwt_decode(bearerToken);
        if (decodedHeader.username != null && decodedHeader.username != '' && decodedHeader.username != undefined && decodedHeader.username.length > 9) {
            let username = decodedHeader.username;
            let values = req.body;
            values.username = username;
            var query = {};
            if (values.hasOwnProperty("uid")) {
                query = {
                    username: values.username.toUpperCase()
                }
            }
            console.log("--->"+query);
            Associate.findOne(query).lean().exec().then((Result) => {
                if(Result)
                {
                    let query = {
                        username: username
                    };
                    let cipher1 = crypto.createCipher(algorithm, key);
                    if(values.password != '' && values.password != null && values.password != undefined)
                    {
                        var password = cipher1.update(values.password, 'utf8', 'hex') + cipher1.final('hex');
                    }
                    else
                    {
                        var password = Result.Password;
                    }
                    console.log(password);
                    values.Password = password;
                    values.email = values.email;
                    values.firstName = values.firstName ;
                    values.lastName = values.lastName;
                    values.isPersonal = true
                    Associate.updateOne(query, values).lean().exec().then((UpdateStatus) => {
                        res.send({
                            code: 200,
                            success: true,
                            message: "Associate Personal Details Updated Success.",
                            timestamp: new Date()
                        })
                    }).catch((err) => {
                        console.log(err);
                        res.send({
                            code: 201,
                            success: false,
                            message: "DATABASE_ERROR.",
                            timestamp: new Date()
                        });
                    })
                }
                else
                {
                    res.send({
                        success: false,
                        code: 201,
                        Status: "Phone Number or Username Doesn't Exist.",
                        "timestamp": new Date()
                    });
                }
            }).catch((err) => {
                res.send({
                    success: false,
                    code: 201,
                    Status: "Phone Number or Username Doesn't Exist.",
                    "timestamp": new Date()
                });
            })
        } else {
            let response = {};
            response.code = 201;
            response.success = false;
            response.message = "You are not authorized / Invalid Auth Token.";
            response.timestamp = new Date();
            res.send(response);
        }
    } else {
        let response = {};
        response.code = 201;
        response.success = false;
        response.message = "You are not authorized";
        response.timestamp = new Date();
        res.send(response);
    }
});

const loginotpdetails = catchAsync(async(req, res) => {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        var decodedHeader = jwt_decode(bearerToken);

        if (decodedHeader.uid != null && decodedHeader.uid != '' && decodedHeader.uid != undefined ) {
            let uid = decodedHeader.uid;
            let query = {
                uid: uid
            };
            Associate.findOne(query).lean().exec().then((UpdateStatus) => {
                if(UpdateStatus != null)
                {
                    let accessToken = jwt.sign({ username: UpdateStatus.username }, "09f26e402586e2faa8da4c98a35f1b20d6b033c60", { expiresIn: "120s" });
                    let refreshToken = jwt.sign({ username: UpdateStatus.username }, "09f26e402586e2faa8da4c98a35f1b20d6b033c60", { expiresIn: "1d" });
                    res.send({
                        success: true,
                        code: 200,
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                        Data: {
                            //username: Result.username,
                            isVerifyUPI: UpdateStatus.isVerifyUPI,
                            isBank: UpdateStatus.isBank,
                            isPersonal: UpdateStatus.isPersonal,
                            isPhone:UpdateStatus.isPhone,
                            isfavourite:UpdateStatus.isfavourite,
                            status: UpdateStatus.status
                            
                        }
                    })
                   
                }
                else
                {
                    res.send({
                        code: 201,
                        success: false,
                        message: "Invalid Auth Token.",
                        timestamp: new Date()
                    })
                }
            })
        } else {
            let response = {};
            response.code = 201;
            response.success = false;
            response.message = "You are not authorized / Invalid Auth Token.";
            response.timestamp = new Date();
            res.send(response);
        }
    } else {
        let response = {};
        response.code = 201;
        response.success = false;
        response.message = "You are not authorized";
        response.timestamp = new Date();
        res.send(response);
    }
});

function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

module.exports = {
    register_associate,
    login_associate,
    updateprofiledetails,
    loginotpdetails
}