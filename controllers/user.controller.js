const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode');
var User = require('../model/user');
var Associate = require('../model/associate')
var AssociateOtp = require('../model/associateotp')
var Vendor = require('../model/vendor')
var Level = require('../model/level')
var Contactus = require('../model/contactus')
var Point = require('../model/point')
var Vendors = require('../model/vendor');
let GeneralSettings = require('../model/generalsetting')
let Area = require('../model/area')
let Payouts = require('../model/payout')
let moment = require('moment');
let uuid = require('uuid');
let Categories = require('../model/category');
var primary = require('../model/primarycategory'); 
let MembershipModel = require('../model/membership');
let Faq = require('../model/faq');
var isliders = require('../model/islider')
var categories = require('../model/category');
let Notification = require('../model/notification')
let PaizattoPoints = require('../model/paizattopoints')
let crypto = require('crypto');
let rand = require('csprng');

let ifsc = require('ifsc');
let pinvalidatemodule = require('pincode-validator');
let Transactions = require('../model/transaction');
let Formatter = require('../services/formatter')
    //const { response } = require('../app');
    //Google Distance Module and API key kept here, move api key to env file
const distanceCalc = require('google-distance');
distanceCalc.apiKey = '';
var axios = require('axios');
const adminController = require('../controllers/admin.controller')
    //Need to move these keys to env file
var algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
var key = 'password';
const imageUpload = require('../services/image_upload.service');

const AllConstants = require('../services/constants');
const excel = require("exceljs");
var fs = require('fs');
var path = require('path');


let distanceApi = require('google-distance-matrix');
distanceApi.key("AIzaSyCSz9NtHfJEldYLoLbpdI4CabliqnBUQvE");

const SendOTPAssociate = catchAsync(async(req, res) => {
    let values = req.body;
    DecodeJWTToken(values).then((decodedResult) => {
        CheckPhoneNumberOTPExistsAlready(decodedResult).then((Result) => {
            res.send(Result);
        }).catch(err => res.json(err));
    }).catch(err => res.json(err));
});

const VerifyOTPAssociate = catchAsync(async(req, res) => {
    let values = req.body;
    DecodeJWTToken(values).then((decodedResult) => {
        if (decodedResult.phoneNumber != '' && decodedResult.phoneNumber != null && decodedResult.phoneNumber != undefined &&
            decodedResult.OTP != '' && decodedResult.OTP != null && decodedResult.OTP != undefined
        ) {
            let query = {
                phoneNumber: decodedResult.phoneNumber
            }
            AssociateOtp.findOne(query).lean().exec().then((Result) => {
                if (Result) {
                    if (parseInt(Result.otp) == parseInt(decodedResult.OTP)) {
                        res.send({
                            success: true,
                            extras: {
                                Status: "OTP Verified Success",
                                Data: {
                                    phoneNumber: Result.phoneNumber,
                                    otp: Result.otp,
                                    count: Result.count
                                }
                            }
                        })
                    } else {
                        res.send({
                            success: false,
                            extras: {
                                Status: "Invalid OTP Entered.",
                                Data: {
                                    phoneNumber: Result.phoneNumber,
                                    otp: Result.otp,
                                    count: Result.count
                                }
                            }
                        });
                    }
                } else {
                    res.send({ success: false, extras: { msg: "Invalid Phone Number" } });
                }
            }).catch((err) => {
                res.send({ success: false, extras: { msg: "DATABASE_ERROR" } });
            })
        } else {
            res.send({ success: false, extras: { msg: "Invalid JWT Token." } });
        }
    }).catch(err => res.json(err));
});

const DecodeJWTToken = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                if (values.sendOTP != '' && values.sendOTP != undefined && values.sendOTP != null) {
                    let decodedResult = jwt_decode(values.sendOTP);
                    resolve(decodedResult);
                } else {
                    reject({ success: false, extras: { msg: "JWT Token Missing." } });
                }
            } catch (error) {
                console.error('Something Error');
                console.error(error);
            }
        });
    });
}

const CheckPhoneNumberOTPExistsAlready = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                let query = {
                    phoneNumber: values.phoneNumber
                };
                AssociateOtp.findOne(query).lean().exec().then((Result) => {
                    if (Result) {
                        let changes = {
                            $set: {
                                phoneNumber: Result.phoneNumber,
                                otp: values.OTP,
                                count: Result.count + 1
                            }
                        };
                        AssociateOtp.updateOne(query, changes).lean().exec().then((UpdateStatus) => {
                            resolve({
                                success: true,
                                code: 200,
                                Status: "OTP Sent Success",
                                Data: {
                                    phoneNumber: Result.phoneNumber,
                                    otp: Result.otp,
                                    count: Result.count
                                },
                                "timestamp": new Date()

                            });
                        }).catch((err) => {
                            reject({
                                success: false,
                                code: 200,
                                Status: "Database Error",
                                Data: {

                                },
                                "timestamp": new Date()

                            });
                        })
                    } else {
                        let Data = {
                            phoneNumber: values.phoneNumber,
                            otp: values.OTP,
                            count: 1
                        }
                        AssociateOtp(Data).save().then((Result) => {
                            resolve({
                                success: true,
                                code: 200,
                                Status: "OTP Sent Success",
                                Data: {
                                    phoneNumber: Result.phoneNumber,
                                    otp: Result.otp,
                                    count: Result.count
                                }
                            });
                        }).catch((err) => {
                            console.error('Database Error');
                            console.error(err);
                            reject({
                                success: false,
                                code: 200,
                                Status: "Database Error",
                                Data: {

                                },
                                "timestamp": new Date()

                            });
                        })
                    }
                }).catch((err) => {
                    console.log(err);
                    reject({
                        success: false,
                        code: 200,
                        Status: "Database Error",
                        Data: {

                        },
                        "timestamp": new Date()

                    });
                })
            } catch (error) {
                console.error('Something Error');
                console.error(error);
                reject({
                    success: false,
                    code: 200,
                    Status: "Database Error",
                    Data: {

                    },
                    "timestamp": new Date()

                });
            }
        });
    });
}
var request = require('request'); //require somewhere and use

const forgotPassword = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("phoneNumber") && values.phoneNumber != '' && values.phoneNumber != null && values.phoneNumber != undefined && typeof(values.phoneNumber) == "number") {
        try {
            let UserData = await CheckWheatherUserExists(values);
            if (UserData.hasOwnProperty("Password")) {
                var decipher = crypto.createDecipher(algorithm, key);
                UserData.Password = decipher.update(UserData.Password, 'hex', 'utf8') + decipher.final('utf8');
                console.log(UserData.Password);
            }

            let templateid = AllConstants.SMSTemplateIds.AssociateForgotPassword;
            let senderid = AllConstants.SenderId.AssociateForgotPassword;
            let content = AllConstants.SMSContent.AssociateForgotPassword;
            content = content.replace("{#var#}", UserData.Password)
            let number = values.phoneNumber;
            let message = "";
            SendSMSInAssociate(templateid, senderid, content, number, message).then(() => {
                res.send({
                    code: 200,
                    success: true,
                    status: "Password sent to registered mobile",
                    timestamp: new Date()
                });
            }).catch((err) => {
                console.error('Database Error');
                console.error(err);
                res.send({
                    code: 201,
                    success: false,
                    status: "DATABASE_ERROR",
                    timestamp: new Date()
                });
            });
        } catch (err) {
            res.send(err)
        }
    } else {
        let response = {};
        response.success = false;
        response.code = 201;
        response.Status = "Phone Number Required.";
        res.send(response);
    }
});

// const DecodeJWTforForgotPassword  = (values) => {
//     return new Promise((resolve, reject) => {
//         setImmediate(() => {
//             try {
//                 if(values.jwt != '' && values.jwt != undefined && values.jwt != null){
//                     let DecodedToken = jwt_decode(values.jwt);
//                     resolve(DecodedToken);console.log(DecodedToken);
//                 }else{
//                     reject({ success: false, extras: { msg: "JWT Token Missing." } });
//                 }
//             } catch (error) {
//                 console.error('Something Error');
//                 console.error(error);
//             }
//         });
//     });
// }

const register_associate = catchAsync(async(req, res) => {
    let values = req.body;
    AssociateMandatoryFieldsValidation(values).then((ValidityStatus) => {
        MobileandRenterMobileValidation(values).then((ValidityStatus) => {
            CheckWheatherMobileExistsAlready(values).then((ValidityStatus) => {
                //PasswordandConfirmPasswordValidation(values).then((ValidityStatus) => {
                //PinCodeValidation(values).then((ValidityStatus) => {
                console.log("catch referral", values)
                ValidateReferralIdAndGetReferralData(values).then((ReferralUserData) => {
                    TermsAndConditionsValidation(values).then((ValidityStatus) => {
                        GenerateUniqueUserIdForAssociate().then((GeneratedUID) => {
                            GetLevelZeroData().then((LevelData) => {
                                Register_Associate(req.body, ReferralUserData, GeneratedUID, LevelData).then((Result) => {
                                    //AddReferralPoints(GeneratedUID, ReferralUserData).then(() => {
                                    res.json(Result);
                                    //}).catch(err => {
                                    //     console.log("Error at referral points",err)
                                    //     res.json(err)
                                    // });
                                }).catch(err => {
                                    console.log("Error at register associate", err)
                                    res.json(err)
                                });
                            }).catch(err => {
                                console.log("Error at level zero associate", err)
                                res.json(err)
                            });
                        }).catch(err => {
                            console.log("Error at unique id associate", err)
                            res.json(err)
                        });
                    }).catch(err => {
                        console.log("Error at terms and conditions associate", err)
                        res.json(err)
                    });
                }).catch(err => {
                    console.log("Error at validate referral id", err)
                    res.json(err)
                });
                //}).catch(err => res.json(err));
                //}).catch(err => res.json(err));
            }).catch(err => {
                console.log("Error at mobile exists already associate", err)
                res.json(err)
            });
        }).catch(err => {
            console.log("Error at re enter mobile validation associate", err)
            res.json(err)
        });
    }).catch(err => {
        console.log("Error at mandatory fields validation associate", err)
        res.json(err)
    });
});

const AddReferralPoints = async(GeneratedUID, ReferralUserData) => {
    return new Promise(async(resolve, reject) => {
        try {
            // let PreviousPoints = await Point.findOne().sort('-id').lean().exec();
            // let id = 1;
            // if (PreviousPoints && PreviousPoints.hasOwnProperty('id')) {
            //     id = PreviousPoints.id + 1;
            // } else {
            //     id = id;
            // }
            // let PointsData = {}
            // PointsData.id = id;
            // PointsData.customerUsername = GeneratedUID;
            // PointsData.vendorUsername = "OL00000001";
            // //PointsData.utrnumber = "null";
            // PointsData.points = 50;
            // PointsData.amount = 0;
            // PointsData.status = 0
            // PointsData.createdAt = new Date();
            // PointsData.pointsType = 2; //PayoutTypePoints
            // PointsData.transactionDate = new Date();
            // let SavePointsData = await Point(PointsData).save();
            // PointsData.transactionDate.setMonth(PointsData.transactionDate.getMonth() + 1);
            // let saveSelfPointsNexMonth =  await Point(PointsData).save();

            //ADDING PAIZATTO POINTS
            let PaizattoPreviousPoints = await PaizattoPoints.findOne().sort('-id').lean().exec();
            let id1 = 1;
            if (PaizattoPreviousPoints && PaizattoPreviousPoints.hasOwnProperty('id')) {
                id1 = PaizattoPreviousPoints.id + 1;
            } else {
                id1 = id1;
            }
            let PaizattoPointsData = {}
            PaizattoPointsData.id = id1;
            PaizattoPointsData.customerUsername = GeneratedUID;
            PaizattoPointsData.vendorUsername = "OL00000001";
            //PointsData.utrnumber = "null";
            PaizattoPointsData.points = 50;
            PaizattoPointsData.amount = 0;
            PaizattoPointsData.status = 0
            PaizattoPointsData.createdAt = new Date();
            PaizattoPointsData.pointsType = 2; //PayoutTypePoints
            PaizattoPointsData.transactionDate = new Date();
            let SavePaizattoPointsData = await PaizattoPoints(PaizattoPointsData).save();
            PaizattoPointsData.transactionDate.setMonth(PaizattoPointsData.transactionDate.getMonth() + 1);
            let saveSelfPaizattoPointsNexMonth = await PaizattoPoints(PaizattoPointsData).save();


            if (ReferralUserData && ReferralUserData.hasOwnProperty("username") && ReferralUserData.username != '' && ReferralUserData.username != 'OL00000001') {
                console.log("ReferralUserData", ReferralUserData)
                    // let PreviousPoints = await Point.findOne().sort('-id').lean().exec();
                    // let id = 1;
                    // if (PreviousPoints && PreviousPoints.hasOwnProperty('id')) {
                    //     id = PreviousPoints.id + 1;
                    // } else {
                    //     id = id;
                    // }
                    // let PointsData1 = {}
                    // PointsData1.id = id;
                    // PointsData1.customerUsername = ReferralUserData.username;
                    // PointsData1.vendorUsername = "OL00000001";
                    // //PointsData.utrnumber = "null";
                    // PointsData1.points = 25;
                    // PointsData1.amount = 0;
                    // PointsData1.status = 0
                    // PointsData1.createdAt = new Date();
                    // PointsData1.pointsType = 2; //PayoutTypePoints
                    // PointsData1.transactionDate = new Date();
                    // let SavePointsData = await Point(PointsData1).save();

                //ADDING PAIZATTO POINTS
                let PreviousPaizattoPoints = await PaizattoPoints.findOne().sort('-id').lean().exec();
                let id2 = 1;
                if (PreviousPaizattoPoints && PreviousPaizattoPoints.hasOwnProperty('id')) {
                    id2 = PreviousPaizattoPoints.id + 1;
                } else {
                    id2 = id2;
                }
                let PaizattoPointsData1 = {}
                PaizattoPointsData1.id = id2;
                PaizattoPointsData1.customerUsername = ReferralUserData.username;
                PaizattoPointsData1.vendorUsername = "OL00000001";
                //PointsData.utrnumber = "null";
                PaizattoPointsData1.points = 25;
                PaizattoPointsData1.amount = 0;
                PaizattoPointsData1.status = 0
                PaizattoPointsData1.createdAt = new Date();
                PaizattoPointsData1.pointsType = 3; //Referral Type Points
                PaizattoPointsData1.transactionDate = new Date();
                let SavePaizattoPointsData = await PaizattoPoints(PaizattoPointsData1).save();

            }
            resolve(GeneratedUID, ReferralUserData)
        } catch (error) {
            console.error('Something Error');
            console.error(error);
            reject({
                code: 201,
                success: false,
                status: "DATABASE_ERROR",
                timestamp: new Date()
            });
        }
    });
}

const GetLevelZeroData = () => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                Level.findOne({ 'orderBy': 0 }).lean().exec().then((Result) => {
                    console.log("L0", Result)
                    if (Result && Result != null) {
                        resolve(Result)
                    } else {
                        reject({
                            code: 201,
                            success: false,
                            status: "Level Data Missing",
                            timestamp: new Date()
                        });
                    }

                });
            } catch (error) {
                console.error('Something Error');
                console.error(error);
                reject({
                    code: 201,
                    success: false,
                    status: "DATABASE_ERROR",
                    timestamp: new Date()
                });
            }
        })
    });
}


const GenerateUniqueUserIdForAssociate = () => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                let mysort = { _id: -1 }
                Associate.find().sort(mysort).limit(1).then((Result) => {
                    console.log(Result, "111");
                    if (Result.length > 0) {
                        let LastUID = Result[0].username;
                        let idchars = parseInt(LastUID.slice(2, 10)) + 1;
                        console.log("idchars---------->", idchars);
                        let lengthofdigits = idchars.toString().length;
                        let generatedUIDString = LastUID.slice(-10, 10 - lengthofdigits);
                        let finalStringGenerated = generatedUIDString + idchars;
                        resolve(finalStringGenerated)
                    } else {
                        resolve("A000000001");
                    }

                });
            } catch (error) {
                console.error('Something Error');
                console.error(error);
                reject({
                    code: 201,
                    success: false,
                    status: "DATABASE_ERROR",
                    timestamp: new Date()
                });
            }
        })
    });
}

const Register_Associate = (values, ReferralUserData, GeneratedUID, LevelData) => {
    console.log("LevelData", LevelData);
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                let salt = rand(80, 24);
                let pass = values.Password;
                if (values.Password) {
                    //  values.Password = Math.floor(100000 + Math.random() * 900000);
                } else {
                    values.Password = Math.floor(100000 + Math.random() * 900000).toString();
                }
                if (values.pincode) {

                } else {
                    values.pincode = null;
                }
                var cipher = crypto.createCipher(algorithm, key);
                let cipher1 = crypto.createCipher(algorithm, key);

                let hashedDeepLinkId = cipher1.update(GeneratedUID, 'utf8', 'hex') + cipher1.final('hex');
                let suid = uuid.v4();
                let Data = {
                    uid: suid,
                    username: GeneratedUID,
                    phoneNumber: values.phoneNumber,
                    // firstName: values.firstName,
                    // lastName: values.lastName,
                    firstName: null,
                    lastName: null,
                    Password: cipher.update(values.Password, 'utf8', 'hex') + cipher.final('hex'),
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
                    isVerifyUPI: true //Inorder to skip upi screen we have added this flag while registering associate
                };
                if (values.hasOwnProperty("firstName") && values.firstName != '' && values.firstName != null && values.firstName != undefined) {
                    Data.firstName = values.firstName;
                }
                if (values.hasOwnProperty("lastName") && values.lastName != '' && values.lastName != null && values.lastName != undefined) {
                    Data.lastName = values.lastName;
                }
                let referrer = {};
                if (isEmpty(ReferralUserData)) {
                    //referrer.referraluid = "";
                    referrer.referralid = "";
                    //referrer.referralusername = "";
                    //referrer.referralName = "";
                } else {
                    //referrer.referraluid = ReferralUserData.uid;
                    referrer.referralid = ReferralUserData.username;
                    //referrer.referralusername = ReferralUserData.username;
                    //referrer.referralName = ReferralUserData.firstName + ReferralUserData.lastName;
                }
                Data.referrer = referrer;
                let accessToken = jwt.sign({ username: GeneratedUID }, process.env.TOKEN_SECRET, { expiresIn: "120s" });
                let refreshToken = jwt.sign({ username: GeneratedUID }, process.env.TOKEN_SECRET, { expiresIn: "1d" });
                Associate(Data).save().then((Result) => {
                    console.log("Associate registered success")
                    let templateid = AllConstants.SMSTemplateIds.AssociateSignupSMS;
                    let senderid = AllConstants.SenderId.AssociateSignupSMS;
                    let content = AllConstants.SMSContent.AssociateSignupSMS;
                    content = content.replace("{#var#}", Result.username)
                    content = content.replace("{#var#}", values.Password)
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
                            resolve({
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
                                    isPersonal: Result.isPersonal
                                },
                                timestamp: new Date()
                            });
                        });
                    });
                }).catch((err) => {
                    console.error('Database Error');
                    console.error(err);
                    reject({
                        code: 201,
                        success: false,
                        status: "DATABASE_ERROR",
                        timestamp: new Date()
                    });
                })


            } catch (error) {
                console.error('Something Error');
                console.error(error);
                reject({
                    code: 201,
                    success: false,
                    status: "DATABASE_ERROR",
                    timestamp: new Date()
                });
            }
        });
    });
}

const SendSMSInAssociate = async(templateid, senderid, content, number, message) => {
    let apiurl = process.env.SMSAPI_URL;
    let apikey = process.env.SMS_API_KEY;
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

//This function can be used to check wheather the json object is empty or not, We have to move it to commonfunctions lateron
function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

const CheckWheatherMobileExistsAlready = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                let query = {
                    phoneNumber: values.phoneNumber
                };
                Associate.findOne(query).lean().exec().then((Result) => {
                    if (Result == null) {
                        resolve("Validated Successfully.")
                    } else if (Result != null) {
                        reject({
                            code: 201,
                            success: false,
                            status: "Phone Number Exists Already.",
                            timestamp: new Date()
                        });
                    }
                }).catch((err) => {
                    reject({
                        code: 201,
                        success: false,
                        status: "DATABASE_ERROR",
                        timestamp: new Date()
                    });
                })
            } catch (error) {
                console.error('Something Error');
                console.error(error);
                reject({
                    code: 201,
                    success: false,
                    status: "DATABASE_ERROR",
                    timestamp: new Date()
                });
            }
        });
    });
}

const AssociateMandatoryFieldsValidation = (values) => {
    console.log(values)
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                console.log("Register ASSociate", values.phoneNumber)
                console.log("Register ASSociate", values.ReEnterphoneNumber)
                if (
                    //values.firstName != '' && values.firstName != undefined && values.firstName != null
                    //&& values.lastName != '' && values.lastName != undefined && values.firstName != null
                    //&& 
                    values.phoneNumber != '' && values.phoneNumber != undefined && values.phoneNumber != null &&
                    values.ReEnterphoneNumber != '' && values.ReEnterphoneNumber != undefined && values.ReEnterphoneNumber != null
                    // && values.Password != '' && values.Password != undefined && values.Password != null
                    //&& values.ReEnterpassword != '' && values.ReEnterpassword != undefined && values.ReEnterpassword != null
                    // && values.pincode != '' && values.pincode != undefined && values.pincode != null  
                ) {
                    resolve("Validated Successfully");
                } else {
                    reject({
                        code: 201,
                        success: false,
                        status: "All Fields are Mandatory",
                        timestamp: new Date()
                    });
                }
            } catch (error) {
                console.error('Something Error');
                console.error(error);
                reject({
                    code: 201,
                    success: false,
                    status: "DATABASE_ERROR",
                    timestamp: new Date()
                });
            }
        });
    });
}

const PasswordandConfirmPasswordValidation = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                if (values.Password == values.ReEnterpassword) {
                    resolve("Validated Successfully")
                } else {
                    reject({
                        code: 201,
                        success: false,
                        status: "Passwords Mismatch.",
                        timestamp: new Date()
                    });
                }
            } catch (error) {
                console.error('Something Error');
                console.error(error);
                reject({
                    code: 201,
                    success: false,
                    status: "DATABASE_ERROR",
                    timestamp: new Date()
                });
            }
        });
    });
}

