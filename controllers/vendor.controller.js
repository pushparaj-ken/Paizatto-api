const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode');
var User = require('../model/user');
var Associate = require('../model/associate')
var AssociateOtp = require('../model/associateotp')
var Membership = require('../model/membership')
let moment = require('moment');
let uuid = require('uuid');
const _ = require("lodash");
const excel = require("exceljs");
var fs = require('fs');
var path = require('path');

let crypto = require('crypto');
let rand = require('csprng');
let Formatter = require('../services/formatter')
    //const { response } = require('../app');
    //Google Distance Module and API key kept here, move api key to env file
const distanceCalc = require('google-distance');
distanceCalc.apiKey = '';
var axios = require('axios');
let pinvalidatemodule = require('pincode-validator');

//Need to move these keys to env file
var algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
var key = 'password';

const userController = require('../controllers/user.controller');

var GeneralSetting = require('../model/generalsetting');
var Categories = require('../model/category');
var Packages = require('../model/package');
var Levels = require('../model/level');
var Vendors = require('../model/vendor');
var Points = require('../model/point');
var Contactus = require('../model/contactus');
var Transactions = require('../model/transaction');
var refervendormodel = require('../model/refervendor');
let MarketingMessage = require('../model/merketingmessages');
var MembershipModel = require('../model/membership')
let Faq = require('../model/faq');
let Products = require('../model/product')
let Notification = require('../model/notification')
let Area = require('../model/area')
let District = require('../model/district')

const imageUpload = require('../services/image_upload.service');
const AllConstants = require('../services/constants');
const RegisterVendor = catchAsync(async(req, res) => {
    let values = req.body;
    VendorMandatoryFieldsValidation(values).then((ValidityStatus) => {
        VendorMobileandRenterMobileValidation(values).then((ValidityStatus) => {
            VendorCheckWheatherMobileExistsAlready(values).then((ValidityStatus) => {
                VendorPasswordandConfirmPasswordValidation(values).then((ValidityStatus) => {
                    //VendorPinCodeValidation(values).then((ValidityStatus) => {
                    VendorTermsAndConditionsValidation(values).then((ValidityStatus) => {
                        GenerateUniqueUserIdForVendor().then((GeneratedUID) => {
                            GetCategoryData(values).then((CategoryData) => {
                                let membershipquery = {};
                                if (CategoryData.hasOwnProperty("Membership") && CategoryData.Membership.hasOwnProperty("id")) {
                                    membershipquery.id = CategoryData.Membership.id;
                                } else {
                                    membershipquery.id = 1;
                                }
                                GetMemberShipBasedOnId(membershipquery).then((Membership1) => {
                                    Register_Vendor(values, GeneratedUID, Membership1, CategoryData).then((Result) => {
                                        console.log("Membership1", Membership1)
                                        res.json(Result);
                                    }).catch(err => res.json(err));
                                }).catch(err => res.json(err));
                            }).catch(err => res.json(err));
                        }).catch(err => res.json(err));
                    }).catch(err => res.json(err));
                    //}).catch(err => res.json(err));  
                }).catch(err => res.json(err));
            }).catch(err => res.json(err));
        }).catch(err => res.json(err));
    }).catch(err => res.json(err));
});

const GetCategoryData = (values) => {
    console.log("Values   ---", values);
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                if (values.hasOwnProperty("Category") && values.Category.length > 0 && values.Category[0].hasOwnProperty("id")) {
                    let categoryid = values.Category[0].id;
                    Categories.findOne({ "id": categoryid }, { '_id': 0 }).lean().exec().then((Result) => {
                        if (Result) {
                            resolve(Result)
                        } else {
                            reject({
                                code: 201,
                                success: false,
                                status: "Level 1 Membership Not Found",
                                timestamp: new Date()
                            });
                        }

                    }).catch(err => {
                        console.log(err)
                        res.json(err)
                    });
                } else {
                    reject({
                        code: 201,
                        success: false,
                        status: "Invalid Category Passed.",
                        timestamp: new Date()
                    })
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
        })
    });
}

const GetMemberShipBasedOnId = (values) => {
    console.log("Values   ---", values);
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                // console.log(MembershipModel)
                MembershipModel.findOne(values).lean().exec().then((Result) => {
                    if (Result) {
                        resolve(Result)
                    } else {
                        reject({
                            code: 201,
                            success: false,
                            status: "Level 1 Membership Not Found",
                            timestamp: new Date()
                        });
                    }

                }).catch(err => {
                    console.log(err)
                    reject(err)
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
const LoginVendor = catchAsync(async(req, res) => {
    let values = req.body;
    try {
        let UserData = await CheckWheatherVendorExists(values);
        let Result = await ValidateVendorPasswordForLogin(values, UserData);
        if (values.hasOwnProperty("fcmToken") && Result && Result.success == true) {
            let query = {
                username: Result.Data.username
            }
            let changes = {
                $set: {
                    fcmToken: values.fcmToken
                }
            }
            let UpdateFCMToken = await Vendors.updateOne(query, changes).lean().exec();
        }
        res.send(Result);
    } catch (e) {
        res.send(e)
    }

    // if(UserData && UserData != null && UserData != undefined){
    //     let Result = await ValidateVendorPasswordForLogin(values, UserData);
    //     if(values.hasOwnProperty("fcmToken") && Result && Result.success == true){
    //         let query = {
    //             username:Result.Data.username
    //         }
    //         let changes = {
    //             $set: {
    //                 fcmToken:values.fcmToken
    //             }
    //         }
    //         let UpdateFCMToken = await Vendors.updateOne(query, changes).lean().exec();
    //     }
    //     res.send(Result);
    // }else{
    //     res.send({
    //         success: false,
    //         code: 201,
    //         Status: "Phone Number or Username Doesn't Exist.",
    //         timestamp: new Date()
    //     });  
    // }
});

const ForgotPasswordVendor = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("phoneNumber") && values.phoneNumber != '' && values.phoneNumber != null && values.phoneNumber != undefined) {
        let UserData = await CheckWheatherVendorExists(values);
        if (UserData.hasOwnProperty("Password")) {
            var decipher = crypto.createDecipher(algorithm, key);
            UserData.Password = decipher.update(UserData.Password, 'hex', 'utf8') + decipher.final('utf8');
            console.log(UserData.Password);
        }


        let templateid = AllConstants.SMSTemplateIds.VendorForgotPassword;
        let senderid = AllConstants.SenderId.VendorForgotPassword;
        let content = AllConstants.SMSContent.VendorForgotPassword;
        content = content.replace("{#var#}", UserData.Password)
        let number = values.phoneNumber;
        let message = "";
        SendSMSInVendor(templateid, senderid, content, number, message).then((response) => {
            //response.description = "Your password has been sent to the registered mobile number";
            res.send({
                code: 200,
                success: true,
                status: "Password sent to registered mobile number.",
                timestamp: new Date()
            })
        }).catch((err) => {
            console.error('Message sending Error');
            console.error(err);
            res.send({
                code: 201,
                success: false,
                status: "Message sending error",
                timestamp: new Date()
            });
        })

        // let apiurl = process.env.SMSAPI_URL;
        // let apikey = process.env.SMS_API_KEY;
        // let templateid = AllConstants.SMSTemplateIds.VendorForgotPassword;
        // let senderid = AllConstants.SenderId.VendorForgotPassword;
        // let content = AllConstants.SMSContent.Forgot1Password;
        // let number = values.phoneNumber;
        // let message = UserData.Password;
        // //https://sms.textspeed.in/vb/apikey.php?apikey=KVJDmTqcjcY69RYN&senderid=AKODDS&templateid=1207161537569677394&number=+917989367371&message=Get
        // let sendSMSurl = apiurl + apikey + '&senderid=' + senderid + '&templateid=' + templateid + '&number=' + number + '&message=' + content  + message;
        // console.log(sendSMSurl);
        // var config = {
        //     method: 'get',
        //     url: '',
        //     headers: { }
        // };
        // config.url = sendSMSurl;

        // axios(config).then(function (response) {
        //     //if(res.code == "011"){
        //         response.data.description = "Your password has been sent to the registered mobile number";
        //         res.send(response.data);
        //     // }else{
        //     //     res.send({
        //     //         "status": "Fail",
        //     //         "code": "201",
        //     //         "description": "Password sending failed",
        //     //         "data": {}
        //     //     })
        //     // }
        // }).catch(function (error) {
        //     res.send(error);
        // });
    } else {
        let response = {};
        response.success = false;
        response.code = 201;
        response.Status = "Phone Number Required.";
        res.send(response);
    }
});