const ValidateReferralIdAPI = catchAsync(async(req, res) => {
    let values = req.body;
    console.log(isNaN(values.ReferralId))
    if (values.hasOwnProperty("ReferralId")) {
        if (typeof(values.ReferralId) == "string" && values.ReferralId.charAt(0) != 'A' && values.ReferralId.charAt(0) != 'O' && values.ReferralId.charAt(0) != 'a' && values.ReferralId.charAt(0) != 'o') {
            values.ReferralId = parseInt(values.ReferralId.toUpperCase())
        }
        console.log("type of values after--->", typeof(values.ReferralId));
        ValidateReferralId(values).then((Result) => {
            res.json(Result);
        }).catch(err => res.json(err));
    } else if (values.hasOwnProperty("phoneNumber")) {
        console.log("Validate ReferralID Check---->", typeof(values.phoneNumber))
        ValidateReferralIdUsingPhoneNumber(values).then((Result) => {
            res.json(Result);
        }).catch(err => res.json(err));
    } else {
        let response = {};
        response.code = 201;
        response.success = false;
        response.message = "Either ReferralId or PhoneNumber is required.";
        response.timestamp = new Date();
        res.send(response);
    }
});

const ValidateReferralUIdAPI = catchAsync(async(req, res) => {
    let values = req.body;
    console.log(req.body.ReferralId);
    if (values.hasOwnProperty("ReferralId")) {
        ValidateReferralUId(values).then((Result) => {
            res.json(Result);
        }).catch(err => res.json(err));
    } else {
        let response = {};
        response.code = 201;
        response.success = false;
        response.message = "ReferralId is required.";
        response.timestamp = new Date();
        res.send(response);
    }
});

const ValidateReferralIdUsingPhoneNumber = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                if (values.phoneNumber) {
                    if (values.phoneNumber != null && values.phoneNumber != undefined) {
                        let query = {
                            phoneNumber: values.phoneNumber
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
                                resolve({
                                    code: 200,
                                    success: true,
                                    data: {
                                        firstName: Result.firstName,
                                        lastName: Result.lastName
                                    },
                                    timestamp: new Date()
                                })
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
                    reject({
                        code: 201,
                        success: false,
                        message: "Invalid ReferralId or Phone Number.",
                        timestamp: new Date()
                    })
                }
            } catch (error) {
                console.error('Something Error');
                console.error(error);
            }
        });
    });
}

const ValidateReferralId = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                if (values.ReferralId) {
                    if (values.ReferralId != null && values.ReferralId != undefined) {
                        let query = {};
                        let typeofReferralId = typeof(values.ReferralId)
                        if (typeofReferralId == "string") {
                            query.username = values.ReferralId.toUpperCase();
                        }
                        if (typeofReferralId == "number") {
                            query.phoneNumber = values.ReferralId
                        }
                        console.log("query-------->", query)
                        Associate.findOne(query).lean().exec().then((Result) => {
                            if (Result == null) {
                                reject({
                                    code: 201,
                                    success: false,
                                    message: "No such user exists.",
                                    timestamp: new Date()
                                })
                            } else if (Result != null) {
                                resolve({
                                    code: 200,
                                    success: true,
                                    data: {
                                        firstName: Result.firstName,
                                        lastName: Result.lastName
                                    },
                                    timestamp: new Date()
                                })
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
                    reject({
                        code: 201,
                        success: false,
                        message: "Invalid ReferralId.",
                        timestamp: new Date()
                    })
                }
            } catch (error) {
                console.error('Something Error');
                console.error(error);
            }
        });
    });
}



const ValidateReferralUId = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                if (values.ReferralId) {
                    console.log(values.ReferralId);
                    if (values.ReferralId != null && values.ReferralId != undefined) {
                        let query = {};
                        let typeofReferralId = typeof(values.ReferralId)
                        if (typeofReferralId == "string") {
                            query.uid = values.ReferralId;
                        }
                        if (typeofReferralId == "number") {
                            query.uid = values.ReferralId
                        }
                        Associate.findOne(query).lean().exec().then((Result) => {
                            if (Result == null) {
                                reject({
                                    code: 201,
                                    success: false,
                                    message: "No such user exists.",
                                    timestamp: new Date()
                                })
                            } else if (Result != null) {
                                resolve({
                                    code: 200,
                                    success: true,
                                    data: {
                                        firstName: Result.firstName,
                                        lastName: Result.lastName,
                                        uid: Result.username
                                    },
                                    timestamp: new Date()
                                })
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
                            message: "Invalid ReferralUId.",
                            timestamp: new Date()
                        })
                    }
                } else {
                    reject({
                        code: 201,
                        success: false,
                        message: "Invalid ReferralUId.",
                        timestamp: new Date()
                    })
                }
            } catch (error) {
                console.error('Something Error');
                console.error(error);
            }
        });
    });
}

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

const MobileandRenterMobileValidation = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                if (values.phoneNumber == values.ReEnterphoneNumber) {
                    resolve("Validated Successfully")
                } else {
                    reject({
                        code: 201,
                        success: false,
                        message: "Phone Numbers Mismatch.",
                        timestamp: new Date()
                    })
                }
            } catch (error) {
                console.error('Something Error');
                console.error(error);
                reject({
                    code: 201,
                    success: false,
                    message: "Invalid ReferralId.",
                    timestamp: new Date()
                })
            }
        });
    });
}

const PinCodeValidation = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                if (!isNaN(values.pincode) && values.pincode.toString().length == 6) {
                    let validate = pinvalidatemodule.validate(values.pincode);
                    if (validate == true) {
                        resolve("Validated Successfully")
                    } else {
                        reject({
                            code: 201,
                            success: false,
                            message: "Invalid Pincode.",
                            timestamp: new Date()
                        })
                    }
                } else {
                    reject({
                        code: 201,
                        success: false,
                        message: "Invalid Pincode.",
                        timestamp: new Date()
                    })
                }
            } catch (error) {
                console.error('Something Error');
                console.error(error);
                reject({
                    code: 201,
                    success: false,
                    message: "Invalid ReferralId.",
                    timestamp: new Date()
                })
            }
        });
    });
}

const TermsAndConditionsValidation = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                if (values.acceptTermsNConditions === true) {
                    resolve("Validated Successfully")
                } else {
                    reject({
                        code: 201,
                        success: false,
                        message: "Terms and Conditions Not Accepted.",
                        timestamp: new Date()
                    })
                }
            } catch (error) {
                console.error('Something Error');
                console.error(error);
                reject({
                    code: 201,
                    success: false,
                    message: "Database Error.",
                    timestamp: new Date()
                })
            }
        });
    });
}

const SendNotification = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.username && values.notificationbody && values.notificationtitle) {
        let UserData = await CheckWheatherUserExists(values);
        //console.log(UserData);
        if (UserData && UserData.hasOwnProperty("fcmToken") && UserData.fcmToken != '' && UserData.fcmToken != null && UserData.fcmToken != undefined) {
            let url = process.env.FCM_NOTIFICATIONURL;
            let requestdata = {
                "to": UserData.fcmToken,
                //"to":"ewR3LUXSR6Sce77yGSpezm:APA91bFfl-2NAS83owzSu9aHbOEa9WjC2JWfOWH5a6f7bHvvqmLuV4DO69TNscGJGeFATQN3sgETfUBOSiQI9AnOEbpNlWWvujrj10cA9V0EEdIuKWsP4vb2iCSgswc0x2096n693KEQ",
                "notification": {
                    "body": values.notificationbody,
                    "title": values.notificationtitle,
                    "sound": "notification.mp3"
                },
                "data": {
                    "body": values.notificationbody,
                    "title": values.notificationtitle,
                    //"key_1" : values.key1,
                    //"key_2" : values.key2
                }
            }
            console.log(UserData.fcmToken)
            await axios.post(url, requestdata, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'key=' + process.env.FIREBASE_SERVER_KEY_ASSOCIATE
                    },
                })
                .then((response) => {
                    let response1 = {};
                    response1.code = 200;
                    response1.success = true;
                    response1.message = "Notification Sent Success.";
                    response1.timestamp = new Date();
                    res.send(response1);
                })
                .catch((error) => {
                    let response1 = {};
                    response1.code = 201;
                    response1.success = false;
                    response1.message = "Sending Notification Error." + error;
                    response1.timestamp = new Date();
                    res.send(response1);
                });
        } else {
            let response = {};
            response.code = 201;
            response.success = false;
            response.message = "Invalid user or Invalid FCM Token";
            response.timestamp = new Date();
            res.send(response);
        }
    } else {
        let response = {};
        response.code = 201;
        response.success = false;
        response.message = "All Fields are Mandatory.";
        response.timestamp = new Date();
        res.send(response);
    }
});

const AutocompletionServiceGetPredictions = catchAsync(async(req, res) => {
    let values = req.body;
    var config = {
        method: 'get',
        url: '',
        headers: {}
    };
    let baseURL1 = "https://maps.googleapis.com/maps/api/place/autocomplete/json?"
    let input = "input=" + values.pincode
    let baseURL2 = "&key=" + process.env.GoogleAPIKEY
    config.url = baseURL1 + input + baseURL2;

    axios(config).then(function(response) {
        res.send(response.data);
    }).catch(function(error) {
        res.send(error);
    });
});

const UpdatePersonalDetailsAssociate = catchAsync(async(req, res) => {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        var decodedHeader = jwt_decode(bearerToken);
        if (decodedHeader.username != null && decodedHeader.username != '' && decodedHeader.username != undefined && decodedHeader.username.length > 9) {
            let username = decodedHeader.username;
            let values = req.body;
            values.username = username;
            if (values.hasOwnProperty("phoneNumber")) {
                delete values.phoneNumber
            }
            if (values.hasOwnProperty("username")) {
                delete values.username
            }
            CheckWheatherUserExists(values).then((UserData) => {
                console.log(values);
                if (values.hasOwnProperty("Bank") && values.Bank.ifsccode != '' && values.Bank.ifsccode != null && values.Bank.ifsccode != undefined) {
                    ValidateIFSCCode(values.Bank).then((BankDetails) => {
                        values.Bank.bankname = BankDetails.BANK;
                        values.Bank.branchname = BankDetails.BRANCH;
                        UpdateAssociatePersonalDetails(values, username, UserData).then((Result) => {
                            res.send(Result);
                        }).catch(err => res.json(err));
                    }).catch(err => res.json(err));
                } else {
                    // values.Bank = {
                    //     accountholdername: "",
                    //     accountnumber: "",
                    //     ifsccode: "",
                    //     bankname: "",
                    //     branchname: "",
                    // }
                    UpdateAssociatePersonalDetails(values, username, UserData).then((Result) => {
                        res.send(Result);
                    }).catch(err => res.json(err));
                }
            }).catch(err => res.json(err));
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

const UpdateAssociatePersonalDetails = (values, username, UserData) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                let query = {
                    username: username
                };
                let passwordSalt = UserData.PasswordSalt;
                if (values.hasOwnProperty("firstName") || values.hasOwnProperty("lastName") || values.hasOwnProperty("phoneNumber") ||
                    values.hasOwnProperty("Gender") || values.hasOwnProperty("DOB") || values.hasOwnProperty("Address")
                ) {
                    values.isPersonal = true;
                }
                if (values.hasOwnProperty("UPI")) {
                    let UPIKeys = [];
                    for (var k in values.UPI) UPIKeys.push(k);
                    for (each in UPIKeys) {
                        if (values.UPI[UPIKeys[each]] != "") {
                            var cipher = crypto.createCipher(algorithm, key);
                            //values.UPI[UPIKeys[each]] = crypto.createHash('sha512').update(values.UPI[UPIKeys[each]]).digest("hex");
                            values.UPI[UPIKeys[each]] = cipher.update(values.UPI[UPIKeys[each]], 'utf8', 'hex') + cipher.final('hex');
                        }
                    }
                    values.isVerifyUPI = true;
                }
                if (values.hasOwnProperty("Bank")) {
                    let BankKeys = [];
                    for (var k in values.Bank) BankKeys.push(k);
                    for (each in BankKeys) {
                        if (values.Bank[BankKeys[each]] != "") {
                            var cipher = crypto.createCipher(algorithm, key);
                            //values.Bank[BankKeys[each]] = crypto.createHash('sha512').update(values.Bank[BankKeys[each]]).digest("hex");
                            values.Bank[BankKeys[each]] = cipher.update(values.Bank[BankKeys[each]], 'utf8', 'hex') + cipher.final('hex');
                        }
                    }
                    values.isBank = true;
                }
                if (values.hasOwnProperty("DOB")) {
                    console.log(typeof(values.DOB));
                    values.DOB = my_date(values.DOB);
                }
                values.lastModifiedBy = username;
                Associate.updateOne(query, values).lean().exec().then((UpdateStatus) => {
                    resolve({
                        code: 200,
                        success: true,
                        message: "Associate Personal Details Updated Success.",
                        timestamp: new Date()
                    })
                }).catch((err) => {
                    console.log(err);
                    reject({
                        code: 201,
                        success: false,
                        message: "DATABASE_ERROR.",
                        timestamp: new Date()
                    });
                })
            } catch (error) {
                console.error('Something Error');
                console.error(error);
                reject({
                    code: 201,
                    success: false,
                    message: "DATABASE_ERROR.",
                    timestamp: new Date()
                });
            }
        });
    });
}

function my_date(date_string) {
    var date_components = date_string.split("/");
    var day = date_components[0];
    var month = date_components[1];
    var year = date_components[2];
    return new Date(year, month - 1, day);
}

const UpdateAssociateKYC = catchAsync(async(req, res) => {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        var decodedHeader = jwt_decode(bearerToken);
        if (decodedHeader.username != null && decodedHeader.username != '' && decodedHeader.username != undefined && decodedHeader.username.length > 9) {
            let username = decodedHeader.username;
            let values = {};
            let UpdatableData = {};
            values.username = username;
            let UserData = await CheckWheatherUserExists(values);
            let files = req.files;
            let body = req.body;
            console.log(Object.hasOwnProperty.bind(body)('aadharNo'));
            console.log(Object.hasOwnProperty.bind(body)('panNo'));
            if (files.aadhar) {
                const { buffer, originalname } = files.aadhar[0];
                let aadharPATH = await imageUpload.upload(buffer, originalname);
                if (Object.hasOwnProperty.bind(body)('aadharNo')) {
                    UpdatableData.aadharNo = req.body.aadharNo;
                    UpdatableData.aadharPath = aadharPATH.Location;
                }
            }
            if (files.pan) {
                const { buffer, originalname } = files.pan[0];
                let panPATH = await imageUpload.upload(buffer, originalname);
                if (Object.hasOwnProperty.bind(body)('panNo')) {
                    UpdatableData.panNo = req.body.panNo.toUpperCase();
                    UpdatableData.panPath = panPATH.Location;
                }
            }
            let query = {
                username: UserData.username
            }

            let changes = {
                $set: UpdatableData
            }
            Associate.updateOne(query, changes).lean().exec().then((UpdateStatus) => {
                res.json({
                    code: 200,
                    success: true,
                    message: "KYC Update Success.",
                    timestamp: new Date()
                });
            }).catch((err) => {
                res.json({
                    success: false,
                    code: 201,
                    Status: "Database Error",
                    Data: {

                    },
                    "timestamp": new Date()
                })
            });
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


const GetBankDetailsWithIFSC = catchAsync(async(req, res) => {
    let values = req.body;
    ValidateIFSCCode(values).then((Result) => {
        res.send(Result);
        console.log(Result);
    }).catch(err => res.json(err));
});

const ValidateIFSCCode = (values) => {
    console.log("valu", values);
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                let ifsccode = values.ifsccode;
                console.log("ifsccode------>", ifsccode);
                if (ifsccode != '' && ifsccode != null && ifsccode != undefined) {
                    let validateIFSCcode = ifsc.validate(ifsccode);
                    console.log("validateIFSCcode", validateIFSCcode);
                    if (validateIFSCcode) {
                        ifsc.fetchDetails(ifsccode).then(function(res) {
                            resolve(res)
                        });
                    } else {
                        reject({
                            code: 201,
                            success: false,
                            message: "Invalid IFSC Code..",
                            timestamp: new Date()
                        });
                    }
                } else {
                    reject({
                        code: 201,
                        success: false,
                        message: "IFSC Code required or Invalid.",
                        timestamp: new Date()
                    });
                }
            } catch (error) {
                console.error('Something Error');
                console.error(error);
                reject({
                    code: 201,
                    success: false,
                    message: "DATABASE_ERROR.",
                    timestamp: new Date()
                });
            }
        });
    });
}

const GetAssociateDetails = catchAsync(async(req, res) => {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        var decodedHeader = jwt_decode(bearerToken);
        console.log("decoded header---",decodedHeader);
        if (decodedHeader.username != null && decodedHeader.username != '' && decodedHeader.username != undefined && decodedHeader.username.length > 9) {
            let username = decodedHeader.username;
            let Result = await GetAssociateDetailsWithUserName(username);
            let NewResult = await GetUserActiveInactiveData(Result);
            let response = {};
            response.code = 200;
            response.success = true;
            response.message = "User Data Retrieved.";
            response.Data = NewResult,
                response.timestamp = new Date();
            res.send(response);
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

const GetUserActiveInactiveData = (value) => {
    console.log(value);
    return new Promise(async(resolve, reject) => {
        // setImmediate(() => {
        try {
            //let activeCount = 0, inActiveCount = 0;
            const transactions = await Transactions.find({ username: value.username })
                // console.log({transactions})
                // console.log(value.Levels[value.Levels.length - 1])
            console.log(value.username);
            let minValue = value.Levels[value.Levels.length - 1];
            const filteredArray = transactions.filter((t) => {
                    return new Date(t.transactionDate).getMonth() === new Date().getMonth()
                })
                //console.log("value", value);
                //console.log("minValue", minValue)
            if (filteredArray.length > 0) {
                let sum = filteredArray.reduce((prev, next) => {
                        return { point: prev.point + next.point }
                    })
                    //console.log("value", value.username);
                    //console.log("sum.point", sum.point)
                if (sum.point >= minValue.min) {
                    value.statusName = "Active"
                    value.status = 1;
                } else {
                    value.statusName = "Inactive"
                    value.status = 2;
                }


            } else {
                value.statusName = "Inactive"
                value.status = 2;
            }
            if (value.parentid == "") {
                value.statusName = "New User"
                value.status = 0;
            }
            resolve(value);
            //   else {
            //       inActiveCount++;
            //   }
            //if (index === array.length - 1) 
        } catch (error) {
            console.error('Something Error');
            console.error(error);
            reject({
                success: false,
                code: 201,
                Status: "Username Doesn't Exist.1",
                "timestamp": new Date()
            });
        }
        // });
    });
}

const GetUserActiveInactiveDataGenealogy = (values) => {
    return new Promise(async(resolve, reject) => {
        // setImmediate(() => {
        try {
            if (values.hasOwnProperty("username") && values.hasOwnProperty("Levels") && values.Levels.length > 0) {
                let minimumvalue = values.Levels[values.Levels.length - 1].min;
                //console.log("minimum value ----->",minimumvalue);
                //values.minimumvalue = minimumvalue;
                let year = new Date().getFullYear();
                let month = new Date().getMonth() + 1;
                let startDate = new Date(year, month - 1, 01)
                let endDate = new Date(year, month, 1);
                let query = {}
                query.username = values.username;
                query.transactionDate = { $gte: startDate, $lte: endDate }
                    //console.log("query is--->",query);
                let transactions = await Transactions.aggregate([{
                        $match: query
                    },
                    {
                        $group: {
                            _id: "$username",
                            count: {
                                $sum: "$point"
                            }
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            count: 1
                        }
                    }
                ]);
                if (transactions.length > 0 && transactions[0].hasOwnProperty("count") && transactions[0].count >= minimumvalue) {
                    values.statusName = "approved"
                    values.status = 1;
                } else {
                    values.statusName = "pending"
                    values.status = 2;
                }
                resolve(values);
            } else {
                reject({
                    success: false,
                    code: 201,
                    Status: "Username or LevelData Invalid ",
                    values,
                    "timestamp": new Date()
                });
            }
        } catch (error) {
            console.error('Something Error');
            console.error(error);
            reject({
                success: false,
                code: 201,
                Status: "Username Doesn't Exist.1",
                "timestamp": new Date()
            });
        }
        // });
    });
}

const GetAssociateDetailsWithUserName = (username) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                var query = {
                    username: username
                }
                Associate.findOne(query).lean().exec().then((Result) => {
                    if (Result != null && Result != '' && Result != undefined) {
                        if (Result.hasOwnProperty("UPI")) {
                            for (each in Result["UPI"]) {
                                if (Result["UPI"][each] != "") {
                                    var decipher = crypto.createDecipher(algorithm, key);
                                    Result["UPI"][each] = decipher.update(Result["UPI"][each], 'hex', 'utf8') + decipher.final('utf8');
                                }
                            }
                            let UPINew = [];
                            var UPIkeys = [];
                            for (var k in Result.UPI) UPIkeys.push(k);
                            for (eachKey in UPIkeys) {
                                if (Result.UPI[UPIkeys[eachKey]] != '') {
                                    let eachJSON = {};
                                    eachJSON["upi_key"] = UPIkeys[eachKey];
                                    eachJSON["upi_id"] = Result.UPI[UPIkeys[eachKey]];
                                    UPINew.push(eachJSON);
                                }
                            }
                            Result.UPI = UPINew;
                        }
                        if (Result.hasOwnProperty("Bank")) {
                            for (each in Result["Bank"]) {
                                if (Result["Bank"][each] != "") {
                                    var decipher = crypto.createDecipher(algorithm, key);
                                    Result["Bank"][each] = decipher.update(Result["Bank"][each], 'hex', 'utf8') + decipher.final('utf8');
                                }
                            }
                        }
                        if (Result.hasOwnProperty("DOB")) {
                            let dob = new Date(Result.DOB);
                            let dd = dob.getDate();
                            let mm = dob.getMonth() + 1;
                            let yyyy = dob.getFullYear();
                            if (dd < 10) {
                                dd = '0' + dd;
                            }

                            if (mm < 10) {
                                mm = '0' + mm;
                            }
                            Result.DOB = dd + '/' + mm + '/' + yyyy;
                        }
                        if (Result.hasOwnProperty("status")) {
                            Result.statusName = "";
                            if (Result.status === 0) {
                                Result.statusName = "new user";
                            }
                            // else if(Result.status === 1) 
                            // {
                            //     Result.statusName = "Active";
                            // } 
                            // else if(Result.status === 2) 
                            // {
                            //     Result.statusName = "Inactive";
                            // } 
                            // else
                            // {
                            //     Result.statusName = "Blocked";
                            // } 
                        }
                        console.log("Result.statusName------->", Result.statusName);
                        let response = {};
                        response.code = 200;
                        response.success = true;
                        response.message = "User Data Retrieved.";
                        response.Data = Result,
                            response.timestamp = new Date();
                        resolve(Result)
                    } else {
                        reject({
                            success: false,
                            code: 201,
                            Status: "Username Doesn't Exist.3",
                            "timestamp": new Date()
                        });
                    }
                }).catch((err) => {console.log("error here---",err)
                    reject({
                        success: false,
                        code: 201,
                        Status: "Username Doesn't Exist.2",
                        "timestamp": new Date()
                    });
                })
            } catch (error) {
                console.error('Something Error');
                console.error(error);
                reject({
                    success: false,
                    code: 201,
                    Status: "Username Doesn't Exist.1",
                    "timestamp": new Date()
                });
            }
        });
    });
}

const UpdateAssociatePassword = catchAsync(async(req, res) => {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        var decodedHeader = jwt_decode(bearerToken);

        if (decodedHeader.username != null && decodedHeader.username != '' && decodedHeader.username != undefined && decodedHeader.username.length > 9) {
            let username = decodedHeader.username;
            let values = req.body;
            console.log(username);
            values.username = username;
            CheckWheatherUserExists(values).then((UserData) => {
                ValidateUserPassword(values, UserData).then((Result) => {
                    res.send(Result);
                }).catch(err => res.json(err));
            }).catch(err => res.json(err));
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

const ValidateUserPassword = (values, UserData) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                let CurrentPassword = values.CurrentPassword;
                let NewPasword = values.NewPasword;
                let SavedPassword = UserData.Password;
                let PasswordSalt = UserData.PasswordSalt;
                var previouspasswords = UserData.LastPassword;
                let cipher = crypto.createCipher(algorithm, key);
                let CurrentPasswordHash = cipher.update(CurrentPassword, 'utf8', 'hex') + cipher.final('hex')
                    //crypto.createHash('sha512').update(CurrentPassword + PasswordSalt).digest("hex");
                console.log(NewPasword);
                console.log(typeof(NewPasword))
                let cipher1 = crypto.createCipher(algorithm, key);
                let NewPasswordHash = cipher1.update(NewPasword, 'utf8', 'hex') + cipher1.final('hex')
                    //crypto.createHash('sha512').update(NewPasword + PasswordSalt).digest("hex");
                console.log("previouspasswords---->", previouspasswords);
                previouspasswords.push(CurrentPasswordHash);
                if (CurrentPassword != '' && CurrentPassword != null && CurrentPassword != undefined &&
                    NewPasword != '' && NewPasword != null && NewPasword != undefined
                ) {
                    if (CurrentPassword == NewPasword) {
                        reject({
                            code: 201,
                            success: false,
                            message: "Old and New Password should not be same.",
                            timestamp: new Date()
                        });
                    } else {
                        if (CurrentPasswordHash == SavedPassword) {
                            let query = {
                                username: UserData.username
                            }
                            let changes = {
                                $set: {
                                    Password: NewPasswordHash,
                                    LastPassword: previouspasswords
                                }
                            }
                            console.log("Update");
                            Associate.updateOne(query, changes).lean().exec().then((UpdateStatus) => {
                                resolve({
                                    code: 200,
                                    success: true,
                                    message: "Password Update Success.",
                                    timestamp: new Date()
                                });
                            }).catch((err) => {
                                console.log(err)
                                reject({ success: false, extras: { msg: ApiMessages.DATABASE_ERROR } });
                            })
                        } else {
                            reject({
                                code: 201,
                                success: false,
                                message: "Password Doesn't Match.",
                                timestamp: new Date()
                            });
                        }
                    }
                } else {
                    reject({
                        code: 201,
                        success: false,
                        message: "All Password Fields are Mandatory.",
                        timestamp: new Date()
                    });
                }
            } catch (error) {
                console.error('Something Error');
                console.error(error);
                reject({
                    code: 201,
                    success: false,
                    message: "DATABASE_ERROR.",
                    timestamp: new Date()
                });
            }
        });
    });
}

const VerifyPhoneNumberExistsAlready = catchAsync(async(req, res) => {
    let values = req.body;
    CheckPhoneNumberExistsAlready(values).then((Result) => {
        res.send(Result);
    }).catch(err => res.json(err));
});

const CheckPhoneNumberExistsAlready = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                let query = {
                    phoneNumber: values.phoneNumber
                };
                Associate.findOne(query).lean().exec().then((Result) => {
                    if (Result && Result != null && Result != undefined) {
                        resolve({
                            success: true,
                            code: 200,
                            Status: "Phone Number Exists Already with + ." + Result.username,
                            "timestamp": new Date()
                        })
                    } else {
                        resolve({
                            success: false,
                            code: 201,
                            Status: "Phone Number Doesn't Exist.",
                            "timestamp": new Date()
                        })
                    }
                }).catch((err) => {
                    console.log(err);
                    reject({
                        success: false,
                        code: 201,
                        Status: "Database Error",
                        Data: {

                        },
                        "timestamp": new Date()
                    });
                })
            } catch (error) {
                console.error('Something Error');
                console.error(error);
                reject({
                    success: false,
                    code: 201,
                    Status: "Database Error",
                    Data: {

                    },
                    "timestamp": new Date()
                });
            }
        });
    });
}

//LoginAssociate
const LoginAssociate = catchAsync(async(req, res) => {
    let values = req.body;
    CheckWheatherUserExists(values).then((UserData) => {
        console.log("User data", UserData);
        ValidateUserPasswordForLogin(values, UserData).then((Result) => {
            res.send(Result);
            console.log(Result);
        }).catch(err => res.json(err));
    }).catch(err => res.json(err));
});

const OTPLoginAssociate = catchAsync(async(req, res) => {
    let values = req.body;
    CheckWheatherUserExists(values).then((UserData) => {
        console.log("User data", UserData);
        if (UserData.status == 0 || UserData.status == 1 || UserData.status == 2 || UserData.status == 3) {
            let accessToken = jwt.sign({ username: UserData.username }, process.env.TOKEN_SECRET, { expiresIn: "120s" });
            let refreshToken = jwt.sign({ username: UserData.username }, process.env.TOKEN_SECRET, { expiresIn: "1d" });
            res.send({
                success: true,
                code: 200,
                accessToken: accessToken,
                refreshToken: refreshToken,
                Data: {
                    username: UserData.username,
                    isVerifyUPI: UserData.isVerifyUPI,
                    isBank: UserData.isBank,
                    isPersonal: UserData.isBank,
                    status: UserData.status
                }
            })
        } else {
            res.send({
                code: 201,
                success: false,
                message: "User Blocked.",
                timestamp: new Date()
            });
        }
    }).catch(err => res.json(err));
});

const CheckWheatherUserExists = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                var query = {};
                if (values.hasOwnProperty("username")) {
                    query = {
                        username: values.username.toUpperCase()
                    }
                }
                if (values.hasOwnProperty("phoneNumber")) {
                    query = {
                        phoneNumber: values.phoneNumber
                    }
                }
                Associate.findOne(query).lean().exec().then((Result) => {
                    if (Result) {
                        resolve(Result)
                    } else {
                        reject({
                            success: false,
                            code: 201,
                            Status: "Phone Number or Username Doesn't Exist.",
                            "timestamp": new Date()
                        });
                    }
                }).catch((err) => {
                    reject({
                        success: false,
                        code: 201,
                        Status: "Phone Number or Username Doesn't Exist.",
                        "timestamp": new Date()
                    });
                })
            } catch (error) {
                console.error('Something Error');
                console.error(error);
                reject({
                    success: false,
                    code: 201,
                    Status: "Phone Number or Username Doesn't Exist.",
                    "timestamp": new Date()
                });
            }
        });
    });
}

const ValidateUserPasswordForLogin = (values, UserData) => {
        return new Promise((resolve, reject) => {
            setImmediate(() => {
                try {
                    if (values.Password != '' && values.Password != null && values.Password != undefined) {
                        let password = values.Password;
                        let PasswordSalt = UserData.PasswordSalt;
                        //console.log("Password",password);
                        var decipher = crypto.createDecipher(algorithm, key);
                        let SavedPassword = UserData.Password;

                        let encryptedPassword = decipher.update(SavedPassword, 'hex', 'utf8') + decipher.final('utf8');

                        //console.log("Saved Passwor",AllConstants.Universals.VendorUniversalPassword, password, encryptedPassword)
                        if (encryptedPassword == password || password == AllConstants.Universals.VendorUniversalPassword) {
                            console.log("UserData  ", UserData.status)
                            if (UserData.status == 0 || UserData.status == 1 || UserData.status == 2 || UserData.status == 3) {
                                let accessToken = jwt.sign({ username: UserData.username }, process.env.TOKEN_SECRET, { expiresIn: "120s" });
                                let refreshToken = jwt.sign({ username: UserData.username }, process.env.TOKEN_SECRET, { expiresIn: "1d" });
                                resolve({
                                    success: true,
                                    code: 200,
                                    accessToken: accessToken,
                                    refreshToken: refreshToken,
                                    Data: {
                                        username: UserData.username,
                                        isVerifyUPI: UserData.isVerifyUPI,
                                        isBank: UserData.isBank,
                                        isPersonal: UserData.isBank,
                                        status: UserData.status
                                    }
                                })
                            } else {
                                reject({
                                    code: 201,
                                    success: false,
                                    message: "User Blocked.",
                                    timestamp: new Date()
                                });
                            }
                        } else {
                            reject({
                                code: 201,
                                success: false,
                                message: "Incorrect Password.",
                                timestamp: new Date()
                            });
                        }
                    } else {
                        reject({
                            code: 201,
                            success: false,
                            message: "Please provide a valid password.",
                            timestamp: new Date()
                        });
                    }
                } catch (error) {
                    console.error('Something Error');
                    console.error(error);
                    reject({
                        code: 201,
                        success: false,
                        message: "DATABASE_ERROR.",
                        timestamp: new Date()
                    });
                }
            });
        });
    }
    //GetAssociateLevelInformation
const GetAssociateLevelInformation = catchAsync(async(req, res) => {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        var decodedHeader = jwt_decode(bearerToken);

        if (decodedHeader.username != null && decodedHeader.username != '' && decodedHeader.username != undefined && decodedHeader.username.length > 9) {
            let username = decodedHeader.username;
            let values = req.body;
            console.log(username);
            values.username = username;
            CheckWheatherUserExists(values).then((UserData) => {
                let nextOrder = UserData.Levels[UserData.Levels.length - 1].orderBy;
                GetLevelInfo({ orderBy: nextOrder + 1 }).then((LevelData) => {
                    res.send({
                        code: 200,
                        success: true,
                        currentLevel: UserData.Levels[UserData.Levels.length - 1],
                        upgradedlevels: UserData.Levels,
                        nexteligiblelevel: LevelData
                    });
                }).catch(err => res.json(err));
            }).catch(err => res.json(err));
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

//UpgradeLevel
const UpgradeLevel = catchAsync(async(req, res) => {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        var decodedHeader = jwt_decode(bearerToken);

        if (decodedHeader.username != null && decodedHeader.username != '' && decodedHeader.username != undefined && decodedHeader.username.length > 9) {
            let username = decodedHeader.username;
            let values = req.body;
            values.username = username;
            CheckWheatherUserExists(values).then((UserData) => {
                let nextOrder = UserData.Levels[UserData.Levels.length - 1].orderBy;
                GetLevelInfo({ orderBy: nextOrder + 1 }).then((LevelData) => {
                    console.log("LevelData", LevelData);
                    if (LevelData.hasOwnProperty("name") && LevelData.name != '' && LevelData.name != null && LevelData.name != undefined) {
                        UpgradeLevelAssociate(values, LevelData, UserData).then((Result) => {
                            res.send(Result);
                        }).catch(err => res.json(err));
                    } else {
                        let response = {};
                        response.code = 201;
                        response.success = false;
                        response.message = "User Already At Max Level.";
                        response.timestamp = new Date();
                        res.send(response);
                    }
                }).catch(err => res.json(err));
            }).catch(err => res.json(err));
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

const GetLevelInfo = (values) => {
    console.log("Get level infor----", values);
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                let query = values;
                Level.findOne(query).lean().exec().then((Result) => {
                    if (Result && Result != null && Result != undefined) {
                        resolve(Result)
                    } else {
                        resolve({
                            success: false,
                            code: 201,
                            Status: "Invalid Level ID.",
                            "timestamp": new Date()
                        })
                    }
                }).catch((err) => {
                    console.log("level find error", err);
                    reject({
                        success: false,
                        code: 201,
                        Status: "Database Error",
                        Data: {

                        },
                        "timestamp": new Date()
                    });
                })
            } catch (error) {
                console.error('Something Error');
                console.error(error);
                reject({
                    success: false,
                    code: 201,
                    Status: "Database Error",
                    Data: {

                    },
                    "timestamp": new Date()
                });
            }
        });
    });
}

const UpgradeLevelAssociate = (values, LevelData, UserData) => {
    //console.log("")
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                LevelData.UpdatedTime = new Date();
                let query = {
                    username: values.username
                };
                let changes = {
                    $push: {
                        Levels: LevelData
                    }
                }
                Associate.updateOne(query, changes).lean().exec().then((UpdateStatus) => {
                    resolve({
                        code: 200,
                        success: true,
                        message: "Level Upgrade Success.",
                        timestamp: new Date()
                    });
                }).catch((err) => {
                    console.log(err);
                    reject({
                        success: false,
                        code: 201,
                        Status: "Database Error",
                        Data: {

                        },
                        "timestamp": new Date()
                    })
                });
            } catch (error) {
                console.error('Something Error');
                console.error(error);
                reject({
                    success: false,
                    code: 201,
                    Status: "Database Error",
                    Data: {

                    },
                    "timestamp": new Date()
                });
            }
        });
    });
}

const GetAllVendors = catchAsync(async (req, res) => {
    try {
        let values = req.body;
        console.log("values", values)
        let query = {};
        if (values.hasOwnProperty("pincode")) {
            query["Address.pincode"] = values.pincode
        }
        if (values.hasOwnProperty("city")) {
            query["Address.city"] = values.city
        }

        if (values.hasOwnProperty("product")) {
            let reqProducts = values.product.split(",");
            query["Product"] = { $elemMatch: { name: reqProducts } } 
        } 
        if (values.hasOwnProperty("location")) {
            if (values.location.hasOwnProperty("maxDistance") && values.location.maxDistance > 6000) {
                values.location.maxDistance = 1000000;
            }
            query["Address.geometry.coordinates"] = {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(values.location.coordinate1), parseFloat(values.location.coordinate2)],
                    },
                    $maxDistance: values.location.maxDistance, // + 1000, // adding 1km to search query just as a precaution, we are anyway going to remove these results using google distance api 
                    $minDistance: 0,
                }
            }
            console.log("Address.geometry.coordinates", query["Address.geometry"])
        }

        if (values.hasOwnProperty("Membership")) {
            query["Membership.id"] = values.Membership
        }
        // if(values.hasOwnProperty("Package")){
        //     let reqPackages = values.Package.split(",");
        //     console.log("RE PACKAGES",reqPackages)
        //     query = {
        //         "Package":{$elemMatch:{name:reqPackages}}
        //     }
        // }
        if (values.hasOwnProperty("delivery")) {
            query.delivery = values.delivery;
        }

        if (values.hasOwnProperty("shopName")) {
            query.$or = [{ firstName: { $regex: values.shopName, $options: 'i' } }, { lastName: { $regex: values.shopName, $options: 'i' } }];
        }
        let primarycategories = []
        if (values.hasOwnProperty("primaryCategory")) {
            let categories = await Categories.find({ primaryCategory: values.primaryCategory }, { '_id': 0, 'id': 1 }).lean().exec();
            if (categories && categories.length > 0) {
                for (each in categories) {
                    primarycategories.push(parseInt(categories[each].id))
                }
            }
        }
        if (values.hasOwnProperty("category")) {
            let reqCategories = values.category.split(',');
            for (each in reqCategories) {
                reqCategories[each] = parseInt(reqCategories[each])
            }
            console.log("reqCategories-----", reqCategories)
            let newPrimaryCategories = [];
            if (primarycategories.length > 0) {
                for (each in primarycategories) {
                    console.log("reqCategories.indexOf(primarycategories[each])", reqCategories.indexOf(primarycategories[each]))
                    if (reqCategories.indexOf(primarycategories[each]) > -1) {
                        newPrimaryCategories.push(primarycategories[each])
                    }
                }
            } else {
                query["Category"] = { $elemMatch: { id: reqCategories } }
            }
            console.log("newPrimaryCategories---->", newPrimaryCategories)
            if (newPrimaryCategories.length > 0) {
                query["Category"] = { $elemMatch: { id: newPrimaryCategories } }
            }
        } else {
            if (primarycategories.length > 0) {
                query["Category"] = { $elemMatch: { id: primarycategories } }
            }
        }
        console.log("primarycategories---->", primarycategories)
        console.log("query at category calll---->", query)
        console.log("query at category calll---->", query["Category"])

        query.kycStatus = 0;
        //Limit and Skip Record's Logic
        let limit = 20;
        let extras = 5; // Extras because we are going to remove some records using google distance api
        let skip = 0;
        if (values.hasOwnProperty("page")) {
            if (values.page > 0) {
                skip = skip + (limit * (values.page));
            }
        }
        let allMembership = await adminController.GetAllMemberships();
        let allArea = await adminController.GetAllAreas();
        let allCategories = await adminController.GetAllCategoriesForListAllVendor();
        try {
            let Result = await Vendor.find(query).limit(limit + extras).skip(skip).lean().exec();
            console.log("query----->", query)
            if (Result) {
                console.log("Result------->", Result.length)
                if (Result && Result.length > 0) {
                    for (each in Result) {
                        if (Result[each].hasOwnProperty("status")) {
                            if (Result[each].status === 0) {
                                Result[each].StatusName = "Approved";
                            } else if (Result[each].status === 1) {
                                Result[each].StatusName = "Pending";
                            } else if (Result[each].status === 2) {
                                Result[each].StatusName = "New User";
                            } else if (Result[each].status === 3) {
                                Result[each].StatusName = "Rejected";
                            } else if (Result[each].status === 4) {
                                Result[each].StatusName = "Blocked";
                            }
                        }
                        if (Result[each].hasOwnProperty("kycStatus")) {
                            if (Result[each].kycStatus == 0) {
                                Result[each].kycStatusName = "Approved";
                            }
                            if (Result[each].kycStatus == 1) {
                                Result[each].kycStatusName = "Pending";
                            }
                            if (Result[each].kycStatus == 2) {
                                Result[each].kycStatusName = "Rejected";
                            }
                            if (Result[each].kycStatus == 3) {
                                Result[each].kycStatusName = "Re-work";
                            }
                        }

                        if (Result[each].hasOwnProperty("Category")) {
                            for (each1 in Result[each]["Category"]) {
                                Result[each]["Category"][each1] = allCategories[Result[each]["Category"][each1].id];
                                //console.log(Result[each]["Category"][each])
                            }
                        }
                        if (Result[each].hasOwnProperty("area") && Result[each].area.hasOwnProperty("id") && Result[each].area.id != null) {
                            Result[each].area = allArea[Result[each].area.id];
                            //console.log(Result[each].area)
                        }
                        if (Result[each].hasOwnProperty("Membership") && Result[each].Membership.hasOwnProperty("id") && Result[each].Membership.id != null) {
                            Result[each].Membership = allMembership[Result[each].Membership.id];
                        }
                    }
                }

                let responseData = Result;
                if (Result.length > 0 && values.hasOwnProperty("location") && values.location.hasOwnProperty("coordinate1") && values.location.hasOwnProperty("coordinate2") && values.location.coordinate1 != "" && values.location.coordinate2 != "") {

                    let source = [`${parseFloat(values.location.coordinate1)},${parseFloat(values.location.coordinate2)}`];
                    let destinations = [];
                    for (each in Result) {
                        destinations.push(`${Result[each].Address.geometry.coordinates[0]},${Result[each].Address.geometry.coordinates[1]}`);
                    }
                    //! MAX 25 SOURCE && 25 DESTINATIONS
                    distanceApi.matrix(source, destinations, function (err, distances) {
                        if (!err && distances.hasOwnProperty("rows") && distances.rows.length > 0 && distances.rows[0].hasOwnProperty("elements")) {
                            let finalResult = [];

                            for (let i = 0; i < distances.rows[0].elements.length; i++) {
                                if (distances.rows[0].elements[i].status === "OK") {
                                    responseData[i]['google_distance'] = distances.rows[0].elements[i].distance.value;
                                }
                                else {
                                    responseData[i]['google_distance'] = 10000000
                                }
                            }
                            responseData = responseData.slice().sort((a, b) => {
                                return a.google_distance - b.google_distance;
                            });

                            for (let i = 0; i < responseData.length; i++) {
                                if (responseData[i].google_distance <= values.location.maxDistance) {
                                    finalResult.push(responseData[i]);
                                }
                            }

                            console.log("prevResult---->", Result.length)
                            responseData = finalResult;
                            // if responseData have more than 20 then send only first 20
                            if (responseData.length > limit) {
                                responseData = responseData.slice(0, limit);
                            }
                            console.log("finalResult---->", responseData.length)
                            return res.send({
                                success: true,
                                code: 200,
                                Status: "Vendor Data Retrieved Success.",
                                Data: responseData,
                                "timestamp": new Date()
                            });
                        }
                        else if (!err) {
                            return res.send({
                                success: true,
                                code: 200,
                                Status: "Vendor Data Retrieved Success.",
                                Data: responseData,
                                "timestamp": new Date()
                            });
                        }
                        else {
                            return res.send({
                                success: false,
                                code: 201,
                                Status: "Error in Retrieving.",
                                "timestamp": new Date()
                            });
                        }
                    });
                }
                else {
                    // if responseData have more than 20 then send only first 20
                    if (responseData.length > limit) {
                        responseData = responseData.slice(0, limit);
                    }
                    return res.send({
                        success: true,
                        code: 200,
                        Status: "Vendor Data Retrieved Success.",
                        Data: responseData,
                        "timestamp": new Date()
                    })
                }
            } else {
                return res.send({
                    success: false,
                    code: 201,
                    Status: "Error in Retrieving.",
                    "timestamp": new Date()
                });
            }
        } catch (err) {
            console.log(err);
            return res.send({
                success: false,
                code: 201,
                Status: "Database Error.",
                "timestamp": new Date()
            });
        }
    } catch (err) {
        return res.send({
            success: false,
            code: 201,
            Status: err,
            "timestamp": new Date()
        })
    }
});