const UpdateVendorPassword = catchAsync(async(req, res) => {
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
            CheckWheatherVendorExists(values).then((UserData) => {
                ValidateAndUpdateVendorPassword(values, UserData).then((Result) => {
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
//UpdateVendorProfile
//CheckWheatherVendorExists

const UpdateVendorProfile = catchAsync(async(req, res) => {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        var decodedHeader = jwt_decode(bearerToken);
        if (decodedHeader.username != null && decodedHeader.username != '' && decodedHeader.username != undefined && decodedHeader.username.length > 9) {
            let username = decodedHeader.username;
            let values = req.body;
            values.username = username;
            if (values.hasOwnProperty("Address")) {
                values.isLocation = true;
            }

            console.log("Values at area--->", values);
            let UserData = await CheckWheatherVendorExists(values);
            if (values.hasOwnProperty("phoneNumber")) {
                delete values.phoneNumber
            }
            if (values.hasOwnProperty("username")) {
                delete values.username
            }
            if (values.hasOwnProperty("Bank") && values.Bank.ifsccode != '' && values.Bank.ifsccode != null && values.Bank.ifsccode != undefined) {
                let BankDetails = await ValidateIFSCCodeVendor(values.Bank);
                values.Bank.bankname = BankDetails.BANK;
                values.Bank.branchname = BankDetails.BRANCH;
            }
            let UserPreviousProducts = [];
            let UserPreviousProductIds = [];
            if (UserData && UserData.hasOwnProperty("Product")) {
                UserPreviousProducts = UserData.Product;
                if (UserPreviousProducts.length > 0) {
                    for (each in UserPreviousProducts) {
                        UserPreviousProductIds.push(UserPreviousProducts[each].id);
                    }

                }
            }
            if (values.hasOwnProperty("Product")) {
                let AllNewProducts = values.Product;
                if (AllNewProducts.length > 0) {
                    for (each in AllNewProducts) {
                        if (AllNewProducts[each].hasOwnProperty("id")) {
                            if (UserPreviousProductIds.indexOf(AllNewProducts[each].id) > -1) {
                                AllNewProducts.splice(each);
                            } else {
                                let GetProduct = await Products.findOne({
                                    "id": AllNewProducts[each].id
                                }).lean().exec();
                                AllNewProducts[each] = GetProduct;
                            }
                        } else {
                            if (AllNewProducts[each].hasOwnProperty("name")) {
                                let PreviousProducts = await Products.findOne().sort('-id').lean().exec();
                                let id = 1;
                                if (PreviousProducts && PreviousProducts.hasOwnProperty('id')) {
                                    id = PreviousProducts.id + 1;
                                } else {
                                    id = id;
                                }
                                AllNewProducts[each].id = id;
                                AllNewProducts[each].createdBy = UserData.username;
                                let AddNewProduct = await AddProductInVendor(AllNewProducts[each]);
                                console.log(AddNewProduct);
                                AllNewProducts[each] = AddNewProduct;
                            } else {
                                AllNewProducts.splice(each);
                            }
                        }
                    }
                }
                values.Product = UserPreviousProducts.concat(AllNewProducts);
            }
            console.log("end values----", values)
            let Result = await UpdateVendorPersonalDetails(values, username, UserData);
            console.log("Update Vendor Personal Details", Result)
            res.send(Result);
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

const AddProductInVendor = async(values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                if (values.name != '' && values.name != null && values.name != undefined) {
                    let Data = {
                        id: values.id,
                        name: values.name,
                        status: 1,
                        createdBy: values.createdBy,
                        createdAt: new Date()
                    }
                    Products(Data).save().then((Result) => {
                        resolve(Result)
                    }).catch((err) => {
                        console.error('Database Error');
                        console.error(err);
                        reject({
                            code: 201,
                            success: false,
                            message: "DATABASE_ERROR.",
                            timestamp: new Date()
                        });
                    });
                } else {
                    reject({
                        code: 201,
                        success: false,
                        message: "DATABASE_ERROR.",
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

let ifsc = require('ifsc');
const ValidateIFSCCodeVendor = (values) => {
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
    //UpdateVendorKYC
const UpdateVendorKYC = catchAsync(async(req, res) => {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        var decodedHeader = jwt_decode(bearerToken);
        if (decodedHeader.username != null && decodedHeader.username != '' && decodedHeader.username != undefined && decodedHeader.username.length > 9) {
            let username = decodedHeader.username;
            let values = {};
            values.username = username;
            let files = req.files;
            let UserData = await CheckWheatherVendorExists(values);
            let panPath = "";
            let kycPATH = "";
            let gstPATH = "";
            if (files.pan) {
                const { buffer, originalname } = files.pan[0];
                let pan = await imageUpload.upload(buffer, originalname);
                panPath = pan.Location;
            } else {
                panPath = UserData.panPath;
            }

            if (files.kyc) {
                const { buffer, originalname } = files.kyc[0];
                let kyc = await imageUpload.upload(buffer, originalname);
                kycPATH = kyc.Location;
            } else {
                kycPATH = UserData.kycPATH;
            }

            if (files.gst) {
                const { buffer, originalname } = files.gst[0];
                let gst = await imageUpload.upload(buffer, originalname);
                console.log("GST PATH ---->", gst.Location);
                gstPATH = gst.Location;
            } else {
                gstPATH = UserData.gstPATH
            }

            let query = {
                username: UserData.username
            }
            let Data = {};
            if (req.body.panNo) {
                Data.panNo = req.body.panNo.toUpperCase();
            }
            if (req.body.gstNo) {
                Data.gstNo = req.body.gstNo.toUpperCase();
            }
            Data.panPath = panPath;
            Data.kycPATH = kycPATH;
            Data.gstPATH = gstPATH;
            Data.isKYC = true;
            let changes = {
                $set: Data
            }
            Vendors.updateOne(query, changes).lean().exec().then((UpdateStatus) => {
                console.log(UpdateStatus);
                res.json({
                    code: 200,
                    success: true,
                    message: "KYC and PAN Update Success.",
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
//UpdateShopDetails
const UpdateShopDetails = catchAsync(async(req, res) => {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        var decodedHeader = jwt_decode(bearerToken);
        if (decodedHeader.username != null && decodedHeader.username != '' && decodedHeader.username != undefined && decodedHeader.username.length > 9) {
            let username = decodedHeader.username;
            let values = {};
            values.username = username;
            let files = req.files;
            let UserData = await CheckWheatherVendorExists(values);
            let ShopImages = [];
            let offerImages = [];
            let ShopImagesNew = [];
            let featuredImage = "";
            //console.log(req.body.Address)

            if (UserData.hasOwnProperty("shopImages") && UserData.shopImages.length > 0) {
                ShopImages = UserData.shopImages
            }
            console.log("ShopImages", ShopImages)
            if (req.body.deleteshopImages) {
                ShopImages = ShopImages.filter(function(el) {
                    return req.body.deleteshopImages.indexOf(el) < 0;
                });
            }
            console.log("After dleter", ShopImages)

            if (files.shop) {
                ShopImagesNew = await UploadMultipleFilesToS3(files.shop);
            }
            ShopImages = ShopImages.concat(ShopImagesNew)
                // else{
                //     if(req.body.ShopImages){
                //         ShopImages = req.body.ShopImages;
                //     }else{
                //         ShopImages = UserData.shopImages;
                //     }
                // }



            if (UserData.hasOwnProperty("offerImages")) {
                offerImages = offerImages.concat(UserData.offerImages)
            }
            if (req.body.offerImages) {
                offerImages = offerImages.filter(function(el) {
                    return req.body.offerImages.indexOf(el) < 0;
                });
            }
            if (files.offers) {
                let newofferImages = await UploadMultipleFilesToS3(files.offers);
                offerImages = offerImages.concat(newofferImages)
            }

            if (files.featuredImage) {
                const { buffer, originalname } = files.featuredImage[0];
                let some = await imageUpload.upload(buffer, originalname);
                featuredImage = some.Location;
            } else {
                if (req.body.featuredImage) {
                    featuredImage = req.body.featuredImage;
                } else {
                    featuredImage = UserData.featuredImage;
                }

            }
            let query = {
                    username: UserData.username
                }
                //         console.log(Object.hasOwnProperty.bind(req.body)('Address'));
                //         console.log(Object.hasOwnProperty.bind(req.body)('Address.geometry'));
                //         console.log(Object.hasOwnProperty.bind(req.body)('Address.geometry.coordinate1'));
                //    console.log(req.body["Address.geometry.coordinate1"])

            let Data = req.body;
            if (Object.hasOwnProperty.bind(req.body)('Address.geometry.coordinate1') && Object.hasOwnProperty.bind(req.body)('Address.geometry.coordinate2')) {
                console.log(req.body["Address.geometry.coordinate1"])
                console.log(req.body["Address.geometry.coordinate2"])
                Data["Address.geometry.coordinates"] = [req.body["Address.geometry.coordinate1"], req.body["Address.geometry.coordinate2"]]
            }
            //console.log(Data)
            Data.featuredImage = featuredImage;
            Data.shopImages = ShopImages;
            Data.offerImages = offerImages;
            // if(Object.hasOwnProperty.bind(req.body)('area.id') && Object.hasOwnProperty.bind(req.body)('area.name')){
            //     console.log("req body----->",req.body)
            //     let getAreaDetails = await Area.findOne({'name':req.body['area.name']}).lean().exec();
            //     if(getAreaDetails){
            //         Data["area.id"] = getAreaDetails.id;
            //     }
            // }
            // console.log(Data);
            // for(each in req.body){
            //     Data.each = req.body.each
            // }
            // if(req.body.shopName){
            //     Data.shopName = req.body.shopName;
            // }
            // if(req.body.Address){
            //     Data.Address = JSON.parse(req.body.Address);
            // }
            // if(req.body.delivery){
            //     Data.delivery = req.body.delivery;
            // }
            // if(req.body.Distance){
            //     Data.Distance = req.body.Distance;
            // }
            //console.log("Data---",Data);
            // res.send(Data)
            let changes = {
                $set: Data
            }
            console.log("changes ---", changes)
            Vendors.updateOne(query, changes).lean().exec().then((UpdateStatus) => {
                res.json({
                    code: 200,
                    success: true,
                    message: "Vendor Images Update Success.",
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

// async function UploadMultipleFilesToS3New(files){
//     return new Promise((resolve, reject) => {
//         let filesCount = files.length;
//         let count = 0;
//         if (filesCount > 0) {
//             if (filesCount == 1) {
//                 let FilesPathJSON = [];
//                 const { buffer, originalname } = files[0];
//                 await imageUpload.upload(buffer, originalname).then((filePATH) => {
//                     FilesPathJSON.push(filePATH.Location);
//                     resolve(FilesPathJSON);
//                 }).catch(err => {
//                     reject(err)
//                 });
//             } else {
//                 let FilesPathJSON = [];
//                 for (each in files) {
//                     var { buffer, originalname } = files[each];
//                     await imageUpload.upload(buffer, originalname).then((filePATH) => {
//                         FilesPathJSON.push(filePATH.Location);
//                         count = count + 1;
//                         if (count == filesCount) {
//                             resolve(FilesPathJSON);
//                         }
//                     }).catch(err => {
//                         reject(err)
//                     });
//                 }
//             }
//         } else {
//             reject({
//                 success: false,
//                 code: 201,
//                 Status: "No Files To Upload",
//                 "timestamp": new Date()
//             });
//         }
//     });
// }

const UploadMultipleFilesToS3 = (files) => {
        return new Promise((resolve, reject) => {
            setImmediate(() => {
                try {
                    console.log("Fileesss---->", files);
                    let filesCount = files.length;
                    let count = 0;
                    if (filesCount > 0) {
                        if (filesCount == 1) {
                            let FilesPathJSON = [];
                            const { buffer, originalname } = files[0];
                            imageUpload.upload(buffer, originalname).then((filePATH) => {
                                FilesPathJSON.push(filePATH.Location);
                                resolve(FilesPathJSON);
                            }).catch(err => reject(err));
                        } else {
                            let FilesPathJSON = [];
                            for (each in files) {
                                var { buffer, originalname } = files[each];
                                imageUpload.upload(buffer, originalname).then((filePATH) => {
                                    FilesPathJSON.push(filePATH.Location);
                                    count = count + 1;
                                    if (count == filesCount) {
                                        resolve(FilesPathJSON);
                                    }
                                }).catch(err => reject(err));
                            }
                        }
                    } else {
                        reject({
                            success: false,
                            code: 201,
                            Status: "No Files To Upload",
                            "timestamp": new Date()
                        });
                    }
                } catch (error) {
                    console.error('Something Error');
                    console.error(error);
                    reject({
                        success: false,
                        code: 201,
                        Status: "Error Uploading Files.",
                        "timestamp": new Date()
                    });
                }
            });
        });
    }
    //GetVendorDetails
const GetVendorDetails = catchAsync(async(req, res) => {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        var decodedHeader = jwt_decode(bearerToken);
        console.log(decodedHeader);
        if (decodedHeader.username != null && decodedHeader.username != '' && decodedHeader.username != undefined && decodedHeader.username.length > 9) {
            let username = decodedHeader.username;
            let Result = await GetVendorDetailsWithUserName(username);
            //GetVendorDetailsWithUserName(username).then((Result) => {
            res.send(Result);
            //}).catch(err => res.json(err)); 
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


const VerifyPhoneNumberExistsAlready = catchAsync(async(req, res) => {
    let values = req.body;
    CheckPhoneNumberExistsAlreadyVendor(values).then((Result) => {
        res.send(Result);
    }).catch(err => res.json(err));
});

const CheckPhoneNumberExistsAlreadyVendor = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                let query = {
                    phoneNumber: values.phoneNumber
                };
                Vendors.findOne(query).lean().exec().then((Result) => {
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

//////////////////////////////////////////////////////////////////////

const GetVendorDetailsWithUserName = (username) => {
    return new Promise(async(resolve, reject) => {
        //setImmediate(() => {
        try {
            var query = {
                username: username
            }
            let Result = await Vendors.findOne(query).lean().exec();
            if (Result != null && Result != '' && Result != undefined) {
                if (Result.hasOwnProperty("Bank")) {
                    for (each in Result["Bank"]) {
                        if (Result["Bank"][each] != "") {
                            var decipher = crypto.createDecipher(algorithm, key);
                            Result["Bank"][each] = decipher.update(Result["Bank"][each], 'hex', 'utf8') + decipher.final('utf8');
                        }
                    }
                }
                if (Result.hasOwnProperty("Category")) {
                    for (each in Result["Category"]) {
                        Result["Category"][each] = await Categories.findOne({ "id": Result["Category"][each].id }).lean().exec();
                    }
                }
                if (Result.hasOwnProperty("area") && Result.area.hasOwnProperty("id") && Result.area.id != null) {
                    var area = await Area.findOne({ "id": Result.area.id }).lean().exec();
                    var district = await District.findOne({ "id":area.districtid }).lean().exec();
                    Result.area =
                    {
                        "id":area.id,
                        "name":area.name,
                        "districtid": district.id,
                        "districtname":district.name
                    }
                    Result.districtid = district.id,
                    Result.districtname = district.name
                }
                if (Result.hasOwnProperty("Membership") && Result.Membership.hasOwnProperty("id") && Result.Membership.id != null) {
                    Result.Membership = await MembershipModel.findOne({ "id": Result.Membership.id }).lean().exec();
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
                    if (Result.status === 0) {
                        Result.StatusNamw = "Approved";
                    } else if (Result.status === 1) {
                        Result.StatusNamw = "Pending";
                    } else if (Result.status === 2) {
                        Result.StatusNamw = "New User";
                    } else if (Result.status === 3) {
                        Result.StatusNamw = "Rejected";
                    } else if (Result.status === 4) {
                        Result.StatusNamw = "Blocked";
                    }
                }
                if (Result.hasOwnProperty("kycStatus")) {
                    if (Result.kycStatus == 0) {
                        Result.kycStatusName = "Approved";
                    }
                    if (Result.kycStatus == 1) {
                        Result.kycStatusName = "Pending";
                    }
                    if (Result.kycStatus == 2) {
                        Result.kycStatusName = "Rejected";
                    }
                    if (Result.kycStatus == 3) {
                        Result.kycStatusName = "Re-work";
                    }
                }
                // if(Result.hasOwnProperty("isBank")){
                //     if(Result.isBank == 0){
                //         Result.isBankStatus = "Pending";
                //     }
                //     if(Result.isBank == 1){
                //         Result.isBankStatus = "Approved";
                //     }
                // }
                // if(Result.hasOwnProperty("isLocation")){
                //     if(Result.isLocation == 0){
                //         Result.isLocationStatus = "Pending";
                //     }
                //     if(Result.isLocation == 1){
                //         Result.isLocationStatus = "Approved";
                //     }
                // }
                let response = {};
                response.code = 200;
                response.success = true;
                response.message = "Vendor Data Retrieved.";
                response.Data = Result,
                    response.timestamp = new Date();
                resolve(response)
            } else {
                reject({
                    success: false,
                    code: 201,
                    Status: "Username Doesn't Exist.",
                    "timestamp": new Date()
                });
            }
        } catch (error) {
            console.error('Something Error');
            console.error(error);
            reject({
                success: false,
                code: 201,
                Status: "Username Doesn't Exist.",
                "timestamp": new Date()
            });
        }
        //});
    });
}

//////////////////////////////////////////////////////////////////////
const VendorMandatoryFieldsValidation = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                if (
                    values.shopName != '' && values.shopName != undefined && values.shopName != null &&
                    values.contactpersonName != '' && values.contactpersonName != undefined && values.contactpersonName != null &&
                    values.phoneNumber != '' && values.phoneNumber != undefined && values.phoneNumber != null  &&
                    values.Password != '' && values.Password != undefined && values.Password != null 
                    // && values.pincode != '' && values.pincode != undefined && values.pincode != null  
                ) {
                    console.log(values);
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


const VendorMobileandRenterMobileValidation = (values) => {
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


const VendorCheckWheatherMobileExistsAlready = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                let query = {
                    phoneNumber: values.phoneNumber
                };
                Vendors.findOne(query).lean().exec().then((Result) => {
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

const VendorPasswordandConfirmPasswordValidation = (values) => {
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

const VendorPinCodeValidation = (values) => {
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
                    message: "Database Error.",
                    timestamp: new Date()
                })
            }
        });
    });
}


const VendorTermsAndConditionsValidation = (values) => {
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


const GenerateUniqueUserIdForVendor = () => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                let mysort = { _id: -1 }
                Vendors.find().sort(mysort).limit(1).then((Result) => {
                    console.log(Result, "111");
                    if (Result.length > 0) {
                        let LastUID = Result[0].username;
                        let idchars = parseInt(LastUID.slice(2, 10)) + 1;
                        console.log("idchars---------->", idchars);
                        let lengthofdigits = idchars.toString().length;
                        let generatedUIDString = LastUID.slice(-10, 10 - lengthofdigits);
                        let finalStringGenerated = generatedUIDString + idchars;
                        console.log("finalStringGenerated", finalStringGenerated)
                        resolve(finalStringGenerated)
                    } else {
                        resolve("V000000001");
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

const Register_Vendor = async(values, GeneratedUID, Membership1, CategoryData) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                let salt = rand(80, 24);
                let pass = values.Password + salt;
                var cipher = crypto.createCipher(algorithm, key);
                let QRcode = "upi://pay?pa=PAIZATTO" + values.phoneNumber + ".08@cmsidfc&pn=" + values.shopName + "&tr=" + values.phoneNumber + "&am=&cu=INR&mc=5411";

                let Data = {
                    uid: uuid.v4(),
                    username: GeneratedUID,
                    phoneNumber: values.phoneNumber,
                    firstName: values.shopName,
                    lastName: values.contactpersonName,
                    Password: cipher.update(values.Password, 'utf8', 'hex') + cipher.final('hex'),
                    PasswordSalt: salt,
                    createdAt: new Date(),
                    //lastModifiedAt: new Date(),
                    createdBy: "Node API Hardcoded",
                    QRCode: QRcode,
                    employeeMobile: values.employeeMobile,
                    Category: CategoryData,
                    Membership: Membership1,
                    fcmToken: values.fcmToken,
                    //deeplink:"https://en-rich.herokuapp.com/?"+"referralid="+GeneratedUID,
                    updated_time: new Date()
                };
                if (CategoryData) {
                    Data.fee = CategoryData.fee;
                    Data.gst = CategoryData.gst;
                    //Data.Category = CategoryData
                }
                if (values.pincode) {
                    if (values.Address) {
                        Data.Address = values.Address;
                    } else {
                        Data.Address = {}
                    }
                    Data.Address.pincode = values.pincode
                }
                // Data.Address = values.Address
                //resolve(Data);
                let accessToken = jwt.sign({ username: GeneratedUID }, process.env.TOKEN_SECRET, { expiresIn: "120s" });
                let refreshToken = jwt.sign({ username: GeneratedUID }, process.env.TOKEN_SECRET, { expiresIn: "1d" });
                Vendors(Data).save().then((Result) => {
                    let templateid = AllConstants.SMSTemplateIds.VendorSignupSMS;
                    let senderid = AllConstants.SenderId.VendorSignupSMS;
                    let content = AllConstants.SMSContent.VendorSignupSMS;
                    content = content.replace("{#var#}", Result.username)
                    let number = values.phoneNumber;
                    let message = "";
                    SendSMSInVendor(templateid, senderid, content, number, message).then(() => {
                        let templateid1 = AllConstants.SMSTemplateIds.VendorAppLink;
                        let senderid1 = AllConstants.SenderId.VendorAppLink;
                        let content1 = AllConstants.SMSContent.VendorAppLink;
                        content1 = content1.replace("{#var#}", AllConstants.Links.vendorapplink)
                        let number = values.phoneNumber;
                        let message = "";
                        SendSMSInVendor(templateid1, senderid1, content1, number, message).then(() => {
                            SendNotificationInVendor({ username: Result.username, notificationbody: "Your vendor registration is completed.", notificationtitle: "Your Vendor Registration is completed. Your Paizatto ID : " + Result.username }).then((NotificationResult) => {
                                console.log("NotificationResult--------------->", NotificationResult)
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
                                    },
                                    timestamp: new Date()
                                });
                            }).catch((err) => {
                                console.error('Notification sending Error');
                                console.error(err);
                                reject({
                                    code: 201,
                                    success: false,
                                    status: "Notification sending error",
                                    timestamp: new Date()
                                });
                            })
                        }).catch((err) => {
                            console.error('Notification sending Error');
                            console.error(err);
                            reject({
                                code: 201,
                                success: false,
                                status: "Notification sending error",
                                timestamp: new Date()
                            });
                        })
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

const SendSMSInVendor = async(templateid, senderid, content, number, message) => {
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

const CheckWheatherVendorExists = (values) => {
    return new Promise(async(resolve, reject) => {
        //setImmediate(() => {
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
            //Vendors.findOne(query).lean().exec().then((Result) => {
            let Result = await Vendors.findOne(query).lean().exec();
            if (Result) {
                if (Result.hasOwnProperty("Category")) {
                    for (each in Result["Category"]) {
                        Result["Category"][each] = await Categories.findOne({ "id": Result["Category"][each].id }).lean().exec();
                    }
                }
                if (Result.hasOwnProperty("area") && Result.area.hasOwnProperty("id") && Result.area.id != null) {
                    Result.area = await Area.findOne({ "id": Result.area.id }).lean().exec();
                }
                if (Result.hasOwnProperty("Membership") && Result.Membership.hasOwnProperty("id") && Result.Membership.id != null) {
                    Result.Membership = await MembershipModel.findOne({ "id": Result.Membership.id }).lean().exec();
                }
                if (Result.hasOwnProperty("status")) {
                    if (Result.status === 0) {
                        Result.status = "Approved";
                    } else if (Result.status === 1) {
                        Result.status = "Pending";
                    } else if (Result.status === 2) {
                        Result.status = "New user";
                    } else if (Result.status === 3) {
                        Result.status = "Rejected";
                    } else if (Result.status === 4) {
                        Result.status = "Blocked";
                    }
                }

                if (Result.hasOwnProperty("kycStatus")) {
                    if (Result.kycStatus === 0) {
                        Result.kycStatus = "Approved";
                    } else if (Result.kycStatus === 1) {
                        Result.kycStatus = "Pending";
                    } else if (Result.kycStatus === 2) {
                        Result.kycStatus = "Rejected";
                    } else if (Result.kycStatus === 3) {
                        Result.kycStatus = "Re-work";
                    }
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
            // }).catch((err) => {
            //     reject({
            //         success: false,
            //         code:201,
            //         Status: "Phone Number or Username Doesn't Exist.",
            //         "timestamp":new Date()    
            //     });
            // })
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
        //});
    });
}

const ValidateVendorPasswordForLogin = (values, UserData) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                if (values.Password != '' && values.Password != null && values.Password != undefined) {
                    let Givenpassword = values.Password;
                    let DBPassword = UserData.Password;
                    var decipher = crypto.createDecipher(algorithm, key);
                    console.log(DBPassword);
                    let decryptedPassword = decipher.update(DBPassword, 'hex', 'utf8') + decipher.final('utf8');
                    console.log(Givenpassword, decryptedPassword, AllConstants.Universals.VendorUniversalPassword);
                    if (Givenpassword == decryptedPassword || Givenpassword == AllConstants.Universals.VendorUniversalPassword) {
                        let accessToken = jwt.sign({ username: UserData.username }, process.env.TOKEN_SECRET, { expiresIn: "120s" });
                        let refreshToken = jwt.sign({ username: UserData.username }, process.env.TOKEN_SECRET, { expiresIn: "1d" });
                        resolve({
                            success: true,
                            code: 200,
                            accessToken: accessToken,
                            refreshToken: refreshToken,
                            Data: {
                                username: UserData.username
                            }
                        })
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


const ValidateAndUpdateVendorPassword = (values, UserData) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                let CurrentPassword = values.CurrentPassword;
                let NewPasword = values.NewPasword;
                let SavedPassword = UserData.Password;
                var decipher = crypto.createDecipher(algorithm, key);
                let decryptedPassword = decipher.update(SavedPassword, 'hex', 'utf8') + decipher.final('utf8');
                //let PasswordSalt = UserData.PasswordSalt;
                var previouspasswords = UserData.LastPassword;
                var cipher = crypto.createCipher(algorithm, key);
                let NewPasswordHash = cipher.update(values.NewPasword, 'utf8', 'hex') + cipher.final('hex');
                previouspasswords.push(NewPasword);
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
                        if (CurrentPassword == decryptedPassword) {
                            let query = {
                                username: UserData.username
                            }
                            let changes = {
                                $set: {
                                    Password: NewPasswordHash,
                                    LastPassword: previouspasswords
                                }
                            }
                            console.log("Updated");
                            Vendors.updateOne(query, changes).lean().exec().then((UpdateStatus) => {
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


const UpdateVendorPersonalDetails = (values, username, UserData) => {
    console.log("vvv", values);
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                let query = {
                    username: username
                };
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
                // if(values.hasOwnProperty("DOB")){console.log(typeof(values.DOB));
                //     values.DOB = my_date(values.DOB);
                // }
                Vendors.updateOne(query, values).lean().exec().then((UpdateStatus) => {
                    console.log("Update status", UpdateStatus)
                    resolve({
                        code: 200,
                        success: true,
                        message: "Vendor Personal Details Updated Success.",
                        timestamp: new Date()
                    })
                }).catch((err) => {
                    console.log("Update error", err)
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

// const FAQVendor = catchAsync(async(req, res) => {
//     let values = req.body;
//     res.send({
//         code:200,
//         success:true,
//         message:'FAQ Data Retrieved Success',
//         data:[
//             {
//                 "category":"General",
//                 "qa":[
//                     {
//                         "question":"What do you mean by DRM? ",
//                         "answer":"Digital Referral Marketplace.",
//                     },
//                     {
//                         "question":"What is the role of Paizatto in the market place? ",
//                         "answer":"Paizatto is creating a market place where it enables a connect between Buyers and Sellers who are having physical stores. It will help them to increase footfalls to their outlets/stores.",
//                     },
//                     {
//                         "question":"Why does Paizatto collects Platform fee from the vendor? ",
//                         "answer":"Platform fees are in turn given back to buyers to ensure they are with us and buy from us only.",
//                     },
//                     {
//                         "question":"What methods does Paizatto use to hold the customer in the shop? ",
//                         "answer":"Earnbacks, Promotions & Offers given by the vendors are used to ensure Customers don't go out of this platform.",
//                     },
//                     {
//                         "question":"What is the basic requirement for the vendor to join Paizatto platform? ",
//                         "answer":"Vendor must have a physical store, PAN Card or GST and Mobile number.",
//                     },
//                     {
//                         "question":"Does Paizatto offer a specific UPI Ids to their customer or vendor to get transaction? ",
//                         "answer":"Paizatto has partnered with Leading banks to offer them Payment options in UPI form.",
//                     },
//                     {
//                         "question":"When does the platform fee collected from the vendor? ",
//                         "answer":"After every transaction, platform fee is deducted and balance is settled to vendor's bank account directly.",
//                     },
//                     {
//                         "question":"What to do if the location is not shown in the map? ",
//                         "answer":"Call up Customer care 9007 9007 80 to check the issue.",
//                     },
//                     {
//                         "question":"Whether Paizatto offers home to home delivery for the order from the customer? ",
//                         "answer":"Currently NO, we will partner with delivery apps to enable this service. Charges will be borne by the customers.",
//                     },
//                     {
//                         "question":"What kind of Shops are not eligible to register in Paizatto? ",
//                         "answer":"Non-Veg & Mix of Non-Veg Hotels, Meat shops, Liquor, Drugs & Tobacco, anything that is banned by Government of India.",
//                     },
//                     {
//                         "question":"Why should we use Paizatto, Can you say a Positive Review? ",
//                         "answer":"As a vendor, everybody is looking for additional sales, new customers, loyal customers etc but they are not willing to spend extra on Marketing, Digital Marketing, Branding etc. On times, few vendors spend money without able to measure the ROI of the investment they made for branding, marketing. <br>In Paizatto, we offer all these for free of cost, only time we charge is a small % on the total sales if a customer comes via Paizatto. ",
//                     },
//                     {
//                         "question":"If we are paying platform fee, then what is the gain for us?",
//                         "answer":"The customer is coming to that store only cos of Paizatto, it means additional sales, revenue etc for the vendor. This platform fee is again divided within the community to build a strong Market Place. When new customer comes in, the purchasing power of the vendor increases and his margins also increases cos of additional sales that Paizatto will bring in.",
//                     },
//                     {
//                         "question":"Is Giving customer base is a Guaranteed? ",
//                         "answer":"We are enabling customers to Paizatto Affiliated stores, it all depends on the customer needs.",
//                     }
//                 ]
//             }
//         ],
//         timestamp:new Date()
//     })   
// });

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



const FAQVendor = catchAsync(async(req, res) => {
    try {
        let Result = await Faq.find({ "userType": "Vendor", "status": 0 }, { "category": 1, "question": 1, "answer": 1, "_id": 0 }).lean().exec();
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

// const FAQVendor = catchAsync(async(req, res) => {
//     let values = req.body;
//     res.send({
//         code:200,
//         success:true,
//         message:'FAQ Data Retrieved Success',
//         data:[
//             {
//                 "category":"General",
//                 "qa":[
//                     {
//                         "question":"What is Paizatto?",
//                         "answer":"Paizatto is India’s first ever real earn back mobile app. It helps consumers to get real earn backs on every purchase. ",
//                     },
//                     {
//                         "question":"What is Earn Back?",
//                         "answer":"Earn back is real cash that is credited into your bank account end of every month.",
//                     },
//                     {
//                         "question":"How do you get Earn Back?",
//                         "answer":"Any purchase which is done at any Paizatto affiliated store gets earn backs by scanning and making payments only through the Paizatto QR code.\nwhich is then credited as cash directly into your account. ",
//                     },
//                     {
//                         "question":"When will I get earn backs? ",
//                         "answer":"I will get earn backs for any amount spent by me.",
//                     },
//                     {
//                         "question":"How many transactions can I make in a day through Paizatto Qr Code?",
//                         "answer":"There is no limit. "
//                     },
//                     {
//                         "question":"Is the earn back available only in Paizatto affiliated stores?",
//                         "answer":"Yes, it is!"
//                     },
//                     {
//                         "question":"How is Earn Back different from Cash Back?",
//                         "answer":"Cash back generally has to be used at the same place, same category etc. On times, it has minimum purchase value, expiry date, restricted redemption of points etc. \n\nEarn Back has no restrictions, even a small amount of INR 0.50 will also be credited directly to your bank."
//                     },
//                     {
//                         "question":"How do I maximize earn backs?",
//                         "answer":"You can refer your friends & relatives to increase your connections, every time they make a purchase, you will be eligible for same back as your connections. More the connections & purchases, more the Earn Back’s for you."
//                     },
//                     {
//                         "question":"How & when will I receive the earn backs?",
//                         "answer":"Earn Back’s will be credited directly to your UPI linked Bank account, all Earn Back’s accumulated will be credited on or before 7th of every month."
//                     },
//                     {
//                         "question":"How secure are my transactions?",
//                         "answer":"We have partnered with ICICI and IDFC Bank which is used for all these transactions using a secured network."
//                     },
//                     {
//                         "question":"What is minimum value of purchase?",
//                         "answer":"Minimum Purchase value can be INR 10/-, you must make a minimum purchase of INR 2,000 in affiliated Paizatto stores within a calendar month to receive connections Earn Back’s. Purchases can be made in any category in Paizatto affiliated stores."
//                     },
//                     {
//                         "question":"Can I transfer my earn backs to someone? ",
//                         "answer":"No it can’t be transferred. "
//                     },
//                     {
//                         "question":"What is required to register with Paizatto?",
//                         "answer":"You need aPhone number which is registered with your UPI."
//                     },
//                     {
//                         "question":"Which UPI apps can I use to make payments?",
//                         "answer":"All UPI’s can be used to make the payment, ensure same mobile number is used to received proper Earn Back’s"
//                     },
//                     {
//                         "question":"Is Paizatto a UPI or wallet?",
//                         "answer":"Neither, Paizatto is an Earn Back app which connects Buyers and Sellers to make additional Savings/ Sales"
//                     },
//                     {
//                         "question":"Will Paizatto use my data for any other purpose?",
//                         "answer":"No, your data is very secure with us. And no confidential information of yours is shared with any 3rd party. "
//                     },
//                     {
//                         "question":"Where to find Paizatto Mobile app?",
//                         "answer":"Paizatto is available in both app store (iOS) and play store (android)"
//                     },
//                     {
//                         "question":"Is the referral code mandatory?",
//                         "answer":"It’s Optional"
//                     },
//                     {
//                         "question":"Is it mandatory to refer someone?",
//                         "answer":"It’s Optional"
//                     },
//                     {
//                         "question":"How can I refer Paizatto to my friends and family?",
//                         "answer":"There is a referral link once you log into the app, which can be shared with your friends and family. Also, in the referral ID column you can input your Paizatto registered number if you don’t remember your Associate ID."
//                     },
//                     {
//                         "question":"What is connections?",
//                         "answer":"Any person you refer becomes your connection when they become active"
//                     },
//                     {
//                         "question":"How can I earn points?",
//                         "answer":"With every purchase in Paizatto affiliated store you earn a point"
//                     },
//                     {
//                         "question":"What is the value of each point?",
//                         "answer":"Value of each point is INR 0.5"
//                     },
//                     {
//                         "question":"How earn backs will be calculated?",
//                         "answer":"Earn Backs are calculated based on the store membership.\n1. Eg: A Diamond store will give you 1 Point on purchase of INR 100\n2.	Eg: A Gold store will give you 1 Point on purchase of INR 200\n3.	Eg: A Silver store will give you 1 Point on purchase of INR 300\n4.	Eg: A Bronze store will give you 1 Point on purchase of INR 400\n"
//                     },
//                     {
//                         "question":"Can I get a earn back if I refer any store for Paizatto?",
//                         "answer":"Yes, you will get Earn Back whenever the store that you referred is getting approved as per norms of the company"
//                     },
//                     {
//                         "question":"When will I be eligible for my connections earn backs?",
//                         "answer":"As soon as you complete a purchase of 10Points in a calendar month"
//                     },
//                     {
//                         "question":"Is location permission mandatory for Paizatto?",
//                         "answer":"Yes, it enables you to find the nearest store based on the location"
//                     },
//                     {
//                         "question":"What is the difference between eligible earn back and actual earn back?",
//                         "answer":"Eligible Earn Back is what you can get including your connections Points, Actual Earn Back is what you will get based on your purchases, the exact amount that will get credited to your bank."
//                     },
//                     {
//                         "question":"How do I see my number of connections?",
//                         "answer":"You can see that in Referral report. Also you can see Active & Inactive in the Earn Back tab"
//                     },
//                     {
//                         "question":"How do I refer a vendor?",
//                         "answer":"Click on the refer tab, fill the vendor details and hit the submit button"
//                     },
//                     {
//                         "question":"What if there is no store in my location?",
//                         "answer":"We are adding stores across all locations/categories. Please use refer a vendor option to recommend vendors you would like to see it."
//                     },
//                     {
//                         "question":"How do I identify my required vendor?",
//                         "answer":"Click on the category, use the filters to find the vendor of your choice"
//                     },
//                     {
//                         "question":"Any other payment modes accepted in Paizatto apart from UPI?",
//                         "answer":"No"
//                     },
//                     {
//                         "question":"Where can in see my accumulated earn backs?",
//                         "answer":"You can see that in the Earn Back tab"
//                     },
//                     {
//                         "question":"Can I get my earn back earlier? ",
//                         "answer":"No, it is auto scheduled before 7th of every month"
//                     },
//                 ]
//             }
//         ],
//         timestamp:new Date()
//     })   
// });

const ContactUsVendor = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.name != '' && values.name != null && values.name != undefined &&
        values.email != '' && values.email != null && values.email != undefined &&
        values.mobile != '' && values.mobile != null && values.mobile != undefined &&
        values.message != '' && values.message != null && values.message != undefined
    ) {
        var Previouscontactus = await Contactus.findOne().sort('-id').lean().exec();
        let id = 1;
        if (Previouscontactus && Previouscontactus.hasOwnProperty('id')) {
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
            role: "Vendor",
            createdBy: new Date()
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




const getSalesSummary = catchAsync(async(req, res) => {
    let values = req.query;
    let vendorData = await GetVendorDetailsWithUserName(values.username);
    //GetVendorDetailsWithUserName(values.username).then((vendorData) => {
    getVendorTransactions(values, vendorData.Data).then(async(vendorTransactionData) => {
        let filePath = await generateReportForSalesSummary(vendorTransactionData.Data);
        var fullPublicUrl = 'http://paizattoapi.paizatto.com/';
        vendorTransactionData.downloadurl = `${fullPublicUrl}${filePath}`
        res.send(vendorTransactionData);
    }).catch(err => res.json(err));
    //}).catch(err => res.json(err));  
});

const getVendorTransactions = (values, vendorData) => {
    return new Promise(async(resolve, reject) => {
        //setImmediate(() => {
        try {
            let query = {
                vendor: values.username
            };
            if (values.hasOwnProperty("from")) {
                let datesfrom = values.from.split('-');
                startDate = new Date(datesfrom[2], datesfrom[1] - 1, parseInt(datesfrom[0]) + 1)
            }
            if (values.hasOwnProperty("to")) {
                let datesto = values.to.split('-');
                endDate = new Date(datesto[2], datesto[1] - 1, parseInt(datesto[0]) + 1)
            }
            if (startDate != '' && endDate != '') {
                query.transactionDate = { $gte: startDate.toISOString(), $lte: endDate.toISOString() }
            }
            let fee = 0;
            let gst = 0;
            if (vendorData.hasOwnProperty("fee") && vendorData.hasOwnProperty("gst")) {
                fee = vendorData.fee;
                gst = vendorData.gst;
            } else {
                if (vendorData.Category[0]) {
                    let CategoryData = await Categories.findOne({ "id": vendorData.Category[0].id }).lean().exec()
                    fee = CategoryData.fee
                    gst = CategoryData.gst
                } else {
                    fee = 0;
                    gst = 0;
                }
            }
            Transactions.find(query).lean().exec().then((Result) => {
                if (Result && Result != []) {
                    let finalData = {};
                    let finalResult = [];
                    Result = _.map(Result, e => {
                        let transDate = moment(e.transactionDate).format('DD-MM-YYYY');
                        console.log("transDate-------------------->", transDate);
                        console.log("transDate-------------------->", gst);
                        if (finalData[transDate]) {
                            finalData[transDate].transactions = finalData[transDate].transactions + 1;
                            finalData[transDate].customers.push(e.username);
                            finalData[transDate].totalSales = finalData[transDate].totalSales + e.amount;
                            finalData[transDate].totalplatformFees = finalData[transDate].totalplatformFees + (e.amount * fee * .01);
                            finalData[transDate].GSTAmount = (finalData[transDate].totalplatformFees * gst) * .01;
                            finalData[transDate].platformfeeplusgst = finalData[transDate].totalplatformFees + finalData[transDate].GSTAmount;
                            finalData[transDate].transactionDate = finalData[transDate].transactionDate;

                        } else {
                            finalData[transDate] = {};
                            finalData[transDate].transactions = 1;
                            finalData[transDate].customers = [e.username];
                            finalData[transDate].totalSales = e.amount;
                            finalData[transDate].totalplatformFees = e.amount * fee * .01;
                            finalData[transDate].GSTAmount = finalData[transDate].totalplatformFees * gst * .01;
                            finalData[transDate].platformfeeplusgst = finalData[transDate].totalplatformFees + finalData[transDate].GSTAmount;
                            finalData[transDate].transactionDate = transDate;
                        }
                    })

                    for (each in finalData) {
                        console.log(finalData[each])
                        finalData[each].totalSales = Formatter.toINR(finalData[each].totalSales);
                        finalData[each].totalplatformFees = Formatter.toINR(finalData[each].totalplatformFees);
                        finalData[each].GSTAmount = Formatter.toINR(finalData[each].GSTAmount);
                        finalData[each].platformfeeplusgst = Formatter.toINR(finalData[each].platformfeeplusgst);
                        finalData[each].customers = _.uniq(finalData[each].customers).length;
                        finalData[each].gstReportUrl = "https://paizattoadmin.paizatto.com/Gstreport?vendor=" + values.username;
                        if (values.hasOwnProperty("from")) {
                            finalData[each].gstReportUrl = finalData[each].gstReportUrl + "&from=" + values.from;
                        }
                        if (values.hasOwnProperty("to")) {
                            finalData[each].gstReportUrl = finalData[each].gstReportUrl + "&to=" + values.to;
                        }
                        finalResult.push(finalData[each])
                    }
                    resolve({
                        success: true,
                        code: 200,
                        downloadurl: "https://enn-richh.s3.ap-south-1.amazonaws.com/file_example_XLSX_10.xlsx",
                        Data: finalResult,
                        Status: "Transactions retrieved successfully",
                        "timestamp": new Date()
                    })
                } else {
                    resolve({
                        success: false,
                        code: 201,
                        Status: "No transactions found",
                        "timestamp": new Date()
                    })
                }
            }).catch((err) => {
                console.log(err);
                reject({
                    success: false,
                    code: 201,
                    Status: "Database Error",
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
        //});
    });
}

const getVendorGst = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                let agg = [{
                    $match: {
                        username: values.username
                    }
                }]
                Vendors.aggregate(agg).exec().then((Result) => {
                    if (Result && Result != []) {
                        resolve({
                            success: true,
                            code: 200,
                            Status: "Data retrieved successfully",
                            "timestamp": new Date()
                        })
                    } else {
                        resolve({
                            success: false,
                            code: 201,
                            Status: "No vendor found",
                            "timestamp": new Date()
                        })
                    }
                }).catch((err) => {
                    console.log(err);
                    reject({
                        success: false,
                        code: 201,
                        Status: "Database Error",
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

const VendorTransactionReport = catchAsync(async(req, res) => {
    let values = req.query;
    CheckWheatherVendorExists(values).then((VendorData) => {
        let newVendorData = {};
        newVendorData.username1 = VendorData.username;
        newVendorData.shopName = VendorData.firstName;

        GetVendorTransactionData(values).then(async(VendorTransactionData) => {
            //VendorTransactionData = JSON.parse(VendorTransactionData)
            let responseData = [];
            if (VendorTransactionData.length > 0) {
                for (each in VendorTransactionData) {
                    let eachJSON = {};
                    eachJSON.payerAmount = Formatter.toINR(VendorTransactionData[each].amount);
                    eachJSON.associateRegNo = VendorTransactionData[each].username;
                    eachJSON.transactionDate = Formatter.toDate(VendorTransactionData[each].transactionDate) + " " + Formatter.toTime(VendorTransactionData[each].transactionDate);
                    if (VendorTransactionData[each].status == 1) {
                        eachJSON.transactionStatus = "Pending";
                    }
                    if (VendorTransactionData[each].status == 0) {
                        eachJSON.transactionStatus = "Success";
                    }
                    if (VendorTransactionData[each].status == 2) {
                        eachJSON.transactionStatus = "Failure";
                    }

                    let fee = 0;
                    let gst = 0;
                    if (VendorData.hasOwnProperty("fee") && VendorData.hasOwnProperty("gst")) {
                        fee = VendorData.fee;
                        gst = VendorData.gst;
                    } else {
                        if (VendorData.Category[0]) {
                            let CategoryData = await Categories.findOne({ "id": VendorData.Category[0].id }).lean().exec()
                            fee = CategoryData.fee
                            gst = CategoryData.gst
                        } else {
                            fee = 0;
                            gst = 0;
                        }
                    }


                    eachJSON.fee = VendorTransactionData[each].amount * fee * .01;
                    eachJSON.gst = eachJSON.fee * gst * .01;
                    eachJSON.totalplatformFees = Formatter.toINR(eachJSON.fee + eachJSON.gst);
                    eachJSON.payableToVendor = Formatter.toINR(VendorTransactionData[each].amount - (eachJSON.fee + eachJSON.gst));
                    eachJSON.vendorUsername = newVendorData.username1;
                    eachJSON.shopName = newVendorData.shopName;
                    eachJSON.payoutStatus = "Pending";
                    eachJSON.utrNumber = VendorTransactionData[each].utrnumber;
                    eachJSON.shopName = newVendorData.shopName;
                    console.log(VendorTransactionData[each].utrnumber);

                    eachJSON.fee = Formatter.toINR(eachJSON.fee);
                    eachJSON.gst = Formatter.toINR(eachJSON.gst);
                    responseData.push(eachJSON);
                }
            }
            let filePath = await generateReportForTransactionSummary(responseData);
            var fullPublicUrl = 'http://paizattoapi.paizatto.com/';
            res.send({
                success: false,
                code: 200,
                Status: "Transaction Reports Retrieved Success.",
                downloadurl: `${fullPublicUrl}${filePath}`,
                //downloadurl:"https://enn-richh.s3.ap-south-1.amazonaws.com/file_example_XLSX_10.xlsx",
                Data: responseData,
                "timestamp": new Date(),
            });
        }).catch(err => res.json(err));
    }).catch(err => res.json(err));
});

const GetVendorTransactionData = (values) => {
    let query = values;
    let newquery = {};
    let startDate = '';
    let endDate = '';
    if (query.hasOwnProperty("username")) {
        newquery.vendor = query.username;
    }
    if (query.hasOwnProperty("vendor")) {
        newquery.vendor = query.vendor;
    }
    if (query.hasOwnProperty("from")) {
        let datesfrom = values.from.split('-');
        startDate = new Date(datesfrom[2], datesfrom[1] - 1, parseInt(datesfrom[0]) + 1)
    }
    if (query.hasOwnProperty("to")) {
        let datesto = values.to.split('-');
        endDate = new Date(datesto[2], datesto[1] - 1, parseInt(datesto[0]) + 1)
    }
    if (startDate != '' && endDate != '') {
        newquery.transactionDate = { $gte: startDate.toISOString(), $lte: endDate.toISOString() };
    }
    console.log("new query---->", newquery);
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                Transactions.find(newquery, {
                    '_id': 0,
                    'amount': 1,
                    'status': 1,
                    'transactionDate': 1,
                    'username': 1,
                    'utrnumber': 1
                }).then((Result) => {
                    if (Result && Result != null) {
                        resolve(Result);
                    } else {
                        reject({
                            success: false,
                            code: 200,
                            Status: "No Transaction Data Found.",
                            Data: {

                            },
                            "timestamp": new Date()
                        });
                    }
                }).catch((err) => {
                    console.error('Database Error');
                    console.error(err);
                    reject({
                        success: false,
                        code: 200,
                        Status: "Database Error",
                        "timestamp": new Date()
                    });
                });
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


const VendorDashboard = catchAsync(async(req, res) => {
    let values = req.body;
    //let responseData = {};  
    let totalsales = 0;
    let uniquemonthlycustomer = 0;
    let repeatedmonthlycustomer = 0;
    let currentmonthsales = 0;
    let currentDaySales = 0;
    let numberoftransactionpermonth = 0;

    let date = new Date();
    let currentmonth = date.getMonth();
    let currentday = date.getDate();
    let responseData = {};

    if (values.hasOwnProperty("vendor") && values.vendor != '' && values.vendor != null && values.vendor != undefined) {
        let allTransactions = await GetVendorTransactionData(values);
        console.log(allTransactions);
        for (each in allTransactions) {
            totalsales = totalsales + allTransactions[each].amount;
            if (allTransactions[each].transactionDate.getMonth() == currentmonth) {
                currentmonthsales = currentmonthsales + allTransactions[each].amount;
                numberoftransactionpermonth = numberoftransactionpermonth + 1;
            }
            if (allTransactions[each].transactionDate.getDate() == currentday) {
                currentDaySales = currentDaySales + allTransactions[each].amount;
            }
        }
        let GroupTransactions = await GroupGetVendorTransactionData(values);
        console.log(GroupTransactions);
        for (each in GroupTransactions) {
            let alltransactionsofuser = GroupTransactions[each].transactionDate;
            let count = 0;
            for (each1 in alltransactionsofuser) {
                if (alltransactionsofuser[each1].getMonth() == currentmonth) {
                    count = count + 1;
                }
            }
            if (alltransactionsofuser.length >= 1) {
                if (alltransactionsofuser[0].getMonth() == currentmonth) {
                    uniquemonthlycustomer = uniquemonthlycustomer + 1;
                }
            }
            if (count > 1) {
                repeatedmonthlycustomer = repeatedmonthlycustomer + 1;
            }
        }

        responseData.totalsales = Formatter.toINR(totalsales);
        responseData.uniquemonthlycustomer = uniquemonthlycustomer;
        responseData.repeatedmonthlycustomer = repeatedmonthlycustomer;
        responseData.currentmonthsales = Formatter.toINR(currentmonthsales);
        responseData.currentDaySales = Formatter.toINR(currentDaySales);
        responseData.numberoftransactionpermonth = numberoftransactionpermonth;
        res.send({
            success: true,
            code: 200,
            Status: "Vendor Dashboard Retrieved Success.",
            Data: responseData,
            "timestamp": new Date()
        });
    } else {
        res.send({
            success: false,
            code: 201,
            Status: "Invalid Vendor Username.",
            Data: {},
            "timestamp": new Date()
        })
    }
});

const GroupGetVendorTransactionData = (values) => {
    let query = values;
    let newquery = {};
    let startDate = '';
    let endDate = '';
    if (query.hasOwnProperty("username")) {
        newquery.vendor = query.username;
    }
    if (query.hasOwnProperty("vendor")) {
        newquery.vendor = query.vendor;
    }
    console.log("GROUP TRANSACTIONS QUERY", newquery)
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                Transactions.aggregate(
                    [{
                            $match: newquery
                        },
                        {
                            $group: {
                                _id: "$username",
                                transactionDate: {
                                    $push: "$transactionDate"
                                }
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                username: "$_id",
                                count: 1,
                                transactionDate: 1
                            }
                        }
                    ]
                ).then((Result) => {
                    if (Result && Result != null) {
                        resolve(Result);
                    } else {
                        reject({
                            success: false,
                            code: 200,
                            Status: "No Transaction Data Found.",
                            Data: {

                            },
                            "timestamp": new Date()
                        });
                    }
                }).catch((err) => {
                    console.error('Database Error');
                    console.error(err);
                    reject({
                        success: false,
                        code: 200,
                        Status: "Database Error",
                        "timestamp": new Date()
                    });
                });
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

const ValidateReferralIdAPI = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("ReferralId")) {
        ValidateReferralId(values).then((Result) => {
            res.json(Result);
        }).catch(err => res.json(err));
    } else if (values.hasOwnProperty("phoneNumber")) {
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

const ValidateReferralId = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                if (values.ReferralId) {
                    if (values.ReferralId != null && values.ReferralId != undefined) {
                        let query = {
                            username: values.ReferralId.toUpperCase()
                        };
                        Vendors.findOne(query).lean().exec().then((Result) => {
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

const ValidateReferralIdUsingPhoneNumber = (values) => {
        return new Promise((resolve, reject) => {
            setImmediate(() => {
                try {
                    if (values.phoneNumber) {
                        if (values.phoneNumber != null && values.phoneNumber != undefined) {
                            let query = {
                                phoneNumber: values.phoneNumber
                            };
                            Vendors.findOne(query).lean().exec().then((Result) => {
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
    //ReferVendor
const ReferVendor = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("shopName") && values.shopName != '' && values.shopName != null && values.shopName != undefined &&
        values.hasOwnProperty("dealerName") && values.dealerName != '' && values.dealerName != null && values.dealerName != undefined &&
        values.hasOwnProperty("phoneNumber") && values.phoneNumber != '' && values.phoneNumber != null && values.phoneNumber != undefined &&
        values.hasOwnProperty("Category") && values.Category != '' && values.Category != null && values.Category != undefined &&
        values.hasOwnProperty("Address") && values.Address != '' && values.Address != null && values.Address != undefined &&
        values.Address.hasOwnProperty("city") && values.Address.city != '' && values.Address.city != null && values.Address.city != undefined &&
        values.Address.hasOwnProperty("state") && values.Address.state != '' && values.Address.state != null && values.Address.state != undefined &&
        values.Address.hasOwnProperty("pincode") && values.Address.pincode != '' && values.Address.pincode != null && values.Address.pincode != undefined
    ) {
        var PreviousReferrals = await refervendormodel.findOne().sort('-id').lean().exec();
        let id = 1;
        if (PreviousReferrals.hasOwnProperty('id')) {
            id = PreviousReferrals.id + 1;
        } else {
            id = id;
        }
        console.log("Values id is ---->", id)
        values.id = id;
        refervendormodel(values).save().then((Result) => {
            res.send({
                code: 200,
                success: true,
                status: "Vendor Referred Successfully",
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
        })
    } else {
        let response = {};
        response.code = 201;
        response.success = false;
        response.message = "All Fields are Mandatory.";
        response.timestamp = new Date();
        res.send(response);
    }
});

const ListAssociatesOnPincode = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("pincode") && values.pincode.length > 0) {
        let newquery = {
            'Address.pincode': values.pincode
        };
        Associate.find(newquery, {
            '_id': 0,
            'username': 1,
            'phoneNumber': 1,
            'firstName': 1,
            'lastName': 1,
            'Address.pincode': 1,
            'status': 1
        }).then((Result) => {
            if (Result && Result != null) {
                res.send(Result);
            } else {
                res.send({
                    success: false,
                    code: 201,
                    Status: "No Associates Data Found.",
                    Data: {

                    },
                    "timestamp": new Date()
                });
            }
        }).catch((err) => {
            console.error('Database Error');
            console.error(err);
            res.send({
                success: false,
                code: 201,
                Status: "Database Error",
                "timestamp": new Date()
            });
        });
    } else {
        let response = {};
        response.code = 201;
        response.success = false;
        response.message = "Please select valid pincodes.";
        response.timestamp = new Date();
        res.send(response);
    }
});

const SendMarketingMessages = catchAsync(async(req, res) => {
    let values = req.body;
    console.log("values--------", values.pincode)
    console.log("values--------", values.subject)
    console.log("values--------", values.message)
    console.log("values--------", values.status)
    let id = 1;
    if (values.pincode && values.subject && values.message) {
        var PreviousMarketingMessages = await MarketingMessage.findOne().sort('-id').lean().exec();

        if (PreviousMarketingMessages && PreviousMarketingMessages.hasOwnProperty('id')) {
            id = PreviousMarketingMessages.id + 1;
        } else {
            id = id;
        }
        let Data = {
            id: id,
            vendorusername: values.vendorusername,
            pincode: values.pincode,
            subject: values.subject,
            message: values.message,
            status: 1,
            createdAt: new Date,
        };
        MarketingMessage(Data).save().then((Result) => {
            res.send({
                code: 200,
                success: true,
                status: "Marketing messages saved success.",
                Data: {},
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
        })
    } else {
        let response = {};
        response.code = 201;
        response.success = false;
        response.message = "All fields are mandatory.";
        response.timestamp = new Date();
        res.send(response);
    }
    let Data = {
        id: id,
        vendorusername: values.vendorusername,
        pincode: values.pincode,
        subject: values.subject,
        message: values.message,
        status: values.status,
        createdAt: new Date,
    };
    // MarketingMessage(Data).save().then((Result) => {
    //     res.send({
    //         code: 200,
    //         success: true,
    //         status: "Marketing messages saved success.",
    //         Data: Result,
    //         timestamp: new Date()
    //     });
    // }).catch((err) => {
    //     console.error('Database Error');
    //     console.error(err);
    //     res.send({
    //         code: 201,
    //         success: false,
    //         status: "DATABASE_ERROR",
    //         timestamp: new Date()
    //     });
    // })
    // }else{
    //     let response = {};
    //     response.code = 201;
    //     response.success = false;
    //     response.message = "All fields are mandatory.";
    //     response.timestamp = new Date();
    //     res.send(response);
    // }
});

const MarketingMessageReport = catchAsync(async(req, res) => {
    let values = req.body;
    let Result = await MarketingMessage.find(values).sort({ createdAt: -1 });
    if (Result && Result != null) {
        let newResult = [];
        if (Result.length > 0) {

            for (each in Result) {
                console.log(Result[each])
                let newJSON = {};
                newJSON.id = Result[each].id;
                newJSON.vendorusername = Result[each].vendorusername;
                newJSON.pincode = Result[each].pincode;
                newJSON.subject = Result[each].subject;
                newJSON.message = Result[each].message;
                newJSON.status = Result[each].status;
                newJSON.createdAt = Formatter.toDate(Result[each].createdAt);
                newResult.push(newJSON)
            }
        }
        let filePath = await generateReportForMarketingSummary(newResult);
        var fullPublicUrl = 'http://paizattoapi.paizatto.com/';
        res.send({
            success: true,
            code: 201,
            Status: "Marketing Messages Report Success.",
            //downloadurl:"https://enn-richh.s3.ap-south-1.amazonaws.com/file_example_XLSX_10.xlsx",
            downloadurl: `${fullPublicUrl}${filePath}`,
            Data: newResult,
            "timestamp": new Date(),
            //"ReportUrl": `${fullPublicUrl}${filePath}`
        });
    } else {
        res.send({
            success: false,
            code: 201,
            Status: "No Data Found.",
            Data: {

            },
            "timestamp": new Date()
        });
    }
});


const ListAllMarketingMessages = catchAsync(async(req, res) => {
    let values = req.body;
    MarketingMessage.find(values).then((Result) => {
        if (Result && Result != null) {
            res.send({
                success: true,
                code: 201,
                Status: "Marketing messages retrieved success.",
                Data: Result,
                "timestamp": new Date()
            });
        } else {
            res.send({
                success: false,
                code: 201,
                Status: "No Data Found.",
                Data: {

                },
                "timestamp": new Date()
            });
        }
    }).catch((err) => {
        console.error('Database Error');
        console.error(err);
        res.send({
            success: false,
            code: 201,
            Status: "Database Error",
            "timestamp": new Date()
        });
    });
});
var fetch = require('node-fetch');
const ApproveMarketingMessages = catchAsync(async(req, res) => {
    let values = req.body;
    try {
        if (values.hasOwnProperty("id") && values.id != '' && values.id != null && values.id != undefined &&
            values.hasOwnProperty("status") && values.status != null && values.status != undefined
        ) {
            let id = values.id;
            let status = values.status;
            let findMarketingMessage = await MarketingMessage.findOne({ id: values.id }).lean().exec();

            if (findMarketingMessage && findMarketingMessage.hasOwnProperty("status") && findMarketingMessage.status == 1 && values.status == 0) {
                let pincode = findMarketingMessage.pincode;
                let associatesInPincode = await Associate.find({ "Address.pincode": pincode }, { fcmToken: 1, username: 1, '_id': 0 }).lean().exec();
                if (associatesInPincode && associatesInPincode.length > 0) {
                    let allFCM = []
                    for (each in associatesInPincode) {
                        if (associatesInPincode[each].hasOwnProperty("fcmToken") && associatesInPincode[each].fcmToken != '') {
                            allFCM.push(associatesInPincode[each].fcmToken)
                        }
                    }

                    var notification = {
                        'title': findMarketingMessage.subject,
                        'text': findMarketingMessage.message
                    };
                    // fcm device tokens array
                    var fcm_tokens = allFCM;
                    var notification_body = {
                        'notification': notification,
                        'registration_ids': fcm_tokens
                    }
                    let response = await fetch('https://fcm.googleapis.com/fcm/send', {
                        'method': 'POST',
                        'headers': {
                            'Content-Type': 'application/json',
                            'Authorization': 'key=' + process.env.FIREBASE_SERVER_KEY_ASSOCIATE
                        },
                        'body': JSON.stringify(notification_body)
                    })

                    var PreviousNotifications = await Notification.findOne().sort('-id').lean().exec();
                    let id = 1;
                    if (PreviousNotifications && PreviousNotifications.hasOwnProperty('id')) {
                        id = PreviousNotifications.id + 1;
                    } else {
                        id = id;
                    }
                    let SaveNotificationData = [];
                    for (each in associatesInPincode) {
                        if (associatesInPincode[each].hasOwnProperty("fcmToken") && associatesInPincode[each].fcmToken != '') {
                            let newJSON = {};
                            newJSON.id = id;
                            newJSON.username = associatesInPincode[each].username;
                            newJSON.fcmToken = associatesInPincode[each].fcmToken;
                            newJSON.userType = "Associate"; //Vendor, Associate
                            newJSON.notificationbody = notification.title
                            newJSON.notificationtitle = notification.text;
                            newJSON.createdAt = new Date();
                            newJSON.status = 0;
                            id = id + 1;
                            SaveNotificationData.push(newJSON);
                        }
                    }
                    let saveNotifications = await Notification.insertMany(SaveNotificationData);
                    let result = await MarketingMessage.updateOne({ id: values.id }, { $set: { status: 0 } });
                    res.send({
                        code: 200,
                        success: true,
                        message: "Marketing Notification Sent Success.",
                        data: SaveNotificationData,
                        timestamp: new Date()
                    });
                } else {
                    let response = {};
                    response.code = 201;
                    response.success = false;
                    response.message = "No associates matched in the pincode.";
                    response.data = findMarketingMessage,
                        response.timestamp = new Date();
                    res.send(response);
                }
            } else {
                let response = {};
                response.code = 201;
                response.success = false;
                response.message = "Invalid Marketing Message or Rejected Message.";
                response.data = findMarketingMessage,
                    response.timestamp = new Date();
                res.send(response);
            }
            // let result = await MarketingMessage.updateMany({id:id},{ $set: { status: status }});
            //     res.send({
            //         code:200,
            //         success:true,
            //         message:"Marketing messages updated success.",
            //         data:result.nModified,
            //         timestamp: new Date()
            //     })
        } else {
            let response = {};
            response.code = 201;
            response.success = false;
            response.message = "Id and status are mandatory.";
            response.timestamp = new Date();
            res.send(response);
        }
    } catch (err) {
        res.send(err)
    }
});

const getContactUs = catchAsync(async(req, res) => {
    var newdata = new Array();
    Contactus.find({ status: 0 }).sort('-createdAt').lean().exec().then(async(Result) => {
        for (let i = 0; i < Result.length; i++) {
            if (Result[i].resolutionstatus == 0) {
                Result[i].resolutionstatus = "Resolved";
            } else if (Result[i].resolutionstatus == 1) {
                Result[i].resolutionstatus = "Pending";
            } else if (Result[i].resolutionstatus == 2) {
                Result[i].resolutionstatus = "In progress";
            } else if (Result[i].resolutionstatus == 3) {
                Result[i].resolutionstatus = "Created";
            }
            let Data = {
                "id": Result[i].id,
                "name": Result[i].name,
                "email": Result[i].email,
                "mobile": Result[i].mobile,
                "message": Result[i].message,
                "role": Result[i].role,
                "status": Result[i].status,
                "remarks": Result[i].remarks,
                "resolutionstatus": Result[i].resolutionstatus,
                "createdAt": Result[i].createdAt,
                "updatedAt": Result[i].updatedAt,
            };
            newdata.push(Data);
        }
        let filePath = await ExportContactDataExcel(Result);
        //var fullPublicUrl = `${req.protocol}://${req.get('host')}/`;
        var fullPublicUrl = 'http://paizattoapi.paizatto.com/';
        let downloadurl = `${fullPublicUrl}${filePath}`
        if (Result && Result.length > 0) {
            res.send({
                code: 200,
                success: true,
                message: "Data Retrieved Success.",
                data: Result,
                downloadurl: downloadurl,
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



const ExportVendorData = catchAsync(async(req, res) => {
    try {
        let ContactData = await Contactus.find({}).lean().exec();
        if (ContactData && ContactData.length > 0) {
            let newjson = {};
            newjson = ContactData[each];
            newjson.userType = ContactData[each].message.role;
            newjson.name = ContactData[each].name.name;
            newjson.email = ContactData[each].email.email;
            newjson.mobile = ContactData[each].mobile.mobile;
            newjson.message = ContactData[each].message.message;
            newjson.resolutionstatus = ContactData[each].resolution.resolutionstatus;
            newjson.remarks = ContactData[each].resolution.remarks;

            if (newjson.resolutionstatus == 0) {
                newjson.resolutionstatusname = "resolved";
            } else if (newjson.resolutionstatus == 1) {
                newjson.resolutionstatusname = "pending";
            } else if (newjson.resolutionstatus == 2) {
                newjson.resolutionstatusname = "in progress";
            } else if (newjson.resolutionstatus == 3) {
                newjson.resolutionstatusname = "created";
            }


            let filePath = await ExportContactDataExcel(contactDataExport);
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
                message: "No Contact's exists.",
                timestamp: new Date()
            });
        }
    } catch (error) {
        console.log(error)
        res.send({
            code: 201,
            success: false,
            message: "Contact Data Retrieval error.",
            data: error,
            timestamp: new Date()
        })
    }
});

var ExportContactDataExcel = async(data) => {
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
            { header: "User Type", key: "role", width: 25 },
            { header: "Name", key: "name", width: 25 },
            { header: "Mobile Number", key: "mobile", width: 25 },
            { header: "Email", key: "email", width: 25 },
            { header: "Message", key: "message", width: 25 },
            { header: "Status", key: "resolutionstatus", width: 25 },
            { header: "Remarks", key: "remarks", width: 25 },
            { header: "Created Date", key: "createdAt", width: 25 },
            { header: "Updated At", key: "updatedAt", width: 25 },

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
        let fileName = `Contact_${filedate}.xlsx`;
        console.log(fileName);
        await workbook.xlsx.writeFile(path.resolve(ALL_VENDORS_REPORT_FILES_PATH, fileName));
        return `export/vendordata/${fileName}`;
    } catch (err) {
        console.log('Error while generating Sales Summary Report', err);
    }

}

const deleteContactUs = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("id") && values.id != '' && values.id != null && values.id != undefined) {
        let query = {
            id: values.id
        }
        let changes = {
            $set: {
                status: '1'
            }
        }
        Contactus.updateOne(query, changes, { upsert: true }).lean().exec().then((UpdateStatus) => {
            res.send({
                code: 200,
                success: true,
                message: "Data Deleted Success.",
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
    } else {
        res.send({
            code: 201,
            success: false,
            message: "Id required to update products.",
            data: {},
            timestamp: new Date()
        });
    }
});

const updateContactUs = catchAsync(async(req, res) => {
    let values = req.body;
    let query = {
        "id": values.id,
    }
    let changes = {
        $set: values
    }
    Contactus.updateOne(query, changes, { upsert: true }).lean().exec().then((UpdateStatus) => {
        console.log(UpdateStatus);
        res.send({
            code: 200,
            success: true,
            message: "Contactus Update Success.",
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
});

const getFaq = catchAsync(async(req, res) => {
    Faq.find({}).lean().exec().then((Result) => {
        if (Result && Result.length > 0) {
            res.send({
                code: 200,
                success: true,
                message: "FAQ Retrieved Success.",
                data: Result,
                timestamp: new Date()
            })
        } else {
            res.send({
                code: 201,
                success: false,
                message: "No FAQ exists.",
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

const createFaq = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.question != '' && values.question != null && values.question != undefined &&
        values.answer != '' && values.answer != null && values.answer != undefined

    ) {
        let Data = {
            question: values.question,
            answer: values.answer,

        }
        Faq(Data).save().then((Result) => {
            res.send({
                success: true,
                code: 200,
                Status: "FAQ Data Saved Success",
                Data: {
                    question: Result.question,
                    answer: Result.answer
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



const updateFaq = catchAsync(async(req, res) => {
    let values = req.body;
    let query = {
        "_id": values._id,
    }
    let changes = {
        $set: values
    }
    Faq.updateOne(query, changes, { upsert: true }).lean().exec().then((UpdateStatus) => {
        console.log(UpdateStatus);
        res.send({
            code: 200,
            success: true,
            message: "Faq Update Success.",
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
});



const listReferVendors = catchAsync(async(req, res) => {
    let values = req.body;
    let query = {}
    if (values.hasOwnProperty("shopName")) {
        query.shopName = values.shopName;
    }
    if (values.hasOwnProperty("dealerName")) {
        query.dealerName = values.dealerName;
    }

    refervendormodel.find(query).lean().exec().then((Result) => {
        if (Result && Result != null) {
            res.send({
                success: false,
                code: 200,
                Status: "Refer Vendor Retrieved Success.",
                Data: Result,
                "timestamp": new Date()
            });
        } else {
            res.send({
                success: false,
                code: 200,
                Status: "No Data Found.",
                Data: {

                },
                "timestamp": new Date()
            });
        }
    }).catch((err) => {
        console.error('Database Error');
        console.error(err);
        res.send({
            success: false,
            code: 200,
            Status: "Database Error",
            "timestamp": new Date()
        });
    });
});

const transactionsdetails = catchAsync(async(req, res) => {
    Transactions.find({}).lean().exec().then((Result) => {
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

const addmembership = catchAsync(async(req, res) => {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        var decodedHeader = jwt_decode(bearerToken);
        if (decodedHeader.username != null && decodedHeader.username != '' && decodedHeader.username != undefined && decodedHeader.username.length > 9) {
            let username = decodedHeader.username;
            let values = {};
            values.username = username;
            let files = req.files;
            let UserData = await CheckWheatherVendorExists(values);

            let image = "";
            if (files.image) {
                const { buffer, originalname } = files.image[0];
                let image = await imageUpload.upload(buffer, originalname);
                image = image.Location;
            } else {
                image = UserData.image;
            }

            console.log(image)

            let query = {
                username: UserData.username
            }
            let Data = {};
            if (req.body.id) {
                Data.id = req.body.id;
            }
            if (req.body.level) {
                Data.name = req.body.name;
            }
            if (req.body.total_monthly_sale) {
                Data.value = req.body.value;
            }
            if (req.body.status) {
                Data.status = "0";
            }
            if (req.body.createdAt) {
                Data.createdAt = new Date();
            }
            if (req.body.updatedAt) {
                Data.updatedAt = new Date();
            }

            Data.image = image;
            let changes = {
                $set: Data
            }
            console.log(changes);
            Membership.updateOne(query, changes).lean().exec().then((UpdateStatus) => {
                console.log(UpdateStatus);
                res.json({
                    code: 200,
                    success: true,
                    message: "Data Update Success.",
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

const addtransactions = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.vendor != '' && values.vendor != null && values.vendor != undefined

    ) {
        var PreviousProducts = await Transactions.findOne().sort('-id').lean().exec();
        let id = 1;
        if (PreviousProducts.hasOwnProperty('id')) {
            id = PreviousProducts.id + 1;
        } else {
            id = id;
        }
        let Data = {
            id: id,
            username: values.username,
            vendor: values.vendor,
            utrnumber: values.utrnumber,
            amount: values.amount,
            status: 0,
            transactionDate: values.transactionDate,
            createdAt: new Date(),
            updatedAt: new Date(),

        }
        Transactions(Data).save().then((Result) => {
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
    } else {
        res.send({
            code: 201,
            success: false,
            status: "All Fields are Mandatory",
            timestamp: new Date()
        });
    }
});

const Updatetransactions = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("id") && values.id != '' && values.id != null && values.id != undefined) {
        let query = {
            id: values.id
        }
        let changes = {
            $set: values
        }
        Transactions.updateOne(query, changes, { upsert: true }).lean().exec().then((UpdateStatus) => {
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
    } else {
        res.send({
            code: 201,
            success: false,
            message: "Id required to update products.",
            data: {},
            timestamp: new Date()
        });
    }
});



const deletetransactions = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("id") && values.id != '' && values.id != null && values.id != undefined) {
        let query = {
            id: values.id
        }
        let changes = {
            $set: {
                status: '1'
            }
        }
        Transactions.updateOne(query, changes, { upsert: true }).lean().exec().then((UpdateStatus) => {
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
    } else {
        res.send({
            code: 201,
            success: false,
            message: "Id required to update products.",
            data: {},
            timestamp: new Date()
        });
    }
});

function my_date(date_string) {
    var date_components = date_string.split("/");
    var day = date_components[0];
    var month = date_components[1];
    var year = date_components[2];
    return new Date(year, month - 1, day);
}

const VedorFormAPI = catchAsync(async(req, res) => {
    const bearerHeader = req.headers['authorization'];
    //let values = req.body;
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        var decodedHeader = jwt_decode(bearerToken);
        if (decodedHeader.username != null && decodedHeader.username != '' && decodedHeader.username != undefined && decodedHeader.username.length > 9) {
            let username = decodedHeader.username;
            let values = {};
            values.username = username;
            let UserData = await CheckWheatherVendorExists(values);
            if (UserData) {
                let query = {
                    username: username
                }
                let newvalues = {
                    isForm: true
                }
                if (req.body.hasOwnProperty("kycDate")) {
                    newvalues.kycDate = my_date(req.body.kycDate)
                }
                //res.send(req.body)
                Vendors.updateOne(query, newvalues).lean().exec().then((UpdateStatus) => {
                    console.log(UpdateStatus);
                    res.send({
                        code: 200,
                        success: true,
                        message: "ISForm Update Success.",
                        timestamp: new Date()
                    });
                }).catch((err) => {
                    console.log(err);
                    res.send({
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
                response.message = "Invalid username passed.";
                response.timestamp = new Date();
                res.send(response);
            }
            //res.send(UserData);
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

///////////////
function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

var generateReportForSalesSummary = async(data) => {
    try {
        const SALES_SUMMARY_REPORT_FILES_PATH = path.resolve('public', 'reports', 'sales-summary');
        if (!fs.existsSync(SALES_SUMMARY_REPORT_FILES_PATH)) {
            fs.mkdirSync(SALES_SUMMARY_REPORT_FILES_PATH, { recursive: true });
        }
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("sales-summary");
        worksheet.columns = [
            { header: "Transaction Date", key: "transactionDate", width: 25 },
            { header: "No. Of Transactions", key: "transactions", width: 25 },
            { header: "No. Of Customers", key: "customers", width: 25 },
            { header: "Total Sales", key: "totalSales", width: 25 },
            { header: "Platform Fees", key: "totalplatformFees", width: 25 },
            { header: "GST Amount", key: "GSTAmount", width: 25 },
            { header: "Total Platform Fees", key: "platformfeeplusgst", width: 25 },

        ];
        worksheet.addRows(data);
        let fileName = `sales-summary-${Math.floor(Date.now() / 1000)}.xlsx`;
        await workbook.xlsx.writeFile(path.resolve(SALES_SUMMARY_REPORT_FILES_PATH, fileName));
        return `reports/sales-summary/${fileName}`;
    } catch (err) {
        console.log('Error while generating Sales Summary Report', err);
    }

}

var generateReportForTransactionSummary = async(data) => {
    try {
        const TRANSACTION_SUMMARY_REPORT_FILES_PATH = path.resolve('public', 'reports', 'transaction-summary');
        if (!fs.existsSync(TRANSACTION_SUMMARY_REPORT_FILES_PATH)) {
            fs.mkdirSync(TRANSACTION_SUMMARY_REPORT_FILES_PATH, { recursive: true });
        }
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("transaction-summary");
        worksheet.columns = [
            { header: "Vendor ID", key: "vendorUsername", width: 25 },
            { header: "Shop Name", key: "shopName", width: 25 },
            { header: "Transaction Status", key: "transactionStatus", width: 25 },
            { header: "Payer Amount", key: "payerAmount", width: 25 },
            { header: "Associate ID", key: "associateRegNo", width: 25 },
            { header: "Transaction Complete Date", key: "transactionDate", width: 25 },
            { header: "Platform Fees", key: "fee", width: 25 },
            { header: "GST Amount", key: "gst", width: 25 },
            { header: "Total Platform Fees", key: "totalplatformFees", width: 25 },
            { header: "Payable To Vendor", key: "payableToVendor", width: 25 },
            { header: "Payout Status", key: "payoutStatus", width: 25 },
            { header: "UTR Number", key: "utrNumber", width: 25 },
        ];
        worksheet.addRows(data);
        let fileName = `transaction-summary-${Math.floor(Date.now() / 1000)}.xlsx`;
        await workbook.xlsx.writeFile(path.resolve(TRANSACTION_SUMMARY_REPORT_FILES_PATH, fileName));
        return `reports/transaction-summary/${fileName}`;
    } catch (err) {
        console.log('Error while generating Transaction Summary Report', err);
    }
}

var generateReportForMarketingSummary = async(data) => {
    try {
        const MARKETING_SUMMARY_REPORT_FILES_PATH = path.resolve('public', 'reports', 'marketing-summary');
        if (!fs.existsSync(MARKETING_SUMMARY_REPORT_FILES_PATH)) {
            fs.mkdirSync(MARKETING_SUMMARY_REPORT_FILES_PATH, { recursive: true });
        }
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("marketing-summary");
        worksheet.columns = [
            // { header: "ID", key: "id", width: 25 },
            { header: "Vendor ID", key: "vendorusername", width: 25 },
            { header: "Subject", key: "subject", width: 25 },
            { header: "Message", key: "message", width: 25 },
            { header: "Pincode", key: "pincode", width: 25 },
            { header: "Status", key: "status", width: 25 },
            { header: "Created At", key: "createdAt", width: 25 },
        ];
        worksheet.addRows(data);
        let fileName = `marketing-summary-${Math.floor(Date.now() / 1000)}.xlsx`;
        await workbook.xlsx.writeFile(path.resolve(MARKETING_SUMMARY_REPORT_FILES_PATH, fileName));
        return `reports/marketing-summary/${fileName}`;
    } catch (err) {
        console.log('Error while generating Marketing Summary Report', err);
    }
}

const SendNotificationInVendor = async(values) => {
    console.log("Vendor notifcat", values)
    try {
        if (values.username && values.notificationbody && values.notificationtitle) {
            let UserData = await CheckWheatherVendorExists(values);
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
                            'Authorization': 'key=' + process.env.FIREBASE_SERVER_KEY_VENDOR
                        },
                    })
                    .then((response) => {
                        console.log("Notification Response--->", response.data)
                        let NotificationData = {
                            id: id,
                            username: values.username,
                            fcmToken: UserData.fcmToken,
                            userType: "Vendor", //Vendor, Associate
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

const SendNotification = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.username && values.notificationbody && values.notificationtitle) {
        let UserData = await CheckWheatherVendorExists(values);
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
                        'Authorization': 'key=' + process.env.FIREBASE_SERVER_KEY_VENDOR
                    },
                })
                .then((response) => {
                    console.log("Notification Response--->", response.data)
                    let NotificationData = {
                        id: id,
                        username: values.username,
                        fcmToken: UserData.fcmToken,
                        userType: "Vendor", //Vendor, Associate
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
                        res.send(response1);
                    });
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
            response.message = "Invalid vendor or Invalid FCM Token";
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

const ReadNotification = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("id") && values.id != '' && values.id != null && values.id != undefined) {
        let query = {
            id: values.id,
            userType: "Vendor"
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

const UploadImageInvendor = catchAsync(async(req, res) => {
    let files = req.files;
    if (files.image) {
        const { buffer, originalname } = files.image[0];
        let image = await imageUpload.upload(buffer, originalname);
        imagelocation = image.Location;
        res.send({
            success: true,
            code: 200,
            Status: "Image Upload Success",
            Data: imagelocation,
            "timestamp": new Date()
        })
    } else {
        res.send({
            success: false,
            code: 201,
            Status: "Invalid Image",
            Data: {

            },
            "timestamp": new Date()
        })
    }

});

module.exports = {
    RegisterVendor,
    LoginVendor,
    ForgotPasswordVendor,
    UpdateVendorPassword,
    UpdateVendorProfile,
    UpdateVendorKYC,
    UpdateShopDetails,
    VerifyPhoneNumberExistsAlready,
    getSalesSummary,
    VendorTransactionReport,

    VendorMandatoryFieldsValidation,
    VendorMobileandRenterMobileValidation,
    VendorCheckWheatherMobileExistsAlready,
    VendorPasswordandConfirmPasswordValidation,
    VendorPinCodeValidation,
    VendorTermsAndConditionsValidation,
    GenerateUniqueUserIdForVendor,
    CheckWheatherVendorExists,
    GetVendorDetails,
    UploadMultipleFilesToS3,
    FAQVendor,
    ContactUsVendor,
    ValidateReferralIdAPI,

    VendorDashboard,
    ReferVendor,
    ListAssociatesOnPincode,
    SendMarketingMessages,
    MarketingMessageReport,
    ListAllMarketingMessages,
    ApproveMarketingMessages,


    getContactUs,
    updateContactUs,
    createFaq,
    getFaq,
    updateFaq,

    listReferVendors,

    transactionsdetails,
    addmembership,
    GetMemberShipBasedOnId,
    addtransactions,
    Updatetransactions,
    deletetransactions,

    deleteContactUs,
    GetCategoryData,
    VedorFormAPI,

    SendNotification,
    ReadNotification,
    GetAllNotification,

    SendSMSInVendor,
    SendNotificationInVendor,

    UploadImageInvendor,
    ExportVendorData

    //SendVendorAppLink
};