const GetUserPointsInformation = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                let query = {};
                query.customerUsername = values.username;
                let project = {
                    '_id': 0,
                    'vendorUsername': 0,
                    'customerUsername': 0,
                    '_v': 0
                }
                Point.find(query, project).lean().exec().then((Result) => {
                    if (Result) {
                        resolve(Result)
                    } else {
                        reject({
                            success: false,
                            code: 201,
                            Status: "Database Error.",
                            "timestamp": new Date()
                        });
                    }
                }).catch((err) => {
                    reject({
                        success: false,
                        code: 201,
                        Status: "Database Error.",
                        "timestamp": new Date()
                    });
                })
            } catch (error) {
                console.error('Something Error');
                console.error(error);
                reject({
                    success: false,
                    code: 201,
                    Status: "Database Error.",
                    "timestamp": new Date()
                });
            }
        });
    });
}

const groupBy = (array, key) => {
    // Return the end result
    return array.reduce((result, currentValue) => {
        // If an array already present for key, push it to the array. Else create an array and push the object
        (result[currentValue[key]] = result[currentValue[key]] || []).push(
            currentValue
        );
        // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
        return result;
    }, {}); // empty object is the initial value for result object
};

const FAQAssoiate = catchAsync(async(req, res) => {
    try {
        let Result = await Faq.find({ "userType": "Associate", "status": 0 }, { "category": 1, "question": 1, "answer": 1, "_id": 0 }).lean().exec();


        if (Result && Result.length > 0) {
            const personGroupedByColor = groupBy(Result, 'category');
            let responseArray = [];
            for (each in personGroupedByColor) {
                let eachcatJSON = {};
                let category = each;
                eachcatJSON["category"] = category;
                eachcatJSON["qa"] = personGroupedByColor[each];
                //eachcatJSON[each] = personGroupedByColor[each];
                responseArray.push(eachcatJSON)
            }
            res.send({
                code: 200,
                success: true,
                message: "FAQ Retrieved Success.",
                data: responseArray,
                timestamp: new Date()
            })
        } else {
            res.send({
                code: 201,
                success: false,
                message: "No data Found.",
                data: {},
                timestamp: new Date()
            })
        }
    } catch (err) {
        console.log(err)
        res.send({
            code: 201,
            success: false,
            message: "DATABASE_ERROR.",
            timestamp: new Date()
        });
    }
});

// const FAQAssoiateTEMP = catchAsync(async(req, res) => {
//     let values = req.body;
//     res.send({
//         code:200,
//         success:true,
//         message:'FAQ Data Retrieved Success',
//         data:[
//             {
//                 "question":"What is Paizatto?",
//                 "answer":"Paizatto is India’s first ever real earn back mobile app. It helps consumers to get real earn backs on every purchase. ",
//             },
//             {
//                 "question":"What is Earn Back?",
//                 "answer":"Earn back is real cash that is credited into your bank account end of every month.",
//             },
//             {
//                 "question":"How do you get Earn Back?",
//                 "answer":"Any purchase which is done at any Paizatto affiliated store gets earn backs by scanning and making payments only through the Paizatto QR code. <br>which is then credited as cash directly into your account. ",
//             },
//             {
//                 "question":"When will I get earn backs? ",
//                 "answer":"I will get earn backs for any amount spent by me.",
//             },
//             {
//                 "question":"How many transactions can I make in a day through Paizatto Qr Code?",
//                 "answer":"There is no limit. "
//             },
//             {
//                 "question":"Is the earn back available only in Paizattoaffiliatedstores?",
//                 "answer":"Yes, it is!"
//             },
//             {
//                 "question":"How is Earn Back different from Cash Back?",
//                 "answer":"Cash back generally has to be used at the same place, same category etc. On times, it has minimum purchase value, expiry date, restricted redemption of points etc. <br><br>Earn Back has no restrictions, even a small amount of INR 0.50 will also be credited directly to your bank."
//             },
//             {
//                 "question":"How do I maximize earn backs?",
//                 "answer":"You can refer your friends & relatives to increase your connections, every time they make a purchase, you will be eligible for same back as your connections. More the connections & purchases, more the Earn Back’s for you."
//             },
//             {
//                 "question":"How & when will I receive the earn backs?",
//                 "answer":"Earn Back’s will be credited directly to your UPI linked Bank account, all Earn Back’s accumulated will be credited on or before 7th of every month."
//             },
//             {
//                 "question":"How secure are my transactions?",
//                 "answer":"We have partnered with ICICI and IDFC Bank which is used for all these transactions using a secured network."
//             },
//             {
//                 "question":"What is minimum value of purchase?",
//                 "answer":"Minimum Purchase value can be INR 10/-, you must make a minimum purchase of INR 2,000 in affiliated Paizatto stores within a calendar month to receive connections Earn Back’s. Purchases can be made in any category in Paizatto affiliated stores."
//             },
//             {
//                 "question":"Can I transfer my earn backs to someone? ",
//                 "answer":"No it can’t be transferred. "
//             },
//             {
//                 "question":"What is required to register with Paizatto?",
//                 "answer":"You need aPhone number which is registered with your UPI."
//             },
//             {
//                 "question":"Which UPI apps can I use to make payments?",
//                 "answer":"All UPI’s can be used to make the payment, ensure same mobile number is used to received proper Earn Back’s"
//             },
//             {
//                 "question":"Is Paizatto a UPI or wallet?",
//                 "answer":"Neither, Paizatto is an Earn Back app which connects Buyers and Sellers to make additional Savings/ Sales"
//             },
//             {
//                 "question":"Will Paizatto use my data for any other purpose?",
//                 "answer":"No, your data is very secure with us. And no confidential information of yours is shared with any 3rd party. "
//             },
//             {
//                 "question":"Where to find Paizatto Mobile app?",
//                 "answer":"Paizatto is available in both app store (iOS) and play store (android)"
//             },
//             {
//                 "question":"Is the referral code mandatory?",
//                 "answer":"It’s Optional"
//             },
//             {
//                 "question":"Is it mandatory to refer someone?",
//                 "answer":"It’s Optional"
//             },
//             {
//                 "question":"How can I refer Paizatto to my friends and family?",
//                 "answer":"There is a referral link once you log into the app, which can be shared with your friends and family. Also, in the referral ID column you can input your Paizatto registered number if you don’t remember your Associate ID."
//             },
//             {
//                 "question":"What is connections?",
//                 "answer":"Any person you refer becomes your connection when they become active"
//             },
//             {
//                 "question":"How can I earn points?",
//                 "answer":"With every purchase in Paizatto affiliated store you earn a point"
//             },
//             {
//                 "question":"What is the value of each point?",
//                 "answer":"Value of each point is INR 0.5"
//             },
//             {
//                 "question":"How earn backs will be calculated?",
//                 "answer":"Earn Backs are calculated based on the store membership.<br>Eg:<br> 1. A Diamond store will give you 1 Point on purchase of INR 100<br>2.	Eg: A Gold store will give you 1 Point on purchase of INR 200<br>3.	Eg: A Silver store will give you 1 Point on purchase of INR 300<br>4.	Eg: A Bronze store will give you 1 Point on purchase of INR 400<br>"
//             },
//             {
//                 "question":"Can I get a earn back if I refer any store for Paizatto?",
//                 "answer":"Yes, you will get Earn Back whenever the store that you referred is getting approved as per norms of the company"
//             },
//             {
//                 "question":"When will I be eligible for my connections earn backs?",
//                 "answer":"As soon as you complete a purchase of 10Points in a calendar month"
//             },
//             {
//                 "question":"Is location permission mandatory for Paizatto?",
//                 "answer":"Yes, it enables you to find the nearest store based on the location"
//             },
//             {
//                 "question":"What is the difference between eligible earn back and actual earn back?",
//                 "answer":"Eligible Earn Back is what you can get including your connections Points, Actual Earn Back is what you will get based on your purchases, the exact amount that will get credited to your bank."
//             },
//             {
//                 "question":"How do I see my number of connections?",
//                 "answer":"You can see that in Referral report. Also you can see Active & Inactive in the Earn Back tab"
//             },
//             {
//                 "question":"How do I refer a vendor?",
//                 "answer":"Click on the refer tab, fill the vendor details and hit the submit button"
//             },
//             {
//                 "question":"What if there is no store in my location?",
//                 "answer":"We are adding stores across all locations/categories. Please use refer a vendor option to recommend vendors you would like to see it."
//             },
//             {
//                 "question":"How do I identify my required vendor?",
//                 "answer":"Click on the category, use the filters to find the vendor of your choice"
//             },
//             {
//                 "question":"Any other payment modes accepted in Paizatto apart from UPI?",
//                 "answer":"No"
//             },
//             {
//                 "question":"Where can in see my accumulated earn backs?",
//                 "answer":"You can see that in the Earn Back tab"
//             },
//             {
//                 "question":"Can I get my earn back earlier? ",
//                 "answer":"No, it is auto scheduled before 7th of every month"
//             },
//         ],
//         timestamp:new Date()
//     })   
// });

const ContactUsAssoiate = catchAsync(async(req, res) => {
    let values = req.body;
    console.log("hello");
    if (values.name != '' && values.name != null && values.name != undefined &&
        values.email != '' && values.email != null && values.email != undefined &&
        values.mobile != '' && values.mobile != null && values.mobile != undefined &&
        values.message != '' && values.message != null && values.message != undefined
    ) {
        var Previouscontactus = await Contactus.findOne().sort('-id').lean().exec();
        let id = 1;
        if (Previouscontactus.hasOwnProperty('id')) {
            id = Previouscontactus.id + 1;
        } else {
            id = id;
        }
        let Data = {
            id: id,
            name: values.name,
            email: values.email,
            mobile: values.mobile,
            message: values.message,
            createdBy: "Associate",
            role: "Associate"
        }
        Contactus(Data).save().then((Result) => {
            res.send({
                success: true,
                code: 200,
                Status: "Contact Us Data Saved Success",
                Data: {
                    name: Result.name,
                    email: Result.email,
                    mobile: Result.mobile
                }
            });
        }).catch((err) => {
            console.error('Database Error');
            console.error(err);
            res.send({
                success: false,
                code: 200,
                Status: "Database Error",
                Data: {

                },
                "timestamp": new Date()

            });
        })
    } else {
        res.send({
            code: 201,
            success: false,
            status: "All Fields are Mandatory",
            timestamp: new Date()
        });
    }
});

const addChild = async(req, res) => {
    const { parentUserName, childUserName } = req.body;
    const parent = await Associate.findOne({ username: parentUserName })
    const child = await Associate.findOne({ username: childUserName })
    if (!parent) {
        res.status(404).send({ message: 'Parent not found' })
    } else if (!child) {
        res.status(404).send({ message: 'Child not found' })
    } else {
        var someParent = await Associate.find({ sub: { "$in": [child.username] } })
        if (someParent && someParent.length) {
            res.status(400).send({ message: "This is another parent's child" })
        } else if (parent.sub.length < 3) {
            parent.sub.push(child.username)
            await parent.save()
            res.send({
                parent,
                child
            })
        } else {
            // if length is more than 3 insert in first child
            var emptyChild;
            var tempParent = JSON.parse(JSON.stringify(parent))
            while (!emptyChild) {
                for (var i = 0; i < tempParent.sub.length; i++) {
                    var child1 = tempParent.sub[i]
                    for (var j = 0; j < tempParent.sub.length; j++) {
                        const subChild = await Associate.findOne({ username: tempParent.sub[j] })
                        if (subChild.sub.length < 3 && !emptyChild) {
                            emptyChild = JSON.parse(JSON.stringify(subChild))
                        }
                    }
                    if (!emptyChild) {
                        tempParent = JSON.parse(JSON.stringify(child1))
                    }
                }


            }
            var newChild = await Associate.findOne({ username: emptyChild.username })
            newChild.sub.push(child.username)
            await newChild.save()
            res.send({ parent: newChild, child })
        }
    }
}

const getAllChildren = async(req, res) => {
    const { parentUserName } = req.query;
    const parent = await Associate.findOne({ username: parentUserName })
    if (!parent) {
        res.status(404).send({ message: 'Parent not found' })
    } else {
        const endArrayObject = {}
        var tempParent = JSON.parse(JSON.stringify(parent))
        var queue = []
        var index = 0;
        queue.push({
            parentIndex: index,
            id: tempParent.username
        })
        while (queue.length) {
            let { id: newId, parentIndex } = queue.shift()
            let newParent = await Associate.findOne({ username: newId })
            for (var j = 0; j < newParent.sub.length; j++) {
                var child = await Associate.findOne({ username: newParent.sub[j] })
                if (child) {
                    queue.push({
                        parentIndex: parentIndex + 1,
                        id: child.username
                    })
                    if (endArrayObject[`${parentIndex + 1}`]) {
                        endArrayObject[`${parentIndex + 1}`].push(child)
                    } else {
                        endArrayObject[`${parentIndex + 1}`] = []
                        endArrayObject[`${parentIndex + 1}`].push(child)
                    }
                }


            }
        }
        res.send(endArrayObject)
    }
}
const GetLadderInformationCount = async(values) => {
    let parentUserName = values.username;
    const parent = await Associate.findOne({ username: parentUserName })
    if (!parent) {
        return ({ message: 'Parent not found' })
    } else {
        const endArrayObject = {}
        var tempParent = JSON.parse(JSON.stringify(parent))
        var queue = []
        var index = 0;
        queue.push({
            parentIndex: index,
            id: tempParent.username
        })
        while (queue.length) {
            let { id: newId, parentIndex } = queue.shift()
            let newParent = await Associate.findOne({ username: newId })
            for (var j = 0; j < newParent.sub.length; j++) {
                var child = await Associate.findOne({ username: newParent.sub[j] })
                if (child) {
                    queue.push({
                        parentIndex: parentIndex + 1,
                        id: child.username
                    })
                    if (endArrayObject[`${parentIndex + 1}`]) {
                        endArrayObject[`${parentIndex + 1}`].push(child)
                    } else {
                        endArrayObject[`${parentIndex + 1}`] = []
                        endArrayObject[`${parentIndex + 1}`].push(child)
                    }
                }
            }
        }
        return (endArrayObject)
    }
}

const LeftRightCounts = async(values) => {
    if (values.username != '' && values.username != null && values.username != undefined) {
        let UserData = await CheckWheatherUserExists(values);
        let subData = UserData.sub;
        let returnJSON = {
            left: 0,
            right: 0,
            middle: 0
        }
        if (subData.length > 0) {
            if (subData[0] != '' && subData[0] != null && subData[0] != undefined) {
                let Ladder1 = await GetLadderInformationCount({ 'username': subData[0] });
                let count = 0;
                for (each in Ladder1) {
                    count = count + Ladder1[each].length;
                }
                returnJSON.left = count;
            }

            if (subData[1] != '' && subData[1] != null && subData[1] != undefined) {
                let Ladder1 = await GetLadderInformationCount({ 'username': subData[1] });
                let count = 0;
                for (each in Ladder1) {
                    count = count + Ladder1[each].length;
                }
                returnJSON.middle = count;
            }
            if (subData[2] != '' && subData[2] != null && subData[2] != undefined) {
                let Ladder1 = await GetLadderInformationCount({ 'username': subData[2] });
                let count = 0;
                for (each in Ladder1) {
                    count = count + Ladder1[each].length;
                }
                returnJSON.right = count;
            }
            return (returnJSON)
        } else {
            return (returnJSON)
        }
    } else {
        let returnJSON = {
            left: 0,
            right: 0,
            middle: 0
        }
        return (returnJSON)
    }
}

const GynealogySubFunction = async(values) => {
    let UserData = await CheckWheatherUserExists(values);
    let LadderData = await GetLadderInformationCount(values);
    let responseData = {};

    let LeftRightData = await LeftRightCounts(values);

    responseData.username = UserData.username;
    responseData.firstName = UserData.firstName;
    responseData.lastName = UserData.lastName;
    responseData.referralusername = UserData.referrer.referralid;
    responseData.parentId = UserData.parentId;
    responseData.activecount = 0;
    responseData.inactivecount = 0;
    responseData.totalcount = 0;
    //responseData.status = UserData.status;
    let newStatus = await GetUserActiveInactiveData({ username: UserData.username, 'Levels': UserData.Levels });
    //console.log("new Status 3------->",newStatus)
    if (newStatus.hasOwnProperty("statusName") && newStatus.hasOwnProperty("status")) {
        responseData.status = newStatus.status;
        responseData.statusName = newStatus.statusName;
    }
    responseData.image_url = "https://enn-richh.s3.ap-south-1.amazonaws.com/AWSERROR.PNG";
    if (UserData.referrer.referralid == "OL00000001") {
        responseData.companyReferral = true;
    } else {
        responseData.companyReferral = false;
    }
    responseData.left = LeftRightData.left;
    responseData.middle = LeftRightData.middle;
    responseData.right = LeftRightData.right;

    let totalBusinessandPoints = await Point.aggregate([{
            $match: { 'customerUsername': values.username }
        },
        {
            $group: {
                _id: null,
                businessDone: {
                    $sum: "$amount"
                },
                overallPoints: {
                    $sum: "$points"
                }
            }
        }
    ]);
    console.log("totalBusinessandPoints------------------>", totalBusinessandPoints)
    if (totalBusinessandPoints && totalBusinessandPoints.length > 0 && totalBusinessandPoints[0].hasOwnProperty("businessDone") && totalBusinessandPoints[0].hasOwnProperty("overallPoints")) {
        responseData.businessDone = totalBusinessandPoints[0].businessDone;
        responseData.overallPoints = totalBusinessandPoints[0].overallPoints;
    } else {
        responseData.businessDone = 0;
        responseData.overallPoints = 0;
    }

    let activeInactiveCount = await getActiveCountDashboard({ parentUserName: values.username });
    if (activeInactiveCount.hasOwnProperty("activeCount") && activeInactiveCount.hasOwnProperty("inActiveCount")) {
        responseData.activecount = activeInactiveCount.activeCount;
        responseData.inactivecount = activeInactiveCount.inActiveCount;
        responseData.totalcount = responseData.activecount + responseData.inactivecount;
    }
    return responseData;
}

//Gynealogy
const Gynealogy = catchAsync(async(req, res) => {
    try {
        let values = req.body;
        if (values.hasOwnProperty("username") && values.username != '' && values.username != null && values.username != undefined) {
            let UserData = await GetUserDataForGenealogy(values);
            res.send({
                success: true,
                code: 200,
                status: "Genealogy Retrieved Success",
                data: UserData,
                timestamp: new Date()
            });
        } else {
            res.send({
                success: false,
                code: 201,
                Status: "Invalid Username Provided.",
                "timestamp": new Date()
            });
        }
    } catch (error) {
        console.log(error)
        res.send({
            success: false,
            code: 201,
            Status: "Error Occured",
            data: error,
            timestamp: new Date()
        })
    }
});

const GetUserDataForGenealogy = async(values) => {
    return new Promise(async(resolve, reject) => {
        //setImmediate(() => {
        try {
            if (values.hasOwnProperty("username") || values.hasOwnProperty("phoneNumber")) {
                var query = {};
                if (values.hasOwnProperty("username")) {
                    query = {
                        username: values.username.toUpperCase()
                    }
                }
                if (values.hasOwnProperty("phoneNumber")) {
                    query = {
                        phoneNumber: values.phoneNumber
                    }
                }
                let project = {
                    '_id': 0,
                    'username': 1,
                    'firstName': 1,
                    'lastName': 1,
                    'referrer.referralid': 1,
                    'parentId': 1,
                    'sub': 1,
                    'Levels': 1
                }
                let Result = await Associate.findOne(query, project).lean().exec();
                if (Result) {
                    let returnJSON = await LeftRightCounts(values);
                    if (returnJSON.hasOwnProperty('left') && returnJSON.hasOwnProperty('middle') && returnJSON.hasOwnProperty('right')) {
                        Result.left = returnJSON.left;
                        Result.middle = returnJSON.middle;
                        Result.right = returnJSON.right;
                        //resolve (Result)
                    } else {
                        Result.left = 0;
                        Result.middle = 0;
                        Result.right = 0;
                    }
                    let newResult = await GetUserActiveInactiveDataGenealogy(Result);
                    let activeInactiveCount = await getActiveCountDashboard({ parentUserName: values.username });
                    if (activeInactiveCount.hasOwnProperty("activeCount") && activeInactiveCount.hasOwnProperty("inActiveCount")) {
                        newResult.activecount = activeInactiveCount.activeCount;
                        newResult.inactivecount = activeInactiveCount.inActiveCount;
                        newResult.totalcount = newResult.activecount + newResult.inactivecount;
                    }
                    let totalBusinessandPoints = await Point.aggregate([{
                            $match: { 'customerUsername': values.username }
                        },
                        {
                            $group: {
                                _id: null,
                                businessDone: {
                                    $sum: "$amount"
                                },
                                overallPoints: {
                                    $sum: "$points"
                                }
                            }
                        }
                    ]);
                    if (totalBusinessandPoints && totalBusinessandPoints.length > 0 && totalBusinessandPoints[0].hasOwnProperty("businessDone") && totalBusinessandPoints[0].hasOwnProperty("overallPoints")) {
                        newResult.businessDone = totalBusinessandPoints[0].businessDone;
                        newResult.overallPoints = totalBusinessandPoints[0].overallPoints;
                    } else {
                        newResult.businessDone = 0;
                        newResult.overallPoints = 0;
                    }
                    var emptyUser = {};
                    emptyUser.username = "";
                    emptyUser.firstName = "";
                    emptyUser.lastName = "";
                    emptyUser.referralusername = "";
                    emptyUser.leg = 0;
                    emptyUser.status = 0;
                    emptyUser.image_url = "";
                    emptyUser.companyReferral = false;
                    // emptyUser.left = 0;
                    // emptyUser.middle = 0;
                    // emptyUser.right = 0;
                    // emptyUser.businessDone = 0;
                    // emptyUser.overallPoints = 0;

                    var emptyUser1 = {};
                    emptyUser1.username = "";
                    emptyUser1.firstName = "";
                    emptyUser1.lastName = "";
                    emptyUser1.referralid = "";
                    emptyUser1.leg = 0;
                    emptyUser1.status = 0;
                    emptyUser1.image_url = "";
                    emptyUser1.companyReferral = false;
                    // emptyUser1.left = 0;
                    // emptyUser1.middle = 0;
                    // emptyUser1.right = 0;
                    // emptyUser1.businessDone = 0;
                    // emptyUser1.overallPoints = 0;
                    if (newResult && newResult.sub && newResult.sub.length > 0) {
                        newResult.tree = []
                        let count = 0;
                        for (each in newResult.sub) {
                            console.log("Sub User Data For Genealogy------>", newResult.sub[each])
                            let subData = await GetSubUserDataForGenealogy({ username: newResult.sub[each] });
                            newResult.tree.push(subData)
                            count = count + 1;
                        }

                        emptyUser.tree = [emptyUser1, emptyUser1, emptyUser1]
                        while (count < 3) {
                            newResult.tree.push(emptyUser)
                            count = count + 1;
                        }
                    } else {
                        newResult.tree = [];
                        emptyUser.tree = [emptyUser1, emptyUser1, emptyUser1];
                        newResult.tree.push(emptyUser);
                        newResult.tree.push(emptyUser);
                        newResult.tree.push(emptyUser);
                    }
                    if (newResult.hasOwnProperty("Levels")) {
                        delete newResult.Levels;
                    }
                    if (newResult.hasOwnProperty("referrer") && newResult.referrer.hasOwnProperty("referralid")) {
                        newResult.referralusername = newResult.referrer.referralid;
                        delete newResult.referrer;
                    }
                    resolve(newResult)
                } else {
                    reject({
                        success: false,
                        code: 201,
                        Status: "Phone Number or Username Doesn't Exist.",
                        "timestamp": new Date()
                    });
                }
            } else {
                reject({
                    success: false,
                    code: 201,
                    Status: "Phone Number or Username are mandatory or Invalid User.",
                    "timestamp": new Date()
                });
            }
        } catch (error) {
            console.error('Something Error');
            console.error(error);
            reject({
                success: false,
                code: 201,
                Status: "Phone Number or Username Doesn't Exist.",
                "timestamp": new Date()
            });
        }
        // });
    });
}

const GetSubUserDataForGenealogy = async(values) => {
    return new Promise(async(resolve, reject) => {
        //setImmediate(() => {
        try {
            if (values.hasOwnProperty("username") || values.hasOwnProperty("phoneNumber")) {
                var query = {};
                if (values.hasOwnProperty("username")) {
                    query = {
                        username: values.username.toUpperCase()
                    }
                }
                if (values.hasOwnProperty("phoneNumber")) {
                    query = {
                        phoneNumber: values.phoneNumber
                    }
                }
                let project = {
                    '_id': 0,
                    'username': 1,
                    'firstName': 1,
                    'lastName': 1,
                    'referrer.referralid': 1,
                    'parentId': 1,
                    'sub': 1,
                    'Levels': 1
                }
                let Result = await Associate.findOne(query, project).lean().exec();
                if (Result) {
                    // let returnJSON = await LeftRightCounts(values);
                    // if(returnJSON.hasOwnProperty('left') && returnJSON.hasOwnProperty('middle') && returnJSON.hasOwnProperty('right')){
                    //     Result.left = returnJSON.left;
                    //     Result.middle = returnJSON.middle;
                    //     Result.right = returnJSON.right;
                    //    //resolve (Result)
                    // }else{
                    //     Result.left = 0;
                    //     Result.middle = 0;
                    //     Result.right = 0;
                    // }
                    // let newResult = await GetUserActiveInactiveDataGenealogy(Result);
                    // let activeInactiveCount = await getActiveCountDashboard({parentUserName:values.username});
                    // if(activeInactiveCount.hasOwnProperty("activeCount") && activeInactiveCount.hasOwnProperty("inActiveCount")){
                    //     newResult.activecount = activeInactiveCount.activeCount;
                    //     newResult.inactivecount = activeInactiveCount.inActiveCount;
                    //     newResult.totalcount = newResult.activecount + newResult.inactivecount;
                    // }
                    // let totalBusinessandPoints = await Point.aggregate([ 
                    //     {$match:
                    //           {'customerUsername': values.username}
                    //     },
                    //     { 
                    //     $group: { 
                    //         _id: null, 
                    //         businessDone: { 
                    //             $sum: "$amount" 
                    //         },
                    //         overallPoints: { 
                    //             $sum: "$points" 
                    //         }
                    //     } 
                    // } ] );
                    // if(totalBusinessandPoints && totalBusinessandPoints.length > 0 && totalBusinessandPoints[0].hasOwnProperty("businessDone") && totalBusinessandPoints[0].hasOwnProperty("overallPoints")){
                    //     newResult.businessDone = totalBusinessandPoints[0].businessDone;
                    //     newResult.overallPoints = totalBusinessandPoints[0].overallPoints;
                    // }else{
                    //     newResult.businessDone = 0;
                    //     newResult.overallPoints = 0;
                    // }
                    if (Result.hasOwnProperty("Levels")) {
                        delete Result.Levels;
                    }
                    if (Result.hasOwnProperty("referrer") && Result.referrer.hasOwnProperty("referralid")) {
                        Result.referralusername = Result.referrer.referralid;
                        delete Result.referrer;
                    }
                    if (Result && Result.sub && Result.sub.length > 0) {
                        Result.tree = [];
                        let count = 0;
                        for (each in Result.sub) {
                            console.log("Sub Sub User Data------->", Result.sub[each])
                            let subData = await GetSubSubUserDataForGenealogy({ username: Result.sub[each] });
                            console.log("subData-----", subData)
                            Result.tree.push(subData)
                            count = count + 1;
                        }
                        var emptyUser = {};
                        emptyUser.username = "";
                        emptyUser.firstName = "";
                        emptyUser.lastName = "";
                        emptyUser.referralusername = "";
                        emptyUser.leg = count;
                        emptyUser.status = 0;
                        emptyUser.image_url = "";
                        emptyUser.companyReferral = false;
                        // emptyUser.left = 0;
                        // emptyUser.middle = 0;
                        // emptyUser.right = 0;
                        // emptyUser.businessDone = 0;
                        // emptyUser.overallPoints = 0;
                        while (count < 3) {
                            Result.tree.push(emptyUser)
                            count = count + 1;
                        }
                    } else {
                        Result.tree = [];
                        var emptyUser = {};
                        emptyUser.username = "";
                        emptyUser.firstName = "";
                        emptyUser.lastName = "";
                        emptyUser.referralusername = "";
                        emptyUser.leg = 0;
                        emptyUser.status = 0;
                        emptyUser.image_url = "";
                        emptyUser.companyReferral = false;
                        // emptyUser.left = 0;
                        // emptyUser.middle = 0;
                        // emptyUser.right = 0;
                        // emptyUser.businessDone = 0;
                        // emptyUser.overallPoints = 0;
                        Result.tree.push(emptyUser);
                        Result.tree.push(emptyUser);
                        Result.tree.push(emptyUser);
                    }
                    resolve(Result)
                } else {
                    reject({
                        success: false,
                        code: 201,
                        Status: "Phone Number or Username Doesn't Exist.",
                        "timestamp": new Date()
                    });
                }
            } else {
                reject({
                    success: false,
                    code: 201,
                    Status: "Phone Number or Username are mandatory or Invalid User.",
                    "timestamp": new Date()
                });
            }
        } catch (error) {
            console.error('Something Error');
            console.error(error);
            reject({
                success: false,
                code: 201,
                Status: "Phone Number or Username Doesn't Exist.",
                "timestamp": new Date()
            });
        }
        // });
    });
}

const GetSubSubUserDataForGenealogy = async(values) => {
    return new Promise(async(resolve, reject) => {
        //setImmediate(() => {
        try {
            if (values.hasOwnProperty("username") || values.hasOwnProperty("phoneNumber")) {
                var query = {};
                if (values.hasOwnProperty("username")) {
                    query = {
                        username: values.username.toUpperCase()
                    }
                }
                if (values.hasOwnProperty("phoneNumber")) {
                    query = {
                        phoneNumber: values.phoneNumber
                    }
                }
                let project = {
                    '_id': 0,
                    'username': 1,
                    'firstName': 1,
                    'lastName': 1,
                    'referrer.referralid': 1,
                    'parentId': 1,
                    'sub': 1,
                    'Levels': 1
                }
                let Result = await Associate.findOne(query, project).lean().exec();
                if (Result) {
                    // let returnJSON = await LeftRightCounts(values);
                    // if(returnJSON.hasOwnProperty('left') && returnJSON.hasOwnProperty('middle') && returnJSON.hasOwnProperty('right')){
                    //     Result.left = returnJSON.left;
                    //     Result.middle = returnJSON.middle;
                    //     Result.right = returnJSON.right;
                    //    //resolve (Result)
                    // }else{
                    //     Result.left = 0;
                    //     Result.middle = 0;
                    //     Result.right = 0;
                    // }
                    // let newResult = await GetUserActiveInactiveDataGenealogy(Result);
                    // let activeInactiveCount = await getActiveCountDashboard({parentUserName:values.username});
                    // if(activeInactiveCount.hasOwnProperty("activeCount") && activeInactiveCount.hasOwnProperty("inActiveCount")){
                    //     newResult.activecount = activeInactiveCount.activeCount;
                    //     newResult.inactivecount = activeInactiveCount.inActiveCount;
                    //     newResult.totalcount = newResult.activecount + newResult.inactivecount;
                    // }
                    // let totalBusinessandPoints = await Point.aggregate([ 
                    //     {$match:
                    //           {'customerUsername': values.username}
                    //     },
                    //     { 
                    //     $group: { 
                    //         _id: null, 
                    //         businessDone: { 
                    //             $sum: "$amount" 
                    //         },
                    //         overallPoints: { 
                    //             $sum: "$points" 
                    //         }
                    //     } 
                    // } ] );
                    // if(totalBusinessandPoints && totalBusinessandPoints.length > 0 && totalBusinessandPoints[0].hasOwnProperty("businessDone") && totalBusinessandPoints[0].hasOwnProperty("overallPoints")){
                    //     newResult.businessDone = totalBusinessandPoints[0].businessDone;
                    //     newResult.overallPoints = totalBusinessandPoints[0].overallPoints;
                    // }else{
                    //     newResult.businessDone = 0;
                    //     newResult.overallPoints = 0;
                    // }
                    if (Result.hasOwnProperty("Levels")) {
                        delete Result.Levels;
                    }
                    if (Result.hasOwnProperty("referrer") && Result.referrer.hasOwnProperty("referralid")) {
                        Result.referralusername = Result.referrer.referralid;
                        delete Result.referrer;
                    }
                    console.log("newResult----------------->", Result)
                    resolve(Result)
                } else {
                    reject({
                        success: false,
                        code: 201,
                        Status: "Phone Number or Username Doesn't Exist.",
                        "timestamp": new Date()
                    });
                }
            } else {
                reject({
                    success: false,
                    code: 201,
                    Status: "Phone Number or Username are mandatory or Invalid User.",
                    "timestamp": new Date()
                });
            }
        } catch (error) {
            console.error('Something Error');
            console.error(error);
            reject({
                success: false,
                code: 201,
                Status: "Phone Number or Username Doesn't Exist.",
                "timestamp": new Date()
            });
        }
        // });
    });
}
const DashboardAssociate = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty('username')) {
        let Response = {};
        let UserLevelMin = 0;
        let UserLevelMax = 0;
        let UserCurrentMonthPoints = 0;
        let UserData = await CheckWheatherUserExists(values);
        if (UserData.hasOwnProperty("Levels")) {
            let UserLastLevel = UserData.Levels[UserData.Levels.length - 1]
            Response.maxcashback = Formatter.toINR(UserLastLevel.max);
            Response.UserMinCashBack = Formatter.toINR(UserLastLevel.min);
            Response.ladder = UserLastLevel.name;
            UserLevelMin = UserLastLevel.min;
            UserLevelMax = UserLastLevel.max;
        } else {
            Response.maxcashback = 0
            Response.UserMinCashBack = 0
            Response.ladder = "";
        }
        let UserLastTransaction = await Transactions.find({ "username": UserData.username }).sort({ transactionDate: -1 }).lean().exec();
        if (UserLastTransaction && UserLastTransaction.length > 0 && UserLastTransaction[0].hasOwnProperty("amount") && UserLastTransaction[0].hasOwnProperty("transactionDate")) {
            Response.currentMonthPurchase = Formatter.toINR(UserLastTransaction[0].amount);
            Response.lastPurchaseDate = Formatter.toDate(UserLastTransaction[0].transactionDate);
        } else {
            Response.currentMonthPurchase = 0
            Response.lastPurchaseDate = 0
        }
        let ActiveInactiveCount = await getActiveCountDashboard({ parentUserName: values.username });
        let GetEarnedPointsDashboard = await getEarnedPointsDashboard({ parentUserName: values.username });
        let getEarnedPointsandLevel = await getEarnedPointsWithLevelDashboard({ parentUserName: values.username });
        let getEarnedPointsUser = await getEarnedPointsUserDashboard({ parentUserName: values.username });
        if (ActiveInactiveCount) {
            Response.activedownlines = ActiveInactiveCount.activeCount;
            Response.inactivedownlines = ActiveInactiveCount.inActiveCount;
            Response.totalDownlines = ActiveInactiveCount.activeCount + ActiveInactiveCount.inActiveCount;
        } else {
            Response.activedownlines = 0;
            Response.inactivedownlines = 0;
            Response.totalDownlines = 0;
        }


        var date = new Date();
        var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        //PAIZATTO CURRENT MONTH POINTS
        let PiazattoPointsCurrentMonth = await PaizattoPoints.aggregate([{
            $match: {
                customerUsername: values.username,
                pointsType: 2,
                transactionDate: {
                    $gte: firstDay,
                    $lte: lastDay
                }
            }
        }, {
            $group: {
                _id: 0,
                currentmonthPaizattoPoints: {
                    $sum: "$points"
                }
            }
        }]);

        let PiazattoPointsOverall = await PaizattoPoints.aggregate([{
            $match: {
                customerUsername: values.username,
                pointsType: 2,
            }
        }, {
            $group: {
                _id: 0,
                overallPaizattoPoints: {
                    $sum: "$points"
                }
            }
        }]);

        let selfPurchase = await Transactions.aggregate([{
            $match: {
                username: values.username,
                transactionDate: {
                    $gte: firstDay,
                    $lte: lastDay
                }
            }
        }, {
            $group: {
                _id: 0,
                selfPurchase: {
                    $sum: "$amount"
                }
            }
        }]);

        let generalSettings = await GeneralSettings.findOne({ "status": 0 }).lean().exec();
        if (GetEarnedPointsDashboard) {
            Response.currentMonthPoints = GetEarnedPointsDashboard.earnedPoints;
        } else {
            Response.currentMonthPoints = 0;
            //Response.currentMonthEarnedAmount = 0;
        }

        if(PiazattoPointsOverall && PiazattoPointsOverall.length > 0 && PiazattoPointsOverall[0].hasOwnProperty("overallPaizattoPoints")){
            Response.currentMonthPoints = Formatter.toDecimal(Response.currentMonthPoints + (200-PiazattoPointsOverall[0].overallPaizattoPoints))
        }else{
            Response.currentMonthPoints = Formatter.toDecimal(Response.currentMonthPoints + 200);
        }

        if (selfPurchase && selfPurchase.length > 0 && selfPurchase[0].hasOwnProperty("selfPurchase")) {
            Response.selfPurchase = Formatter.toINR(selfPurchase[0].selfPurchase)
        } else {
            Response.selfPurchase = Formatter.toINR(0)
        }


        if (generalSettings && generalSettings != null) {
            Response.currentMonthEarnedAmount = Formatter.toINR(Response.currentMonthPoints * generalSettings.pointValue);
        }


        let UserTransactionsOfMonth = await Transactions.find({
            "username": UserData.username,
            "transactionDate": {
                $gte: firstDay,
                $lte: lastDay
            }
        }).lean().exec();
        if (UserTransactionsOfMonth.length > 0) {
            for (each in UserTransactionsOfMonth) {
                UserCurrentMonthPoints = UserCurrentMonthPoints + UserTransactionsOfMonth[each].point;
            }
        }
        if (getEarnedPointsandLevel) {
            console.log("getEarnedPointsandLevel", getEarnedPointsandLevel)
            Response.points = getEarnedPointsandLevel.earnedPoints;
            if (Response.points < UserLevelMin) {
                Response.points = getEarnedPointsUser.earnedPoints;
            }
            if ((Response.points * generalSettings.pointValue) > UserLevelMax) {
                Response.points = UserLevelMax / generalSettings.pointValue;
            }
        } else {
            Response.points = 0;
            //Response.eligiblecashback = 0;
        }

        if (PiazattoPointsCurrentMonth && PiazattoPointsCurrentMonth.length > 0 && PiazattoPointsCurrentMonth[0].hasOwnProperty("currentmonthPaizattoPoints")) {
            Response.points = Formatter.toDecimal(Response.points + PiazattoPointsCurrentMonth[0].currentmonthPaizattoPoints);
        } else {
            Response.points = Formatter.toDecimal(Response.points)
        }

        if (generalSettings && generalSettings != null) {
            Response.eligiblecashback = Formatter.toINR(Response.points * generalSettings.pointValue);
        }



        let UserPoints = await Payouts.find({ username: values.username });
        let totalPointsAccumulated = 0;
        if (UserPoints && UserPoints.length > 0) {
            for (each in UserPoints) {
                totalPointsAccumulated = totalPointsAccumulated + UserPoints[each].points;
            }
        }
        Response.totalPointsAccumulated = parseInt(totalPointsAccumulated + Response.points);
        if (generalSettings && generalSettings != null) {
            Response.totalAmountAccumulated = Formatter.toINR(Response.totalPointsAccumulated * generalSettings.pointValue);
        }



        res.send({
            code: 200,
            success: true,
            message: 'Dashboard Retrieved Success.',
            data: Response,
            timestamp: new Date()
        })
    } else {
        res.send({
            code: 201,
            success: false,
            message: 'Invalid Username',
            data: {},
            timestamp: new Date()
        });
    }
});

const getActiveCountDashboard = async(values) => {
    return new Promise(async(resolve, reject) => {
        const parentUserName = values.parentUserName;
        console.log("parentUserName---------->", parentUserName)
        const parent = await Associate.findOne({ username: parentUserName })
        let activeCount = 0,
            inActiveCount = 0;
        const children = []
        let queue = []
        if (parent.sub && parent.sub.length > 0) {
            queue.push(...parent.sub)
        } else {
            resolve({ activeCount, inActiveCount })
        }
        while (queue.length && queue.length > 0) {
            let child = await Associate.findOne({ username: queue[0] })
            if (child) {
                children.push(child)
                if (child.sub && child.sub.length > 0) {
                    queue.push(...child.sub)
                }
                queue.shift()
            } else {
                queue.shift()
            }
        }

        var bar = new Promise(async(resolve, reject) => {
            children.forEach(async(value, index, array) => {
                const transactions = await Transactions.find({ username: value.username })
                let minValue = value.Levels[value.Levels.length - 1];
                const filteredArray = transactions.filter((t) => {
                    return new Date(t.transactionDate).getMonth() === new Date().getMonth()
                })
                if (filteredArray.length > 0) {
                    let sum = filteredArray.reduce((prev, next) => {
                        return { point: prev.point + next.point }
                    })
                    if (sum.point >= minValue.min) {
                        activeCount++;
                    } else {
                        inActiveCount++;
                    }
                }
                //   else {
                //       inActiveCount++;
                //   }
                if (index === array.length - 1) resolve();

            })
        });
        bar.then(() => {
            resolve({ activeCount, inActiveCount })
        });
    })
}

const getEarnedPointsDashboard = async(values) => {
    return new Promise(async(resolve, reject) => {
        const parentUserName = values.parentUserName;
        const parent = await Associate.findOne({ username: parentUserName })
        let activeCount = 0,
            inActiveCount = 0;
        let totalPoints = 0;
        const pTransactions = await Transactions.find({ username: parentUserName })
        const pFilteredArray = pTransactions.filter((t) => {
            return new Date(t.transactionDate).getMonth() === new Date().getMonth()
        })
        if (pFilteredArray.length > 0) {
            let sum = pFilteredArray.reduce((prev, next) => {
                return { point: prev.point + next.point }
            })
            totalPoints += sum.point;
        }
        const children = []
        let queue = []

        if (parent.sub && parent.sub.length > 0) {
            queue.push(...parent.sub)
        } else {
            resolve({ earnedPoints: totalPoints })
        }
        console.log(queue)
        while (queue.length && queue.length > 0) {
            let child = await Associate.findOne({ username: queue[0] })
            if (child) {
                children.push(child)
                if (child.sub && child.sub.length > 0) {
                    queue.push(...child.sub)
                }
                queue.shift()
            } else {
                queue.shift()
            }
        }

        var bar = new Promise(async(resolve, reject) => {
            if (children && children.length && children.length > 0) {
                // children.forEach(async (value, index, array) => {
                for (var i = 0; i < children.length; i++) {
                    const value = children[i]
                    const transactions = await Transactions.find({ username: value.username })
                    let minValue = value.Levels[value.Levels.length - 1];
                    const filteredArray = transactions.filter((t) => {
                        return new Date(t.transactionDate).getMonth() === new Date().getMonth()
                    })
                    console.log({ filteredArray })
                    if (filteredArray.length > 0) {
                        let sum = filteredArray.reduce((prev, next) => {
                            return { point: prev.point + next.point }
                        })
                        totalPoints += sum.point
                    }
                    //  if (index === array.length -1) resolve();
                }
                resolve();

                //  })
            } else {
                resolve();
            }
        });
        bar.then(() => {
            resolve({ earnedPoints: totalPoints })
        });
    })
}

const getEarnedPointsUserDashboard = async(values) => {
    return new Promise(async(resolve, reject) => {
        let totalPoints = 0;
        const parentUserName = values.parentUserName;
        const parent = await Associate.findOne({ username: parentUserName })
        const pTransactions = await Transactions.find({ username: parentUserName })
        const pFilteredArray = pTransactions.filter((t) => {
            return new Date(t.transactionDate).getMonth() === new Date().getMonth()
        })
        if (pFilteredArray.length > 0) {
            let sum = pFilteredArray.reduce((prev, next) => {
                return { point: prev.point + next.point }
            })
            totalPoints += sum.point;
        }
        resolve({ earnedPoints: totalPoints })
    })



}

const getEarnedPointsWithLevelDashboard = async(values) => {
    return new Promise(async(resolve, reject) => {
        const parentUserName = values.parentUserName;
        const parent = await Associate.findOne({ username: parentUserName })
            // UserData.Levels[UserData.Levels.length -1].min
        let uptoLevel = parseInt(parent.Levels[parent.Levels.length - 1].Downline)
        console.log("uptoLevel", uptoLevel);
        let activeCount = 0,
            inActiveCount = 0;
        let totalPoints = 0;
        let level = 0;
        const pTransactions = await Transactions.find({ username: parentUserName })
        const pFilteredArray = pTransactions.filter((t) => {
            return new Date(t.transactionDate).getMonth() === new Date().getMonth()
        })
        if (pFilteredArray.length > 0) {
            let sum = pFilteredArray.reduce((prev, next) => {
                return { point: prev.point + next.point }
            })
            totalPoints += sum.point;
        }
        const children = []
        let queue = {};
        let oldQueue = []
        if (parent.sub && parent.sub.length > 0) {
            level++
            queue[level] = [...parent.sub]
            uptoLevel--;
        } else {
            resolve({ earnedPoints: totalPoints })
        }
        while (queue[level] && queue[level].length > 0) {
            if (uptoLevel >= 0) {
                uptoLevel--;
                for (var i = 0; i < queue[level].length; i++) {
                    let child = await Associate.findOne({ username: queue[level][i] })
                    if (child) {
                        children.push(child)
                        if (queue[level + 1]) {
                            queue[level + 1].push(...child.sub)
                        } else {
                            queue[level + 1] = [...child.sub]
                        }
                    }
                }
                level++;

            } else {
                queue[level].length--;
            }
        }

        var bar = new Promise(async(resolve, reject) => {
            if (children && children.length && children.length > 0) {
                // children.forEach(async (value, index, array) => {
                for (var i = 0; i < children.length; i++) {
                    const value = children[i]
                    const transactions = await Transactions.find({ username: value.username })
                    let minValue = value.Levels[value.Levels.length - 1];
                    const filteredArray = transactions.filter((t) => {
                        return new Date(t.transactionDate).getMonth() === new Date().getMonth()
                    })
                    if (filteredArray.length > 0) {
                        let sum = filteredArray.reduce((prev, next) => {
                            return { point: prev.point + next.point }
                        })
                        totalPoints += sum.point
                    }
                }
                resolve();

                //  })
            } else {
                resolve();
            }

        });
        bar.then(() => {
            resolve({ earnedPoints: totalPoints })
        });
    })
}

const getActiveCount = async(req, res) => {
    const { parentUserName } = req.body;
    const parent = await Associate.findOne({ username: parentUserName })
    let activeCount = 0,
        inActiveCount = 0;
    const children = []
    let queue = []
    if (parent.sub && parent.sub.length > 0) {
        queue.push(...parent.sub)
    }
    while (queue.length && queue.length > 0) {
        let child = await Associate.findOne({ username: queue[0] })
        if (child) {
            children.push(child)
            if (child.sub && child.sub.length > 0) {
                queue.push(...child.sub)
            }
            queue.shift()
        } else {
            queue.shift()
        }
    }

    var bar = new Promise(async(resolve, reject) => {
        children.forEach(async(value, index, array) => {
            const transactions = await Transactions.find({ username: value.username })
            let minValue = value.Levels[value.Levels.length - 1];
            const filteredArray = transactions.filter((t) => {
                return new Date(t.transactionDate).getMonth() === new Date().getMonth()
            })
            if (filteredArray.length > 0) {
                let sum = filteredArray.reduce((prev, next) => {
                    return { amount: prev.amount + next.amount }
                })
                if (minValue >= sum) {
                    activeCount++;
                } else {
                    inActiveCount++;
                }
            } else {
                inActiveCount++;
            }
            if (index === array.length - 1) resolve();

        })
    });
    bar.then(() => {
        res.json({ activeCount, inActiveCount })
    });

}

const getEarnedPoints = async(req, res) => {
    const { parentUserName } = req.body;
    const parent = await Associate.findOne({ username: parentUserName })
    let activeCount = 0,
        inActiveCount = 0;
    let totalPoints = 0;
    const pTransactions = await Transactions.find({ username: parentUserName })
    const pFilteredArray = pTransactions.filter((t) => {
        return new Date(t.transactionDate).getMonth() === new Date().getMonth()
    })
    if (pFilteredArray.length > 0) {
        let sum = pFilteredArray.reduce((prev, next) => {
            return { amount: prev.amount + next.amount }
        })
        totalPoints += sum.amount;
    }
    const children = []
    let queue = []
    if (parent.sub && parent.sub.length > 0) {
        queue.push(...parent.sub)
    }
    while (queue.length && queue.length > 0) {
        let child = await Associate.findOne({ username: queue[0] })
        if (child) {
            children.push(child)
            if (child.sub && child.sub.length > 0) {
                queue.push(...child.sub)
            }
            queue.shift()
        } else {
            queue.shift()
        }
    }

    var bar = new Promise(async(resolve, reject) => {
        children.forEach(async(value, index, array) => {
            const transactions = await Transactions.find({ username: value.username })

            let minValue = value.Levels[value.Levels.length - 1];
            const filteredArray = transactions.filter((t) => {
                return new Date(t.transactionDate).getMonth() === new Date().getMonth()
            })

            if (filteredArray.length > 0) {
                let sum = filteredArray.reduce((prev, next) => {
                    return { amount: prev.amount + next.amount }
                })
                totalPoints += sum.amount

            }
            if (index === array.length - 1) resolve();

        })
    });
    bar.then(() => {
        res.json({ earnedPoints: totalPoints })
    });
}

const getEarnedPointsWithLevel = async(req, res) => {
    const { parentUserName } = req.body;
    const parent = await Associate.findOne({ username: parentUserName })
        //let uptoLevel = parseInt(parent.Levels[0].Downline)
    let uptoLevel = parseInt(parent.Levels[parent.Levels.length - 1].Downline)
    let activeCount = 0,
        inActiveCount = 0;
    let totalPoints = 0;
    let level = 0;
    const pTransactions = await Transactions.find({ username: parentUserName })
    const pFilteredArray = pTransactions.filter((t) => {
        return new Date(t.transactionDate).getMonth() === new Date().getMonth()
    })
    if (pFilteredArray.length > 0) {
        let sum = pFilteredArray.reduce((prev, next) => {
            return { amount: prev.amount + next.amount }
        })
        totalPoints += sum.amount;
    }
    const children = []
    let queue = {};
    let oldQueue = []
    if (parent.sub && parent.sub.length > 0) {
        level++
        queue[level] = [...parent.sub]
        uptoLevel--;
    }
    while (queue[level] && queue[level].length > 0) {

        if (uptoLevel >= 0) {
            uptoLevel--;
            for (var i = 0; i < queue[level].length; i++) {
                let child = await Associate.findOne({ username: queue[level][i] })
                if (child) {
                    children.push(child)
                    if (queue[level + 1]) {
                        queue[level + 1].push(...child.sub)
                    } else {
                        queue[level + 1] = [...child.sub]
                    }
                }
            }
            level++;

        } else {}
    }


    var bar = new Promise(async(resolve, reject) => {
        children.forEach(async(value, index, array) => {
            const transactions = await Transactions.find({ username: value.username })

            let minValue = value.Levels[value.Levels.length - 1];
            const filteredArray = transactions.filter((t) => {
                return new Date(t.transactionDate).getMonth() === new Date().getMonth()
            })

            if (filteredArray.length > 0) {
                let sum = filteredArray.reduce((prev, next) => {
                    return { amount: prev.amount + next.amount }
                })
                totalPoints += sum.amount
            }
            if (index === array.length - 1) resolve();

        })
    });
    bar.then(() => {
        res.json({ earnedPoints: totalPoints })
    });
}

const Gynealogy1 = async(req, res) => {
    let values = req.body;
    let response = {
        "username": values.username,
        "firstName": null,
        "lastName": null,
        "referralusername": "A000000002",
        "parentId": "",
        "activecount": 0,
        "inactivecount": 0,
        "totalcount": 0,
        "status": 2,
        "statusName": "pending",
        "image_url": "https://enn-richh.s3.ap-south-1.amazonaws.com/AWSERROR.PNG",
        "companyReferral": false,
        "left": 0,
        "middle": 0,
        "right": 0,
        "businessDone": 223,
        "overallPoints": 1.115,
        "tree": [{
                "username": "",
                "firstName": "",
                "lastName": "",
                "referralusername": "",
                "leg": 0,
                "status": 0,
                "image_url": "",
                "companyReferral": false,
                "left": 0,
                "middle": 0,
                "right": 0,
                "businessDone": 0,
                "overallPoints": 0,
                "tree": [{
                        "username": "",
                        "firstName": "",
                        "lastName": "",
                        "referralusername": "",
                        "leg": 0,
                        "status": 0,
                        "image_url": "",
                        "companyReferral": false,
                        "left": 0,
                        "middle": 0,
                        "right": 0,
                        "businessDone": 0,
                        "overallPoints": 0
                    },
                    {
                        "username": "",
                        "firstName": "",
                        "lastName": "",
                        "referralusername": "",
                        "leg": 0,
                        "status": 0,
                        "image_url": "",
                        "companyReferral": false,
                        "left": 0,
                        "middle": 0,
                        "right": 0,
                        "businessDone": 0,
                        "overallPoints": 0
                    },
                    {
                        "username": "",
                        "firstName": "",
                        "lastName": "",
                        "referralusername": "",
                        "leg": 0,
                        "status": 0,
                        "image_url": "",
                        "companyReferral": false,
                        "left": 0,
                        "middle": 0,
                        "right": 0,
                        "businessDone": 0,
                        "overallPoints": 0
                    }
                ]
            },
            {
                "username": "",
                "firstName": "",
                "lastName": "",
                "referralusername": "",
                "leg": 0,
                "status": 0,
                "image_url": "",
                "companyReferral": false,
                "left": 0,
                "middle": 0,
                "right": 0,
                "businessDone": 0,
                "overallPoints": 0,
                "tree": [{
                        "username": "",
                        "firstName": "",
                        "lastName": "",
                        "referralusername": "",
                        "leg": 0,
                        "status": 0,
                        "image_url": "",
                        "companyReferral": false,
                        "left": 0,
                        "middle": 0,
                        "right": 0,
                        "businessDone": 0,
                        "overallPoints": 0
                    },
                    {
                        "username": "",
                        "firstName": "",
                        "lastName": "",
                        "referralusername": "",
                        "leg": 0,
                        "status": 0,
                        "image_url": "",
                        "companyReferral": false,
                        "left": 0,
                        "middle": 0,
                        "right": 0,
                        "businessDone": 0,
                        "overallPoints": 0
                    },
                    {
                        "username": "",
                        "firstName": "",
                        "lastName": "",
                        "referralusername": "",
                        "leg": 0,
                        "status": 0,
                        "image_url": "",
                        "companyReferral": false,
                        "left": 0,
                        "middle": 0,
                        "right": 0,
                        "businessDone": 0,
                        "overallPoints": 0
                    }
                ]
            },
            {
                "username": "",
                "firstName": "",
                "lastName": "",
                "referralusername": "",
                "leg": 0,
                "status": 0,
                "image_url": "",
                "companyReferral": false,
                "left": 0,
                "middle": 0,
                "right": 0,
                "businessDone": 0,
                "overallPoints": 0,
                "tree": [{
                        "username": "",
                        "firstName": "",
                        "lastName": "",
                        "referralusername": "",
                        "leg": 0,
                        "status": 0,
                        "image_url": "",
                        "companyReferral": false,
                        "left": 0,
                        "middle": 0,
                        "right": 0,
                        "businessDone": 0,
                        "overallPoints": 0
                    },
                    {
                        "username": "",
                        "firstName": "",
                        "lastName": "",
                        "referralusername": "",
                        "leg": 0,
                        "status": 0,
                        "image_url": "",
                        "companyReferral": false,
                        "left": 0,
                        "middle": 0,
                        "right": 0,
                        "businessDone": 0,
                        "overallPoints": 0
                    },
                    {
                        "username": "",
                        "firstName": "",
                        "lastName": "",
                        "referralusername": "",
                        "leg": 0,
                        "status": 0,
                        "image_url": "",
                        "companyReferral": false,
                        "left": 0,
                        "middle": 0,
                        "right": 0,
                        "businessDone": 0,
                        "overallPoints": 0
                    }
                ]
            }
        ]
    }
    let response1 = {};
    response1.code = 200;
    response1.success = true;
    response1.message = "Genealogy Retrieved Success.";
    response1.data = response,
        response1.timestamp = new Date();
    res.send(response1);
};

const GynealogyWeb = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("username") && values.username != '' && values.username != null && values.username != undefined) {
        let UserData = await CheckWheatherUserExists(values);
        let LadderData = await GetLadderInformationCount(values);
        let responseData = {};

        let LeftRightData = await LeftRightCounts(values);

        let tree = [];
        if (LadderData.hasOwnProperty("1")) {
            for (each in LadderData["1"]) {
                let treeDataJSON = {};
                treeDataJSON.username = LadderData["1"][each].username;
                treeDataJSON.firstName = LadderData["1"][each].firstName;
                treeDataJSON.lastName = LadderData["1"][each].lastName;
                treeDataJSON.referralusername = LadderData["1"][each].referrer.referralid;
                treeDataJSON.leg = each + 1;
                let newStatus = await GetUserActiveInactiveData({ username: LadderData["1"][each].username, 'Levels': LadderData["1"][each].Levels });
                //console.log("new Status 1------->",newStatus)
                if (newStatus.hasOwnProperty("statusName") && newStatus.hasOwnProperty("status")) {
                    treeDataJSON.status = newStatus.status;
                    treeDataJSON.statusName = newStatus.statusName;
                }
                treeDataJSON.image_url = "https://enn-richh.s3.ap-south-1.amazonaws.com/AWSERROR.PNG";
                if (treeDataJSON.referralid == "OL00000001") {
                    treeDataJSON.companyReferral = true;
                } else {
                    treeDataJSON.companyReferral = false;
                }
                let LeftRightDataSUB = await LeftRightCounts({ username: LadderData["1"][each].username });
                treeDataJSON.left = LeftRightDataSUB.left;
                treeDataJSON.middle = LeftRightDataSUB.middle;
                treeDataJSON.right = LeftRightDataSUB.right;
                tree.push(treeDataJSON);
            }
        }

        let tree1 = [];
        if (LadderData.hasOwnProperty("2")) {
            for (each in LadderData["2"]) {
                let treeDataJSON = {};
                treeDataJSON.username = LadderData["2"][each].username;
                treeDataJSON.firstName = LadderData["2"][each].firstName;
                treeDataJSON.lastName = LadderData["2"][each].lastName;
                treeDataJSON.referralusername = LadderData["2"][each].referrer.referralid;
                treeDataJSON.leg = each + 1;
                let newStatus = await GetUserActiveInactiveData({ username: LadderData["2"][each].username, 'Levels': LadderData["2"][each].Levels });
                //console.log("new Status 2------->",newStatus)
                if (newStatus.hasOwnProperty("statusName") && newStatus.hasOwnProperty("status")) {
                    treeDataJSON.status = newStatus.status;
                    treeDataJSON.statusName = newStatus.statusName;
                }
                treeDataJSON.image_url = "https://enn-richh.s3.ap-south-1.amazonaws.com/AWSERROR.PNG";
                if (treeDataJSON.referralusername == "OL00000001") {
                    treeDataJSON.companyReferral = true;
                } else {
                    treeDataJSON.companyReferral = false;
                }
                let LeftRightDataSUB = await LeftRightCounts({ username: LadderData["2"][each].username });
                treeDataJSON.left = LeftRightDataSUB.left;
                treeDataJSON.middle = LeftRightDataSUB.middle;
                treeDataJSON.right = LeftRightDataSUB.right;
                tree1.push(treeDataJSON);
            }
        }

        responseData.username = UserData.username;
        responseData.firstName = UserData.firstName;
        responseData.lastName = UserData.lastName;
        responseData.referralusername = UserData.referrer.referralid;
        responseData.parentId = UserData.parentId;
        responseData.activecount = 0;
        responseData.inactivecount = 0;
        responseData.totalcount = 0;
        //responseData.status = UserData.status;
        let newStatus = await GetUserActiveInactiveData({ username: UserData.username, 'Levels': UserData.Levels });
        //console.log("new Status 3------->",newStatus)
        if (newStatus.hasOwnProperty("statusName") && newStatus.hasOwnProperty("status")) {
            responseData.status = newStatus.status;
            responseData.statusName = newStatus.statusName;
        }
        responseData.image_url = "https://enn-richh.s3.ap-south-1.amazonaws.com/AWSERROR.PNG";
        if (UserData.referrer.referraluid == "OL00000001") {
            responseData.companyReferral = true;
        } else {
            responseData.companyReferral = false;
        }
        responseData.left = LeftRightData.left;
        responseData.middle = LeftRightData.middle;
        responseData.right = LeftRightData.right;

        // //Need to remove this in future
        // console.log("Ladder Data--------------->",LadderData)
        // for(each in LadderData){
        //     responseData.totalcount = responseData.totalcount + LadderData[each].length;
        //     let newLadder = LadderData[each];
        //     for(each1 in newLadder){
        //         if(newLadder[each1].status == 0){
        //             responseData.inactivecount = responseData.inactivecount + 1;
        //         }else if(newLadder[each1].status == 1){
        //             responseData.activecount = responseData.activecount + 1;
        //         }
        //     }
        // }
        let activeInactiveCount = await GetLadderInformationAssociateGynealogyWeb(values);
        let AllLadderInformation = [];
        let activecount = 0;
        for (each in activeInactiveCount) {
            let level = each;
            for (each1 in activeInactiveCount[each]) {
                let temp = {}
                temp.username = activeInactiveCount[each][each1].username;
                if (activeInactiveCount[each][each1].hasOwnProperty("isActive") && activeInactiveCount[each][each1].isActive == true) {
                    console.log("isaActive true")
                    activecount = activecount + 1;
                }
                AllLadderInformation.push(temp)
            }
        }
        let totalcount = AllLadderInformation.length;
        let inactivecount = totalcount - activecount;

        if (activeInactiveCount) {
            responseData.activecount = activecount;
            responseData.inactivecount = inactivecount;
            responseData.totalcount = totalcount;
        }
        if (tree.length < 3) {
            let emptyUser = {};
            emptyUser.username = "";
            emptyUser.firstName = "";
            emptyUser.lastName = "";
            emptyUser.referralusername = "";
            emptyUser.leg = 0;
            emptyUser.status = 0;
            emptyUser.image_url = "";
            emptyUser.companyReferral = false;
            emptyUser.left = 0;
            emptyUser.middle = 0;
            emptyUser.right = 0;
            if (tree.length == 0) {
                tree.push(emptyUser);
                tree.push(emptyUser);
                tree.push(emptyUser);
            }
            if (tree.length == 1) {
                tree.push(emptyUser);
                tree.push(emptyUser);
            }
            if (tree.length == 2) {
                tree.push(emptyUser);
            }
        }

        if (tree1.length < 9) {
            let emptyUser = {};
            emptyUser.username = "";
            emptyUser.firstName = "";
            emptyUser.lastName = "";
            emptyUser.referralusername = "";
            emptyUser.leg = 0;
            emptyUser.status = 0;
            emptyUser.image_url = "";
            emptyUser.companyReferral = false;
            emptyUser.left = 0;
            emptyUser.middle = 0;
            emptyUser.right = 0;

            let tree1Length = tree1.length;
            let count = 9 - tree1Length;
            for (var i = 0; i < count; i++) {
                tree.push(emptyUser)
            }
        }

        responseData.tree = tree;
        res.send(responseData)
    } else {
        res.send({
            success: false,
            code: 201,
            Status: "Invalid Username Provided.",
            "timestamp": new Date()
        });
    }
});


const GetLadderInformationAssociateGynealogyWeb = async(values) => {

    let parentUserName = values.username;
    const parent = await Associate.findOne({ username: parentUserName }, { username: 1, sub: 1, isActive: 1, _id: 0 })
    if (!parent) {
        return ({ message: 'Parent not found' })
    } else {
        const endArrayObject = {}
        var tempParent = JSON.parse(JSON.stringify(parent))
        var queue = []
        var index = 0;
        queue.push({
            parentIndex: index,
            id: tempParent.username
        })
        while (queue.length) {
            let { id: newId, parentIndex } = queue.shift()
            let newParent = await Associate.findOne({ username: newId }, { username: 1, sub: 1, isActive: 1, _id: 0 })
            for (var j = 0; j < newParent.sub.length; j++) {
                var child = await Associate.findOne({ username: newParent.sub[j] }, { username: 1, sub: 1, isActive: 1, _id: 0 })
                if (child) {
                    queue.push({
                        parentIndex: parentIndex + 1,
                        id: child.username
                    })
                    if (endArrayObject[`${parentIndex + 1}`]) {
                        endArrayObject[`${parentIndex + 1}`].push(child)
                    } else {
                        endArrayObject[`${parentIndex + 1}`] = []
                        endArrayObject[`${parentIndex + 1}`].push(child)
                    }
                }
            }
        }

        return (endArrayObject)
    }
}

const GetVendorRegisteredCategories = catchAsync(async(req, res) => {
    try {
        let query = { status: 0 };
        let project = {
            _id: 0,
            Category: 1
        }
        let VendorCategories = await Vendor.find(query, project).lean().exec();
        let allcategoryids = [];
        if (VendorCategories.length > 0) {
            for (each in VendorCategories) {
                if (VendorCategories[each].hasOwnProperty("Category")) {
                    let eachvendorcat = VendorCategories[each].Category;
                    for (each1 in eachvendorcat) {
                        allcategoryids.push(eachvendorcat[each1].id)
                    }
                }
            }
        }
        let uniqueChars = [];
        if (allcategoryids.length > 0) {
            uniqueChars = [...new Set(allcategoryids)];
        }
        let newQuery = { "id": uniqueChars }
        if (req && req.body && req.body.hasOwnProperty("primaryCategory")) {
            newQuery.primaryCategory = req.body.primaryCategory;
        }
        console.log("newQuery-------->", newQuery)
        let allcat = await Categories.find(newQuery, { "_id": 0 }).sort({ 'name': 1 }).lean().exec();
        res.send({
            success: true,
            code: 200,
            Status: "Categories retrieved success.",
            data: allcat,
            "timestamp": new Date()
        });
    } catch (error) {
        console.error(error);
        res.send({
            success: false,
            code: 201,
            Status: "Database Error",
            "timestamp": new Date()
        });
    }
});

const GetAllMemberships = catchAsync(async(req, res) => {
    try {
        let query = {};
        let project = {
            _id: 0
        }
        query.status = 0;
        let AllMemberships = await MembershipModel.find(query, project).sort({ 'id': 1 }).lean().exec();
        if (AllMemberships.length > 0) {
            res.send({
                success: true,
                code: 200,
                Status: "Memberships retrieved success.",
                data: AllMemberships,
                "timestamp": new Date()
            });
        } else {
            res.send({
                success: true,
                code: 200,
                Status: "No memberships found.",
                data: [],
                "timestamp": new Date()
            })
        }
    } catch (error) {
        console.error(error);
        res.send({
            success: false,
            code: 201,
            Status: "Database Error",
            data: error,
            "timestamp": new Date()
        });
    }
});


const SendNotificationInAssociate = async(values) => {
    try {
        if (values.username && values.notificationbody && values.notificationtitle) {
            let UserData = await CheckWheatherUserExists(values);
            console.log("values------------->", values);
            console.log("UserData------------->", UserData);
            if (UserData && UserData.hasOwnProperty("fcmToken") && UserData.fcmToken != '' && UserData.fcmToken != null && UserData.fcmToken != undefined) {
                let url = process.env.FCM_NOTIFICATIONURL;
                var PreviousNotifications = await Notification.findOne().sort('-id').lean().exec();
                let id = 1;
                if (PreviousNotifications && PreviousNotifications.hasOwnProperty('id')) {
                    id = PreviousNotifications.id + 1;
                } else {
                    id = id;
                }
                let requestdata = {
                    "to": UserData.fcmToken,
                    "notification": {
                        "body": values.notificationbody,
                        "title": values.notificationtitle,
                        "sound": "notification.mp3"
                    },
                    "data": {
                        "body": values.notificationbody,
                        "title": values.notificationtitle,
                        "id": id,
                        //"key_2" : values.key2
                    }
                }
                await axios.post(url, requestdata, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'key=' + process.env.FIREBASE_SERVER_KEY_ASSOCIATE
                        },
                    })
                    .then((response) => {
                        console.log("Notification Response--->", response.data)
                        let NotificationData = {
                            id: id,
                            username: values.username,
                            fcmToken: UserData.fcmToken,
                            userType: "Associate", //Vendor, Associate
                            notificationbody: values.notificationbody,
                            notificationtitle: values.notificationtitle,
                            createdAt: new Date(),
                            status: 0,
                        }
                        Notification(NotificationData).save().then((Result) => {
                            let response1 = {};
                            response1.code = 200;
                            response1.success = true;
                            response1.message = "Notification Sent Success.";
                            response1.timestamp = new Date();
                            return (response1);
                        });
                    })
                    .catch((error) => {
                        let response1 = {};
                        response1.code = 201;
                        response1.success = false;
                        response1.message = "Sending Notification Error." + error;
                        response1.timestamp = new Date();
                        return (response1);
                    });
            } else {
                let response = {};
                response.code = 201;
                response.success = false;
                response.message = "Invalid vendor or Invalid FCM Token";
                response.timestamp = new Date();
                return (response);
            }
        } else {
            let response = {};
            response.code = 201;
            response.success = false;
            response.message = "All Fields are Mandatory.";
            response.timestamp = new Date();
            return (response);
        }
    } catch (err) {
        console.log("Notification sending error---->", err);
    }
}

const SendOTPCodeAssociate = async(req, res) => {
    let values = req.body;
    if (values.phoneNumber && values.phoneNumber != '' && values.phoneNumber != undefined && values.phoneNumber != null) {
        let UserData = await Associate.findOne(values).lean().exec();
        if (UserData && UserData.hasOwnProperty("phoneNumber") && UserData.phoneNumber == values.phoneNumber) {
            let response = {};
            response.code = 201;
            response.success = false;
            response.message = "Phone Number is already registered.";
            response.timestamp = new Date();
            res.send(response);
        } else {
            let checkOTPrecords = await AssociateOtp.findOne(values).lean().exec();
            let randomOTP = Math.floor(100000 + Math.random() * 900000);
            let templateid = AllConstants.SMSTemplateIds.AssociateRegistrationOTPCode;
            let senderid = AllConstants.SenderId.AssociateRegistrationOTPCode;
            let content = AllConstants.SMSContent.AssociateRegistrationOTPCode;
            content = content.replace("{#var#}", randomOTP)
            let number = values.phoneNumber;
            let message = "";

            if (checkOTPrecords && checkOTPrecords.hasOwnProperty("phoneNumber") && checkOTPrecords.phoneNumber == values.phoneNumber) {
                if (checkOTPrecords.repeatcount > 5) {
                    res.send({
                        code: 201,
                        success: false,
                        status: "Max otp count reached, try after sometime.",
                        timestamp: new Date()
                    })
                } else {
                    let queryotp = {
                        phoneNumber: values.phoneNumber
                    }
                    let newvalues = {
                        count: checkOTPrecords.count + 1,
                        otp: randomOTP,
                    }
                    let lastmodified = checkOTPrecords.updatedAt;
                    let timenow = new Date();
                    if (lastmodified.getDate() == timenow.getDate() && lastmodified.getMonth() == timenow.getMonth() && lastmodified.getFullYear() == timenow.getFullYear()) {
                        var diff = (lastmodified.getTime() - timenow.getTime()) / 1000;
                        diff /= 60;
                        let MinutesDifference = Math.abs(Math.round(diff));
                        console.log("MinutesDifference-----", MinutesDifference)
                        if (MinutesDifference < 5) {
                            newvalues.repeatcount = checkOTPrecords.repeatcount + 1;
                        }
                    }
                    let updateOTP = await AssociateOtp.updateOne(queryotp, newvalues).lean().exec();
                    let smsresponse = await SendSMSInAssociate(templateid, senderid, content, number, message);
                    res.send({
                        code: 200,
                        success: true,
                        status: "OTP Send to mobile number.",
                        otp: randomOTP,
                        extras: smsresponse,
                        timestamp: new Date()
                    });
                }
            } else {
                let Data = {
                    phoneNumber: values.phoneNumber,
                    count: 1,
                    repeatcount: 1,
                    otp: randomOTP,
                }
                let saveOTPdataFresh = await AssociateOtp(Data).save();
                let smsresponse = await SendSMSInAssociate(templateid, senderid, content, number, message);
                res.send({
                    code: 200,
                    success: true,
                    status: "OTP Send to mobile number.",
                    otp: randomOTP,
                    extras: smsresponse,
                    timestamp: new Date()
                });
            }
        }
    } else {
        let response = {};
        response.code = 201;
        response.success = false;
        response.message = "Phone Number is Mandatory/Inocrrect phonen Number.";
        response.timestamp = new Date();
        return (response);
    }
}

const VerifyOTPCodeAssociate = async(req, res) => {
    let values = req.body;
    if (values.phoneNumber && values.phoneNumber != '' && values.phoneNumber != null && values.phoneNumber != undefined &&
        values.otp && values.otp != '' && values.otp != null && values.otp != undefined) {
        let checkOTPrecords = await AssociateOtp.findOne(values).lean().exec();
        if (checkOTPrecords && checkOTPrecords.hasOwnProperty("updatedAt")) {
            let lastmodified = checkOTPrecords.updatedAt;
            let timenow = new Date();
            if (lastmodified.getDate() == timenow.getDate() && lastmodified.getMonth() == timenow.getMonth() && lastmodified.getFullYear() == timenow.getFullYear()) {
                var diff = (lastmodified.getTime() - timenow.getTime()) / 1000;
                diff /= 60;
                let MinutesDifference = Math.abs(Math.round(diff));
                console.log("MinutesDifference-----", MinutesDifference)
                if (MinutesDifference > 5) {
                    res.send({
                        code: 201,
                        success: false,
                        status: "OTP expired",
                        minutedfference: MinutesDifference,
                        timestamp: new Date()
                    });
                } else {
                    res.send({
                        code: 200,
                        success: true,
                        status: "OTP verified success.",
                        data: checkOTPrecords,
                        timestamp: new Date()
                    });
                }
            } else {
                res.send({
                    code: 200,
                    success: true,
                    status: "OTP verified success.",
                    data: checkOTPrecords,
                    timestamp: new Date()
                });
            }
        } else {
            res.send({
                code: 201,
                success: false,
                status: "Invalid OTP and phoneNumber Combination.",
                timestamp: new Date()
            })
        }
    } else {
        res.send({
            code: 201,
            success: false,
            status: "OTP and phoneNumber are Mandatory.",
            timestamp: new Date()
        })
    }
}


const GetAllMembershipsvendor = () => {
    return new Promise(async(resolve, reject) => {
        try {
            var query = {};
            query.status = 0;
            let allMemberships = await MembershipModel.find(query).lean().exec();
            if (allMemberships && allMemberships.length > 0) {
                let newMemberships = {}
                for (each in allMemberships) {
                    let a = allMemberships[each].id;
                    let b = allMemberships[each];
                    newMemberships[a] = b;
                }
                resolve(newMemberships);
            } else {
                let newMemberships = {}
                resolve(newMemberships)
            }
        } catch (error) {
            console.error('Something Error');
            console.error(error);
            reject({
                success: false,
                code: 201,
                Status: "Err Retrieving memberships." + error,
                "timestamp": new Date()
            });
        }
    });
}
const GetAllAreas = () => {
    return new Promise(async(resolve, reject) => {
        try {
            var query = {};
            //query.status = 0;
            let allAreas = await Area.find(query).lean().exec();
            if (allAreas && allAreas.length > 0) {
                let newAreas = {}
                for (each in allAreas) {
                    let a = allAreas[each].id;
                    let b = allAreas[each];
                    newAreas[a] = b;
                }
                resolve(newAreas);
            } else {
                let newAreas = {}
                resolve(newAreas)
            }
        } catch (error) {
            console.error('Something Error');
            console.error(error);
            reject({
                success: false,
                code: 201,
                Status: "Err Retrieving areas." + error,
                "timestamp": new Date()
            });
        }
    });
}

const GetAllCategoriesForListAllVendor = () => {
        return new Promise(async(resolve, reject) => {
            try {
                var query = {};
                //query.status = 0;
                let allCategories = await Categories.find(query).lean().exec();
                if (allCategories && allCategories.length > 0) {
                    let newCategories = {}
                    for (each in allCategories) {
                        let a = allCategories[each].id;
                        let b = allCategories[each];
                        newCategories[a] = b;
                    }
                    resolve(newCategories);
                } else {
                    let newCategories = {}
                    resolve(newCategories)
                }
            } catch (error) {
                console.error('Something Error');
                console.error(error);
                reject({
                    success: false,
                    code: 201,
                    Status: "Err Retrieving categories." + error,
                    "timestamp": new Date()
                });
            }
        });
    }
    //ListAllVendorAdmin
const ListAllVendorAdmin = catchAsync(async(req, res) => {
    try {
        let VendorData = await Vendors.find({}, {
            status: 1,
            kycStatus: 1,
            Category: 1,
            area: 1,
            Membership: 1,
            Address: 1,
            firstName: 1,
            lastName: 1,
            username: 1,
            phoneNumber: 1,
            employeeMobile: 1,
            kycDate: 1,
            kycReason: 1,
            createdAt: 1,
            lastModifiedAt: 1,
            fee: 1,
            gst: 1,
            isBank: 1,
            isLocation: 1,
            panNo: 1,
            gstNo: 1,
            delivery: 1,
            Distance: 1,
            isKYC: 1,
            isForm: 1
        }).sort({ 'createdAt': -1 }).lean().exec();
        console.log(VendorData[0])
        let allMembership = await GetAllMembershipsvendor();
        let allArea = await GetAllAreas();
        let allCategories = await GetAllCategoriesForListAllVendor();
        //console.log("allCategories---------->",allCategories)
        //res.send(allArea)
        if (VendorData && VendorData.length > 0) {
            for (each in VendorData) {
                if (VendorData[each].hasOwnProperty("status")) {
                    if (VendorData[each].status === 0) {
                        VendorData[each].StatusName = "Approved";
                    } else if (VendorData[each].status === 1) {
                        VendorData[each].StatusName = "Pending";
                    } else if (VendorData[each].status === 2) {
                        VendorData[each].StatusName = "New User";
                    } else if (VendorData[each].status === 3) {
                        VendorData[each].StatusName = "Rejected";
                    } else if (VendorData[each].status === 3) {
                        VendorData[each].StatusName = "Blocked";
                    }
                }
                if (VendorData[each].hasOwnProperty("kycStatus")) {
                    if (VendorData[each].kycStatus == 0) {
                        VendorData[each].kycStatusName = "Approved";
                    }
                    if (VendorData[each].kycStatus == 1) {
                        VendorData[each].kycStatusName = "Pending";
                    }
                    if (VendorData[each].kycStatus == 2) {
                        VendorData[each].kycStatusName = "Rejected";
                    }
                    if (VendorData[each].kycStatus == 3) {
                        VendorData[each].kycStatusName = "Re-work";
                    }
                }

                if (VendorData[each].hasOwnProperty("Category")) {
                    for (each1 in VendorData[each]["Category"]) {
                        VendorData[each]["Category"][each1] = allCategories[VendorData[each]["Category"][each1].id];
                        // console.log(VendorData[each]["Category"][each])
                    }
                }
                if (VendorData[each].hasOwnProperty("area") && VendorData[each].area.hasOwnProperty("id") && VendorData[each].area.id != null) {
                    if (allArea[VendorData[each].area.id] != '' && allArea[VendorData[each].area.id] != null && allArea[VendorData[each].area.id] != undefined) {
                        VendorData[each].area = allArea[VendorData[each].area.id];
                    }
                }
                if (VendorData[each].hasOwnProperty("Membership") && VendorData[each].Membership.hasOwnProperty("id") && VendorData[each].Membership.id != null) {
                    if (allMembership[VendorData[each].Membership.id] != '' && allMembership[VendorData[each].Membership.id] != null && allMembership[VendorData[each].Membership.id] != undefined) {
                        VendorData[each].Membership = allMembership[VendorData[each].Membership.id];
                    } else {
                        VendorData[each].Membership = {}
                    }
                }
            }

            let vendordataExport = [];
            for (each in VendorData) {
                let newjson = {};
                newjson = VendorData[each];

                // if(VendorData[each].area == undefined){
                //     console.log(VendorData[each]);
                // }

                //if(VendorData[each].hasOwnProperty("area") && VendorData[each].area.hasOwnProperty("name")){
                if (VendorData[each].hasOwnProperty("area") && VendorData[each].area.hasOwnProperty("name")) {
                    newjson.areaname = VendorData[each].area.name;
                } else {
                    newjson.areaname = "";
                }
                // }else{
                //     console.log("Undefined Area----",VendorData[each].area)
                // }

                newjson.fulladdress = VendorData[each].Address.no + ", " + VendorData[each].Address.street + ", " + VendorData[each].Address.city + ", " + VendorData[each].Address.state + ", " + VendorData[each].Address.country;
                newjson.pincode = VendorData[each].Address.pincode;
                if (VendorData[each].hasOwnProperty("Membership") && VendorData[each].Membership.hasOwnProperty("name")) {
                    newjson.membershipname = VendorData[each].Membership.name;
                } else {
                    newjson.membershipname = "";
                }
                newjson.categorynames = "";
                for (each1 in VendorData[each].Category) {
                    if (VendorData[each] && VendorData[each].hasOwnProperty("Category") && VendorData[each].Category[each1] && VendorData[each].Category[each1].hasOwnProperty("name")) {
                        newjson.categorynames = newjson.categorynames + VendorData[each].Category[each1].name + ", "
                    }
                }
                vendordataExport.push(newjson);
            }

            let filePath = await ExportVendorDataExcel(vendordataExport);
            //var fullPublicUrl = `${req.protocol}://${req.get('host')}/`;
            var fullPublicUrl = 'http://paizattoapi.paizatto.com/';
            let downloadurl = `${fullPublicUrl}${filePath}`
            res.send({
                code: 200,
                success: true,
                message: "Vendor's Retrieved Success.",
                data: VendorData,
                downloadurl: downloadurl,
                timestamp: new Date()
            })
        } else {
            res.send({
                code: 201,
                success: false,
                message: "No vendor's exists.",
                timestamp: new Date()
            });
        }
    } catch (error) {
        console.log(error)
        res.send({
            code: 201,
            success: false,
            message: "DATABASE_ERROR.",
            timestamp: new Date()
        });
    }
});

var ExportVendorDataExcel = async(data) => {
    console.log(data[0])
    try {
        const ALL_VENDORS_REPORT_FILES_PATH = path.resolve('public', 'export', 'vendordata');
        if (!fs.existsSync(ALL_VENDORS_REPORT_FILES_PATH)) {
            fs.mkdirSync(ALL_VENDORS_REPORT_FILES_PATH, { recursive: true });
        }
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("vendordata");
        worksheet.columns = [
            //{ header: "Shop Images", key: "shopImages", width: 75 },
            { header: "Created Date", key: "createdAt", width: 25 },
            { header: "Vendor ID", key: "username", width: 25 },
            { header: "Shop Name", key: "firstName", width: 25 },
            { header: "Contact Person Name", key: "lastName", width: 25 },
            { header: "Vendor Mobile No", key: "phoneNumber", width: 25 },
            { header: "Category", key: "categorynames", width: 25 },
            { header: "Address", key: "fulladdress", width: 25 },
            { header: "Area", key: "areaname", width: 25 },
            { header: "Pin code", key: "pincode", width: 25 },
            { header: "Employee Mobile No", key: "employeeMobile", width: 25 },
            { header: "KYC Status", key: "kycStatusName", width: 25 },
            { header: "Overall Status", key: "StatusName", width: 25 },
            { header: "KYC Date", key: "kycDate", width: 25 },
            { header: "KYC Reason", key: "kycReason", width: 25 },
            { header: "Last Modified Date", key: "lastModifiedAt", width: 25 },
            { header: "Fee (%)", key: "fee", width: 25 },
            { header: "GST (%)", key: "gst", width: 25 },
            { header: "Membership", key: "membershipname", width: 25 },
            { header: "Delivery", key: "delivery", width: 25 },
            { header: "Distance", key: "Distance", width: 25 },
            { header: "PAN No", key: "panNo", width: 25 },
            { header: "GST No", key: "gstNo", width: 25 },
            { header: "isBank", key: "isBank", width: 25 },
            { header: "isLocation", key: "isLocation", width: 25 },
            { header: "isKYC", key: "isKYC", width: 25 },
            { header: "isForm", key: "isForm", width: 25 },


        ];
        worksheet.addRows(data);
        let date = new Date();
        let DD = date.getDate();
        if (DD < 10) {
            DD = "0" + DD;
        }
        let MM = date.getMonth() + 1;
        if (MM < 10) {
            MM = "0" + MM;
        }
        let YY = date.getFullYear();
        let getTime = date.getTime();
        let filedate = DD.toString() + MM.toString() + YY.toString() + getTime;
        let fileName = `Vendor_${filedate}.xlsx`;
        await workbook.xlsx.writeFile(path.resolve(ALL_VENDORS_REPORT_FILES_PATH, fileName));
        return `export/vendordata/${fileName}`;
    } catch (err) {
        console.log('Error while generating Sales Summary Report', err);
    }

}

const dashboard = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("username") && values.username != '' && values.username != null && values.username != undefined) {
        getTotalPointsAndAmount(values).then((Result) => {
            if (Result.Data && Result.Data != []) {
                getLevel(values).then((Result1) => {
                    if (Result1.Data && Result1.Data != []) {
                        let data = {...Result.Data, ...Result1.Data }
                        res.send(data)
                    } else {
                        res.send({
                            code: 201,
                            success: false,
                            message: "No data found in levels",
                            timestamp: new Date()
                        });
                    }
                }).catch(err => res.json(err));
            } else {
                res.send({
                    code: 201,
                    success: false,
                    message: "No data found in payouts",
                    timestamp: new Date()
                });
            }
        }).catch(err => res.json(err));
    } else {
        res.send({
            code: 201,
            success: false,
            message: "Associate Username is required.",
            timestamp: new Date()
        });
    }
});

const getTotalPointsAndAmount = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                Payouts.find({ username: values.username }).lean().exec().then((Result) => {
                    if (Result != null && isEmpty(Result) == false) {
                        let totalPoints = 0;
                        let totalAmount = 0;
                        for (let i = 0; i < Result.length; i++) {
                            totalPoints = totalPoints + Result[i].points;
                            totalAmount = totalAmount + Result[i].amount;
                        }
                        resolve({
                            code: 200,
                            success: true,
                            message: "Total points and amount retrieved",
                            Data: {
                                totalPoints: totalPoints,
                                totalAmount: totalAmount
                            },
                            timestamp: new Date()
                        })
                    } else {
                        reject({
                            code: 201,
                            success: false,
                            message: "No payouts found.",
                            timestamp: new Date()
                        });
                    }
                }).catch((err) => {
                    reject({
                        code: 201,
                        success: false,
                        message: "DATABASE_ERROR.",
                        timestamp: new Date()
                    });
                })
            } catch (error) {
                console.error(error);
                reject({
                    success: false,
                    code: 201,
                    Status: "Database Error",
                    "timestamp": new Date()
                });
            }
        });
    });
}

const GetVendorProfileDetails = catchAsync(async(req, res) => {
    try {
        let values = req.body;
        let limit = 20;
        let skip = 0;
        if (values.hasOwnProperty("page")) {
            if (values.page > 0) {
                skip = skip + (limit * (values.page));
            }
        }
        let AllVendorData = await Vendor.find(values).limit(limit).skip(skip).lean().exec();
        if (AllVendorData && AllVendorData.length > 0) {
            for (each in AllVendorData) {
                console.log("each----->", AllVendorData[each])

                if (AllVendorData[each].hasOwnProperty("Bank")) {
                    for (eachData in AllVendorData[each].Bank) {
                        if (AllVendorData[each]["Bank"][eachData] && AllVendorData[each]["Bank"][eachData] != '') {
                            var decipher = crypto.createDecipher(algorithm, key);
                            AllVendorData[each]["Bank"][eachData] = decipher.update(AllVendorData[each]["Bank"][eachData], 'hex', 'utf8') + decipher.final('utf8');
                        }
                    }
                }

                if (AllVendorData[each].Password) {
                    var decipher = crypto.createDecipher(algorithm, key);
                    AllVendorData[each].Password = decipher.update(AllVendorData[each].Password, 'hex', 'utf8') + decipher.final('utf8');
                }

                if (AllVendorData[each].hasOwnProperty("status")) {
                    if (AllVendorData[each].status === 0) {
                        AllVendorData[each].StatusName = "Approved";
                    } else if (AllVendorData[each].status === 1) {
                        AllVendorData[each].StatusName = "Pending";
                    } else if (AllVendorData[each].status === 2) {
                        AllVendorData[each].StatusName = "New User";
                    } else if (AllVendorData[each].status === 3) {
                        AllVendorData[each].StatusName = "Rejected";
                    } else if (AllVendorData[each].status === 4) {
                        AllVendorData[each].StatusName = "Blocked";
                    }
                }
                if (AllVendorData[each].hasOwnProperty("kycStatus")) {
                    if (AllVendorData[each].kycStatus == 0) {
                        AllVendorData[each].kycStatusName = "Approved";
                    }
                    if (AllVendorData[each].kycStatus == 1) {
                        AllVendorData[each].kycStatusName = "Pending";
                    }
                    if (AllVendorData[each].kycStatus == 2) {
                        AllVendorData[each].kycStatusName = "Rejected";
                    }
                    if (AllVendorData[each].kycStatus == 3) {
                        AllVendorData[each].kycStatusName = "Re-work";
                    }
                }

                if (AllVendorData[each].hasOwnProperty("Category")) {
                    for (each1 in AllVendorData[each]["Category"]) {
                        AllVendorData[each]["Category"][each1] = await Categories.findOne({ "id": AllVendorData[each]["Category"][each1].id }).lean().exec();
                    }
                }
                if (AllVendorData[each].hasOwnProperty("area") && AllVendorData[each].area.hasOwnProperty("id") && AllVendorData[each].area.id != null) {
                    AllVendorData[each].area = await Area.findOne({ "id": AllVendorData[each].area.id }).lean().exec();
                }
                if (AllVendorData[each].hasOwnProperty("Membership") && AllVendorData[each].Membership.hasOwnProperty("id") && AllVendorData[each].Membership.id != null) {
                    AllVendorData[each].Membership = await MembershipModel.findOne({ "id": AllVendorData[each].Membership.id }).lean().exec();
                }
            }
            res.send({
                code: 200,
                success: true,
                message: "Vendors Retrieved.",
                data: AllVendorData,
                timestamp: new Date()
            })
        } else {
            res.send({
                code: 201,
                success: false,
                message: "No vendors matched.",
                data: [],
                timestamp: new Date()
            })
        }
    } catch (err) {
        console.log("error in get vendor----", err)
        res.send(err)
    }
});

const sliderdetails = catchAsync(async(req, res) => {
    let values = req.body;
    isliders.find(values).lean().exec().then((Result) => {
        if (Result && Result.length > 0) {
            res.send({
                code: 200,
                success: true,
                message: "Data Retrieved Success.",
                data: Result,
                timestamp: new Date()
            })
        } else {
            res.send({
                code: 201,
                success: false,
                message: "No Data exists.",
                timestamp: new Date()
            });
        }
    }).catch((err) => {
        res.send({
            code: 201,
            success: false,
            message: "DATABASE_ERROR.",
            timestamp: new Date()
        });
    })
});

const addsliderdetails = catchAsync(async(req, res) => {
    let values = req.body;
    var Previouspoints = await isliders.findOne().sort('-id').lean().exec();
    let id = 1;
    if (Previouspoints && Previouspoints.hasOwnProperty('id')) {
        id = Previouspoints.id + 1;
    } else {
        id = id;
    }
    let Data = {
        id: id,
        image: values.image,
        deeplink: values.deeplink,
        title: values.title,
        description: values.description,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastModifiedAt: new Date(),
        LastModifiedBy: '',

    }
    isliders(Data).save().then((Result) => {
        res.send({
            success: true,
            code: 200,
            Status: " Data Saved Success",
        });
    }).catch((err) => {
        console.error('Database Error');
        console.error(err);
        res.send({
            success: false,
            code: 200,
            Status: "Database Error",
            Data: {

            },
            "timestamp": new Date()

        });
    })

});

const ReadNotification = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("id") && values.id != '' && values.id != null && values.id != undefined) {
        let query = {
            id: values.id,
            userType: "Associate"
        }
        let changes = {
            $set: {
                isRead: true,
                updatedAt: new Date()
            }
        }
        Notification.updateOne(query, changes).lean().exec().then((UpdateStatus) => {
            console.log(UpdateStatus);
            res.json({
                code: 200,
                success: true,
                message: "Notification Update Success.",
                timestamp: new Date()
            });
        }).catch((err) => {
            console.log(err);
            res.json({
                success: false,
                code: 201,
                Status: "Database Error",
                Data: {

                },
                "timestamp": new Date()
            })
        });
    } else {
        res.json({
            success: false,
            code: 201,
            Status: "Invalid Notification Id",
            Data: {

            },
            "timestamp": new Date()
        })
    }
});

const GetAllNotification = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("username") && values.username != '' && values.username != null && values.username != undefined) {
        let query = {
            username: values.username
        }
        if (values.hasOwnProperty("isRead")) {
            query.isRead = values.isRead
        }
        console.log(query)
        let allNotifications = await Notification.find(query).sort({ createdAt: -1 }).lean().exec();
        if (allNotifications && allNotifications.length > 0) {
            res.json({
                success: true,
                code: 200,
                Status: "Notifications Retrieved Success.",
                Data: allNotifications,
                "timestamp": new Date()
            })
        } else {
            res.json({
                success: true,
                code: 200,
                Status: "No Data Found.",
                Data: [],
                "timestamp": new Date()
            })
        }
    } else {
        res.json({
            success: false,
            code: 201,
            Status: "Invalid Vendor Username",
            Data: {

            },
            "timestamp": new Date()
        })
    }
});

const GetLadderInformationAssociate = async (values) => {
        
    let parentUserName  = values.username;
    const parent = await Associate.findOne({ username: parentUserName },{username:1, sub:1, firstName:1, lastName:1, phoneNumber:1, Address:1, referrer:1, _id:0,status:1})
    if (!parent) {
        return({message: 'Parent not found'})
    }
   else {
        const endArrayObject = {}
        var tempParent = JSON.parse(JSON.stringify(parent))
        var queue = []
        var index = 0;
        queue.push({
            parentIndex: index,
            id: tempParent.username
        })
        while(queue.length) {
            let {id: newId, parentIndex} = queue.shift()
            let newParent = await Associate.findOne({ username: newId },{username:1, sub:1, firstName:1, lastName:1, phoneNumber:1, Address:1, referrer:1, _id:0,status:1})
            for(var j = 0 ; j < newParent.sub.length ; j++) {
                var child = await Associate.findOne({ username: newParent.sub[j] },{username:1, sub:1, firstName:1, lastName:1, phoneNumber:1, Address:1, referrer:1, _id:0,status:1})
               if (child) {
                queue.push({
                    parentIndex: parentIndex + 1,
                    id: child.username
                })
                if (endArrayObject[`${parentIndex + 1}`]) {
                    endArrayObject[`${parentIndex + 1}`].push(child) 
                } else {
                    endArrayObject[`${parentIndex + 1}`] = []
                    endArrayObject[`${parentIndex + 1}`].push(child) 
                }
               }
            }   
        }
        
        return(endArrayObject) 
    }
}

const DownlineReportOfUser = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("username") && values.username != '' && values.username != null && values.username != undefined) {
        try {
            let LadderInformationOfUser = await GetLadderInformationAssociate(values);
            let onlyuserNamesLadder = {}
            let allChildren = [];
            let oldLadderArray = {};
            for(each in LadderInformationOfUser){
                for(each1 in LadderInformationOfUser[each]){
                    oldLadderArray[LadderInformationOfUser[each][each1].username] = "Level- "+each;
                    allChildren.push(LadderInformationOfUser[each][each1].username)
                }
                onlyuserNamesLadder[each] = oldLadderArray;
            }
            let AllLadderInformation = [];
            for (each in LadderInformationOfUser) {
                let level = each;
                for (each1 in LadderInformationOfUser[each]) {
                    let temp = {}
                    temp.username = LadderInformationOfUser[each][each1].username;
                    temp.associateLevel = oldLadderArray[LadderInformationOfUser[each][each1].username];
                    temp.level = level;
                    temp.associateName = LadderInformationOfUser[each][each1].firstName + " " + LadderInformationOfUser[each][each1].lastName;
                    temp.mobileNumber = LadderInformationOfUser[each][each1].phoneNumber;
                    temp.city = LadderInformationOfUser[each][each1].Address.city;
                    temp.pincode = LadderInformationOfUser[each][each1].pincode;
                    temp.referredby = LadderInformationOfUser[each][each1].referrer.referralid;
                    temp.status = LadderInformationOfUser[each][each1].status.toString();
                    AllLadderInformation.push(temp)
                }
            }
            let filePath = await ExportDownlineReportDataExcel(AllLadderInformation);
            var fullPublicUrl = 'http://paizattoapi.paizatto.com/';
            let downloadurl = `${fullPublicUrl}${filePath}`
            res.send({
                success: true,
                code: 200,
                Status: "Downline Report Retrieved Success.",
                Data: AllLadderInformation,
                downloadurl: downloadurl,
                "timestamp": new Date()
            })
        } catch (err) {
            console.log(err)
            res.send(err)
        }
    } else {
        res.json({
            success: false,
            code: 201,
            Status: "Invalid Associate Username",
            Data: {

            },
            "timestamp": new Date()
        })
    }
});

var ExportDownlineReportDataExcel = async(data) => {
    console.log(data[0])
    try {
        const ALL_DOWNLINE_REPORT_FILES_PATH = path.resolve('public', 'export', 'downlinereport');
        if (!fs.existsSync(ALL_DOWNLINE_REPORT_FILES_PATH)) {
            fs.mkdirSync(ALL_DOWNLINE_REPORT_FILES_PATH, { recursive: true });
        }
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("downlinereport");
        worksheet.columns = [
            { header: "Username", key: "username", width: 25 },
            { header: "Associate Name", key: "associateName", width: 25 }, 
            { header: "Associate Level", key: "associateLevel", width: 25 }, 
            { header: "Mobile Number", key: "mobileNumber", width: 25 },
            { header: "City", key: "city", width: 25 },
            { header: "Referredby", key: "referredby", width: 25 },
            { header: "Level", key: "level", width: 25 },
            { header: "Status", key: "status", width: 25 }, 
        ];
        worksheet.addRows(data);
        let date = new Date();
        let DD = date.getDate();
        if (DD < 10) {
            DD = "0" + DD;
        }
        let MM = date.getMonth() + 1;
        if (MM < 10) {
            MM = "0" + MM;
        }
        let YY = date.getFullYear();
        let getTime = date.getTime();
        let filedate = DD.toString() + MM.toString() + YY.toString() + getTime;
        let fileName = `Downline_${filedate}.xlsx`;
        await workbook.xlsx.writeFile(path.resolve(ALL_DOWNLINE_REPORT_FILES_PATH, fileName));
        return `export/downlinereport/${fileName}`;
    } catch (err) {
        console.log('Error while generating Sales Summary Report', err);
    }

}

const OverallEarnback = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("username") && values.username != '' && values.username != null && values.username != undefined) {
        try {
            // username
            // date
            // points
            // poiunts type :0 Payout Points, 3 Referral Points, 2 Paizatto Points as [Activation Points]
            let points = await Point.find({ customerUsername: values.username }, { _id: 0, customerUsername: 1, points: 1, pointsType: 1, transactionDate: 1, amount: 1 }).lean().exec();
            let paizattopoints = await PaizattoPoints.find({ customerUsername: values.username }, { _id: 0, customerUsername: 1, points: 1, pointsType: 1, transactionDate: 1 }).lean().exec();
            console.log(points.length)
            console.log(paizattopoints.length)
            let responsearray = [];
            responsearray = points.concat(paizattopoints);
            if (responsearray.length > 0) {
                for (each in responsearray) {
                    responsearray[each].transactionDate = Formatter.toDate(responsearray[each].transactionDate); 
                    if(responsearray[each].amount != undefined)
                    {
                        responsearray[each].amount = Formatter.toINR(responsearray[each].amount);
                    }
                    else
                    {
                        responsearray[each].amount =Formatter.toINR(0);
                    }
                    responsearray[each].points = responsearray[each].points.toFixed(2);
                    if (responsearray[each].hasOwnProperty("pointsType")) {
                        if (responsearray[each].pointsType == 0) {
                            responsearray[each].pointsType = "Payout Points"
                        }
                        if (responsearray[each].pointsType == 0) {
                            responsearray[each].pointsType = "Referral Points"
                        }
                        if (responsearray[each].pointsType == 2) {
                            responsearray[each].pointsType = "Paizatto Points"
                        }
                    }
                }
            }
            let filePath = await ExportOverallearnbackReportsDataExcel(responsearray);
            var fullPublicUrl = 'http://paizattoapi.paizatto.com/';
            let downloadurl = `${fullPublicUrl}${filePath}`
            res.send({
                success: true,
                code: 200,
                Status: "Associate Points Report Retrieved Success.",
                Data: responsearray,
                downloadurl: downloadurl,
                "timestamp": new Date()
            })
        } catch (err) {
            console.log(err)
            res.send(err)
        }
    } else {
        res.json({
            success: false,
            code: 201,
            Status: "Invalid Associate Username",
            Data: {

            },
            "timestamp": new Date()
        })
    }
});

var ExportOverallearnbackReportsDataExcel = async(data) => {
    console.log(data[0])
    try {
        const ALL_DOWNLINE_REPORT_FILES_PATH = path.resolve('public', 'export', 'overallearnback_data');
        if (!fs.existsSync(ALL_DOWNLINE_REPORT_FILES_PATH)) {
            fs.mkdirSync(ALL_DOWNLINE_REPORT_FILES_PATH, { recursive: true });
        }
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("overallearnback_data");
        worksheet.columns = [
            { header: "customer Username", key: "customerUsername", width: 25 },
            { header: "Points", key: "points", width: 25 },
            { header: "PointsType", key: "pointsType", width: 25 },
            { header: "Amount", key: "amount", width: 25 },
            { header: "Transaction Date", key: "transactionDate", width: 25 },
        ];
        worksheet.addRows(data);
        let date = new Date();
        let DD = date.getDate();
        if (DD < 10) {
            DD = "0" + DD;
        }
        let MM = date.getMonth() + 1;
        if (MM < 10) {
            MM = "0" + MM;
        }
        let YY = date.getFullYear();
        let getTime = date.getTime();
        let filedate = DD.toString() + MM.toString() + YY.toString() + getTime;
        let fileName = `earnback_${filedate}.xlsx`;
        await workbook.xlsx.writeFile(path.resolve(ALL_DOWNLINE_REPORT_FILES_PATH, fileName));
        return `export/overallearnback_data/${fileName}`;
    } catch (err) {
        console.log('Error while generating Sales Summary Report', err);
    }

}

const categorylist = catchAsync(async(req, res) => {
    primary.find().sort({id:1}).lean().exec().then(async (Result) => {
        var newdata = new Array();
        for(var i=0;i<Result.length;i++)
        {
            var primarycategory1 = new Array();
            if(Result[i].id != '' && Result[i].id != null && Result[i].id != undefined)
            {
                var primarycategory = await categories.find({primaryCategory:Result[i].id}).lean().exec();
                let Data = 
                {
                    "primarycategoryid":Result[i].id,
                    "primarycategoryname":Result[i].title
                };
                if(primarycategory != '' && primarycategory != null && primarycategory != undefined)
                {
                    for(var j=0; j<primarycategory.length; j++)
                    {
                        primarycategory1.push({
                            "categoryid":primarycategory[j].id,
                            "categoryname":primarycategory[j].name
                        });
                    }
                    Data.category = primarycategory1
                    newdata.push(Data);
                }
            }
        }
        if (newdata && newdata.length > 0) {
            res.send({
                code: 200,
                success: true,
                message: "Data Retrieved Success.",
                data: newdata,
                timestamp: new Date()
            })
        } else {
            res.send({
                code: 201,
                success: false,
                message: "No Data exists.",
                timestamp: new Date()
            });
        }
    }).catch((err) => {
        res.send({
            code: 201,
            success: false,
            message: "DATABASE_ERROR.",
            timestamp: new Date()
        });
    })
});

const isfavourite = catchAsync(async(req, res) => {
    let values = req.body;
    if(values.hasOwnProperty("username") && values.username != '' && values.username != null && values.username != undefined){
        let query = {
            username:values.username
        }
        let changes = {
            $set:values
        }
        await Vendors.updateOne(query, changes, {upsert:true}).lean().exec().then((UpdateStatus) => {
        res.send({
            code: 200,
            success: true,
            message: "Data Update Success.",
            timestamp: new Date()
        })
    }).catch((err) => {
        res.send({
            code: 201,
            success: false,
            message: "DATABASE_ERROR.",
            timestamp: new Date()
        });
    })
    }else{
        res.send({
            code:201,
            success: false,
            message:"Username required to update products.",
            data:{},
            timestamp: new Date()
        });
    }
});

const isfavouritedetails = catchAsync(async (req, res) => {
    await Vendors.find({isfavourite:1}).lean().exec().then((Result) => {
        if (Result && Result.length > 0) {
            res.send({
                code: 200,
                success: true,
                message: "Data Retrieved Success.",
                data: Result,
                timestamp: new Date()
            })
        } else {
            res.send({
                code: 201,
                success: false,
                message: "No Data exists.",
                timestamp: new Date()
            });
        }
    }).catch((err) => {
        res.send({
            code: 201,
            success: false,
            message: "DATABASE_ERROR.",
            timestamp: new Date()
        });
    })
});




module.exports = {
    GetUserActiveInactiveData,
    register_associate,
    AssociateMandatoryFieldsValidation,
    AutocompletionServiceGetPredictions,
    PasswordandConfirmPasswordValidation,
    GenerateUniqueUserIdForAssociate,
    Register_Associate,
    MobileandRenterMobileValidation,
    PinCodeValidation,
    TermsAndConditionsValidation,
    CheckWheatherMobileExistsAlready,
    ValidateReferralId,
    ValidateReferralUId,
    SendOTPAssociate,
    VerifyOTPAssociate,
    //LoginAssociate,
    forgotPassword,
    ValidateReferralIdAPI,
    ValidateReferralUIdAPI,
    ValidateReferralIdAndGetReferralData,
    UpdatePersonalDetailsAssociate,
    GetBankDetailsWithIFSC,
    GetAssociateDetails,
    UpdateAssociatePassword,
    VerifyPhoneNumberExistsAlready,
    LoginAssociate,
    OTPLoginAssociate,
    ValidateIFSCCode,
    GetAllVendors,
    UpdateAssociateKYC,
    UpgradeLevel,
    GetAssociateDetailsWithUserName,

    CheckWheatherUserExists,
    Gynealogy,
    DashboardAssociate,
    FAQAssoiate,
    ContactUsAssoiate,
    addChild,
    getAllChildren,

    GetLevelZeroData,
    GetAssociateLevelInformation,
    getEarnedPointsUserDashboard,
    getActiveCount,
    getEarnedPoints,
    getEarnedPointsWithLevel,
    SendNotification,
    GetLadderInformationCount,

    //Need to delete this one
    Gynealogy1,
    GetLevelInfo,
    UpgradeLevelAssociate,
    GynealogyWeb,
    GetVendorRegisteredCategories,
    GetAllMemberships,
    SendNotificationInAssociate,
    SendOTPCodeAssociate,
    VerifyOTPCodeAssociate,
    GetVendorProfileDetails,

    sliderdetails,
    addsliderdetails,

    ReadNotification,
    GetAllNotification,
    getEarnedPointsDashboard,

    DownlineReportOfUser,
    OverallEarnback,
    dashboard,
    ListAllVendorAdmin,
    GetAllMembershipsvendor,
    GetAllAreas,
    GetAllCategoriesForListAllVendor,
    categorylist,
    isfavourite,
    isfavouritedetails
};