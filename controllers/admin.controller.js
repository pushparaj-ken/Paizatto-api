const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode');

let moment = require('moment');
let uuid = require('uuid');

let crypto = require('crypto');
let rand = require('csprng');

//const { response } = require('../app');
//Google Distance Module and API key kept here, move api key to env file
const distanceCalc = require('google-distance');
distanceCalc.apiKey = '';
var axios = require('axios');

let userController = require('../controllers/user.controller');
const vendorController = require('../controllers/vendor.controller')
const reportController = require('../controllers/reports.controller');
let Formatter = require('../services/formatter')
let pinvalidatemodule = require('pincode-validator');
var Level = require('../model/level')
var Associate = require('../model/associate')
var AssociateOtp = require('../model/associateotp')
var GeneralSetting = require('../model/generalsetting');
var Categories = require('../model/category');
var primaryCategories = require('../model/primarycategory');
var Packages = require('../model/package');
var Levels = require('../model/level');
var Vendors = require('../model/vendor');
var Points = require('../model/point');
var Transactions = require('../model/transaction');
var Payouts = require('../model/payout');
var Products = require('../model/product');
var MembershipModel = require('../model/membership')
const AllConstants = require('../services/constants');
let Area = require('../model/area')
var User = require('../model/user');
var Menu = require('../model/menu');
var Role = require('../model/role');
let Notification = require('../model/notification')
let BankTransaction = require('../model/banktransactions')
let Faq = require('../model/faq');
let GeneralSettings = require('../model/generalsetting')
let PaizattoPoints = require('../model/paizattopoints')
    //let newvendor = require('../model/newvendors')
    //Need to move these keys to env file
var algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
var key = 'password';
const imageUpload = require('../services/image_upload.service');

const excel = require("exceljs");
var fs = require('fs');
var path = require('path');

const AddOrUpdateGeneralSettings = catchAsync(async(req, res) => {
    let values = req.body;
    CreateorUpdateGeneralSettings(values).then((Result) => {
        res.send(Result);
    }).catch(err => res.json(err));
});

const GetAllGeneralSettings = catchAsync(async(req, res) => {
    GetAllGeneralSettingsAdmin().then((Result) => {
        res.send(Result);
    }).catch(err => res.json(err));
});

//DeleteGeneralSettings
const DeleteGeneralSettings = catchAsync(async(req, res) => {
    let values = req.body;
    let query = values;
    let changes = {
        $set: {
            status: 'Deleted'
        }
    }
    GeneralSetting.updateOne(query, changes, { upsert: true }).lean().exec().then((UpdateStatus) => {

        res.send({
            code: 200,
            success: true,
            message: "General Settings Deleted Success.",
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

//This api is only for adding categories, not for updating categories
const AddOrUpdateCategories = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.fee != '' && values.fee != null && values.fee != undefined &&
        values.gst != '' && values.gst != null && values.gst != undefined &&
        values.name != '' && values.name != null && values.name != undefined &&
        values.membershipid != '' && values.membershipid != null && values.membershipid != undefined &&
        values.membershipname != '' && values.membershipname != null && values.membershipname != undefined &&
        values.membershipvalue != '' && values.membershipvalue != null && values.membershipvalue != undefined
    ) {
        var PreviousCategories = await Categories.findOne().sort('-id').lean().exec();
        let id = 1;
        if (PreviousCategories && PreviousCategories.hasOwnProperty('id')) {
            id = PreviousCategories.id + 1;
        } else {
            id = id;
        }
        let Membership = {};
        Membership.id = values.membershipid;
        Membership.name = values.membershipname;
        Membership.value = values.membershipvalue;
        let Data = {
            id: id,
            fee: values.fee,
            gst: values.gst,
            name: values.name,
            status: 1,
            Membership: Membership
        }
        Categories(Data).save().then((Result) => {
            res.send({
                success: true,
                code: 200,
                Status: "Category Added Success.",
                Data: {
                    id: Result.id,
                    name: Result.name
                },
                "timestamp": new Date()
            });
        }).catch((err) => {
            console.error('Database Error');
            console.error(err);
            res.send({
                success: false,
                code: 201,
                Status: "Database Error",
                Data: {

                },
                "timestamp": new Date()
            });
        })
    } else {
        res.send({
            success: false,
            code: 201,
            Status: "All fields are Mandatory.",
            "timestamp": new Date()
        });
    }
});

const UpdateCategories = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.id != '' && values.id != null && values.id != undefined) {
        let query = {
            id: values.id
        }
        delete values.id;
        let newvalues = {
            $set: values
        };
        Categories.updateOne(query, newvalues).lean().exec().then((UpdateStatus) => {
            //console.log(UpdateStatus);
            res.send({
                code: 200,
                success: true,
                message: "Category Updated Success.",
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
            success: false,
            code: 201,
            Status: "Category id is Mandatory.",
            "timestamp": new Date()
        });
    }
});

const GetAllCategories = catchAsync(async(req, res) => {
    GetAllCategoriesAdmin().then((Result) => {
        res.send(Result);
    }).catch(err => res.json(err));
});

//DeleteCategories
const DeleteCategories = catchAsync(async(req, res) => {
    let values = req.body;
    let query = values;
    let changes = {
        $set: {
            status: 1
        }
    }
    Categories.updateOne(query, changes, { upsert: true }).lean().exec().then((UpdateStatus) => {
        console.log(UpdateStatus);
        res.send({
            code: 200,
            success: true,
            message: "Category Deleted Success.",
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

const AddOrUpdatePackages = catchAsync(async(req, res) => {
    let values = req.body;
    CreateorUpdatePackages(values).then((Result) => {
        res.send(Result);
    }).catch(err => res.json(err));
});

const GetAllPackages = catchAsync(async(req, res) => {
    GetAllPackagesAdmin().then((Result) => {
        res.send(Result);
    }).catch(err => res.json(err));
});

//DeletePackages
const DeletePackages = catchAsync(async(req, res) => {
    let values = req.body;
    let query = values;
    let changes = {
        $set: {
            status: 'Deleted'
        }
    }
    Packages.updateOne(query, changes, { upsert: true }).lean().exec().then((UpdateStatus) => {
        console.log(UpdateStatus);
        res.send({
            code: 200,
            success: true,
            message: "Package Deleted Success.",
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

const AddOrUpdateLevels = catchAsync(async(req, res) => {
    let values = req.body;
    CreateorUpdateLevels(values).then((Result) => {
        res.send(Result);
    }).catch(err => res.json(err));
});

const GetAllLevels = catchAsync(async(req, res) => {
    GetAllLevelsAdmin().then((Result) => {
        res.send(Result);
    }).catch(err => res.json(err));
});

//DeleteLevels
const DeleteLevels = catchAsync(async(req, res) => {
    let values = req.body;
    let query = values;
    let changes = {
        $set: {
            status: 'Deleted'
        }
    }
    Levels.updateOne(query, changes, { upsert: true }).lean().exec().then((UpdateStatus) => {
        console.log(UpdateStatus);
        res.send({
            code: 200,
            success: true,
            message: "Level Deleted Success.",
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

const RegisterAssociateAdmin = catchAsync(async(req, res) => {
    console.log("user", userController)
    let values = req.body;
    AssociateMandatoryFieldsValidation(values).then((ValidityStatus) => {
        MobileandRenterMobileValidation(values).then((ValidityStatus) => {
            CheckWheatherMobileExistsAlready(values).then((ValidityStatus) => {
                PasswordandConfirmPasswordValidation(values).then((ValidityStatus) => {
                    PinCodeValidation(values).then((ValidityStatus) => {
                        ValidateReferralIdAndGetReferralData(values).then((ReferralUserData) => {
                            TermsAndConditionsValidation(values).then((ValidityStatus) => {
                                GenerateUniqueUserIdForAssociate().then((GeneratedUID) => {
                                    GetLevelZeroData().then((LevelData) => {
                                        Register_Associate_Admin(req.body, ReferralUserData, GeneratedUID, LevelData).then((Result) => {
                                            res.json(Result);
                                        }).catch(err => res.json(err));
                                    }).catch(err => res.json(err));
                                }).catch(err => res.json(err));
                            }).catch(err => res.json(err));
                        }).catch(err => res.json(err));
                    }).catch(err => res.json(err));
                }).catch(err => res.json(err));
            }).catch(err => res.json(err));
        }).catch(err => res.json(err));
    }).catch(err => res.json(err));
});

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

const PinCodeValidation = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                if (values.hasOwnProperty("pincode")) {
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
                } else {
                    resolve("Validated Successfully")
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

const TermsAndConditionsValidation = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                if (values.hasOwnProperty("acceptTermsNConditions")) {
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
                } else {
                    resolve("Validated Successfully")
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

const GetAssociatePersonalDetailsAssociateAdmin = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("username") && values.username != '' && values.username != null && values.username != undefined) {
        let username = values.username;

        GetAssociateDetailsWithUserNameAdmin(username).then((Result) => {
            res.send(Result);
        }).catch(err => res.json(err));
    } else {
        res.send({
            'code': 201,
            'success': false,
            'message': 'Invalid Username',
            'timestamp': new Date()
        });
    }
});

const GetAssociatePersonalDetailsAssociateAdminBank = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("phoneNumber") && values.phoneNumber != '' && values.phoneNumber != null && values.phoneNumber != undefined) {
        let query = {
            phoneNumber: values.phoneNumber
        }
        let AssociateDetails = await Associate.findOne(query).lean().exec();
        if (AssociateDetails && AssociateDetails.hasOwnProperty("username")) {
            res.send({
                'code': 200,
                'success': true,
                'message': 'Associate Data Retrieved.',
                'data': AssociateDetails,
                'timestamp': new Date()
            });
        } else {
            res.send({
                'code': 201,
                'success': false,
                'message': 'Invalid Username',
                'timestamp': new Date()
            });
        }
    } else {
        res.send({
            'code': 201,
            'success': false,
            'message': 'Invalid Username',
            'timestamp': new Date()
        });
    }
});




const GetAssociateDetailsWithUserNameAdmin = (username) => {
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
                        if (Result.hasOwnProperty("Password")) {
                            var decipher = crypto.createDecipher(algorithm, key);
                            Result.Password = decipher.update(Result.Password, 'hex', 'utf8') + decipher.final('utf8');
                        }
                        Associate.findOne({ username: Result.referrer.referralid }).lean().exec().then((Result_new) => {
                            if (Result_new && Result_new != null && Result_new != undefined) {
                                Result.referralName = Result_new.firstName;
                            } else {
                                Result.referralName = '';
                            }


                            console.log(Result.referralUserName);
                            if (Result.DOB != null && Result.DOB != '') {
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
                                    //  Result.DOB = dd + '/' + mm + '/' + yyyy;
                                    Result.DOB = moment(Result.DOB).format('YYYY-MM-DD')
                                }
                            } else {
                                Result.DOB = null;
                            }
                            if (Result.hasOwnProperty("status")) {
                                if (Result.status === 0) {
                                    Result.statusName = "New User";
                                } else if (Result.status === 1) {
                                    Result.statusName = "Active";
                                } else if (Result.status === 2) {
                                    Result.statusName = "Inactive";
                                } else {
                                    Result.statusName = "Blocked";
                                }
                            }


                            let response = {};
                            response.code = 200;
                            response.success = true;
                            response.message = "User Data Retrieved.";
                            response.Data = Result,
                                response.timestamp = new Date();


                            resolve(response)
                        });
                    } else {
                        reject({
                            success: false,
                            code: 201,
                            Status: "Username Doesn't Exist.3",
                            "timestamp": new Date()
                        });
                    }
                }).catch((err) => {
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
const UpdatePersonalDetailsAssociateAdmin = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty('username') || values.hasOwnProperty('phoneNumber')) {
        CheckWheatherUserExistsAdmin(values).then((UserData) => {
            var cipher = crypto.createCipher(algorithm, key);
            if (values.Password) {
                values.Password = cipher.update(values.Password, 'utf8', 'hex') + cipher.final('hex')
            }
            let username = values.username || UserData.username;
            if (values.hasOwnProperty("Bank") && values.Bank.ifsccode != '' && values.Bank.ifsccode != null && values.Bank.ifsccode != undefined) {
                ValidateIFSCCodeADMIN(values.Bank).then((BankDetails) => {
                    values.Bank.bankname = BankDetails.BANK;
                    values.Bank.branchname = BankDetails.BRANCH;
                    if (values.hasOwnProperty("phoneNumber")) {
                        delete values.phoneNumber
                    }
                    if (values.hasOwnProperty("username")) {
                        delete values.username
                    }
                    UpdateAssociatePersonalDetailsAdmin(values, username, UserData).then((Result) => {
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
                if (values.hasOwnProperty("phoneNumber")) {
                    delete values.phoneNumber
                }
                if (values.hasOwnProperty("username")) {
                    delete values.username
                }
                UpdateAssociatePersonalDetailsAdmin(values, username, UserData).then((Result) => {
                    res.send(Result);
                }).catch(err => res.json(err));
            }
        }).catch(err => {
            console.log("err", err)
            res.json(err)
        });
    } else {
        let response = {};
        response.code = 201;
        response.success = false;
        response.message = "Username or Phone Number is required to update associate.";
        response.timestamp = new Date();
        res.send(response);
    }
});
const CheckWheatherUserExistsAdmin = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                var query = {};
                if (values.hasOwnProperty("username")) {
                    query = {
                        username: values.username
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
const UpdateAssociateKYCAdmin = catchAsync(async(req, res) => {
    let values = req.body;
    console.log(values.username);
    if (values.username != '' && values.username != null && values.username != undefined) {
        let files = req.files;
        let valuesJSON = {};
        valuesJSON.username = values.username;
        let UpdatableData = {};
        let UserData = await CheckWheatherUserExistsAdmin(valuesJSON);
        //let files = req.files;
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
        // CheckWheatherUserExistsAdmin(valuesJSON).then((UserData) => {
        //     if(files.aadhar && files.pan) {console.log(files);
        //         const { buffer, originalname } = files.aadhar[0];
        //         imageUpload.upload(buffer, originalname).then((aadharPATH) => {
        //             const { buffer, originalname } = files.pan[0];
        //             imageUpload.upload(buffer, originalname).then((panPATH) => {
        //                 let query = {
        //                     username:UserData.username
        //                 }
        //                 let changes = {
        //                     $set: {
        //                         aadharNo:req.body.aadharNo,
        //                         panNo:req.body.panNo,
        //                         panPath:panPATH.Location,
        //                         aadharPath:aadharPATH.Location
        //                     }
        //                 }
        //                 Associate.updateOne(query, changes).lean().exec().then((UpdateStatus) => {
        //                     res.json({
        //                         code:200,
        //                         success:true,
        //                         message:"KYC Update Success.",
        //                         timestamp:new Date()
        //                     });
        //                 }).catch((err) => {
        //                     res.json({
        //                         success: false,
        //                         code:201,
        //                         Status: "Database Error",
        //                         Data: {

        //                         },
        //                         "timestamp":new Date() 
        //                     })
        //                 });
        //             }).catch(err => res.json(err)); 
        //         }).catch(err => res.json(err)); 
        //     }else{
        //         let response = {};
        //         response.code = 201;
        //         response.success = false;
        //         response.message = "Both aadhar and pan are required.";
        //         response.timestamp = new Date();
        //         res.send(response);
        //     }
        // }).catch(err => res.json(err));  
    } else {
        let response = {};
        response.code = 201;
        response.success = false;
        response.message = "Username or Phone Number is required to update associate kyc.";
        response.timestamp = new Date();
        res.send(response);
    }
});

const DeleteAssociateAdmin = catchAsync(async(req, res) => {
    let values = req.body;
    CheckWheatherUserExistsAdmin(values).then((UserData) => {
        let query = {
            username: UserData.username
        }
        let changes = {
            $set: {
                status: 1
            }
        }
        Associate.updateOne(query, changes).lean().exec().then((UpdateStatus) => {
            res.send({
                code: 200,
                success: true,
                message: "Associate Deleted Success.",
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
    }).catch(err => res.json(err));
});

const GetAssociateNameBasedOnUsername = async(values) => {
    let NamesJSON = {};
    let AllAssociate = await Associate.find({}, {
        '_id': 0,
        'username': 1,
        'firstName': 1,
        'lastName': 1
    }).lean().exec();
    if (AllAssociate.length > 0) {
        for (each in AllAssociate) {
            NamesJSON[AllAssociate[each].username] = AllAssociate[each].firstName + " " + AllAssociate[each].lastName;
        }
    }
    return NamesJSON;

};

//ListAllAssociateAdmin
const ListAllAssociateAdmin = catchAsync(async(req, res) => {
    let AllAssociateJSON = await GetAssociateNameBasedOnUsername();
    Associate.find({}).sort({ 'createdAt': -1 }).lean().exec().then((Result) => {
        if (Result && Result.length > 0) {
            for (each in Result) {
                if (Result[each].hasOwnProperty("referrer") && Result[each].referrer.hasOwnProperty("referralid") && Result[each].referrer.referralid != "") {
                    Result[each].referrer["referrername"] = AllAssociateJSON[Result[each].referrer.referralid]
                }
            }
            res.send({
                code: 200,
                success: true,
                message: "Associates's Retrieved Success.",
                data: Result,
                timestamp: new Date()
            })
        } else {
            res.send({
                code: 201,
                success: false,
                message: "No associates's exists.",
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

const RegisterVendorAdmin = catchAsync(async(req, res) => {
    let values = req.body;
    let membership1 = "";
    if (values.hasOwnProperty("membershipid")) {
        membership1 = await vendorController.GetMemberShipBasedOnId({ id: values.membershipid });
    } else {
        membership1 = await vendorController.GetMemberShipBasedOnId({ id: 1 });
    }
    vendorController.VendorMandatoryFieldsValidation(values).then((ValidityStatus) => {
        vendorController.VendorMobileandRenterMobileValidation(values).then((ValidityStatus) => {
            vendorController.VendorCheckWheatherMobileExistsAlready(values).then((ValidityStatus) => {
                vendorController.VendorPasswordandConfirmPasswordValidation(values).then((ValidityStatus) => {
                    vendorController.VendorPinCodeValidation(values).then((ValidityStatus) => {
                        vendorController.VendorTermsAndConditionsValidation(values).then((ValidityStatus) => {
                            vendorController.GenerateUniqueUserIdForVendor().then((GeneratedUID) => {
                                vendorController.GetCategoryData(values).then((CategoryData) => {
                                    console.log("CategoryData---->", CategoryData)
                                    let membershipquery = {};
                                    if (CategoryData.hasOwnProperty("Membership") && CategoryData.Membership.hasOwnProperty("id")) {
                                        membershipquery.id = CategoryData.Membership.id;
                                    } else {
                                        membershipquery.id = 1;
                                    }
                                    vendorController.GetMemberShipBasedOnId(membershipquery).then((Membership1) => {
                                        Register_Vendor_Admin(values, GeneratedUID, Membership1, CategoryData).then((Result) => {
                                            console.log("Membership1", Membership1)
                                            res.json(Result);
                                        }).catch(err => {
                                            console.log(err)
                                            res.json(err)
                                        });
                                    }).catch(err => {
                                        console.log(err)
                                        res.json(err)
                                    });
                                }).catch(err => res.json(err));
                            }).catch(err => res.json(err));
                        }).catch(err => res.json(err));
                    }).catch(err => res.json(err));
                }).catch(err => res.json(err));
            }).catch(err => res.json(err));
        }).catch(err => res.json(err));
    }).catch(err => res.json(err));
});

const UpdateVendorAdmin = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("username") || values.hasOwnProperty("phoneNumber")) {
        if (values.kycDate && typeof(values.kycDate) == 'string') {
            values.kycDate = my_datehaifen(values.kycDate)
        }
        vendorController.CheckWheatherVendorExists(values).then((UserData) => {
            if (values.hasOwnProperty("phoneNumber")) {
                delete values.phoneNumber
            }
            if (values.hasOwnProperty("username")) {
                delete values.username
            }
            let username = UserData.username;
            if (values.hasOwnProperty("Bank") && values.Bank.ifsccode != '' && values.Bank.ifsccode != null && values.Bank.ifsccode != undefined) {
                ValidateIFSCCodeADMIN(values.Bank).then((BankDetails) => {
                    values.Bank.bankname = BankDetails.BANK;
                    values.Bank.branchname = BankDetails.BRANCH;
                    UpdateVendorPersonalDetailsAdmin(values, username, UserData).then((Result) => {
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
                UpdateVendorPersonalDetailsAdmin(values, username, UserData).then((Result) => {
                    res.send(Result);
                }).catch(err => res.json(err));
            }
        }).catch(err => res.json(err));
    } else {
        res.send({
            code: 201,
            success: false,
            message: "Username or PhoneNumber Required to update vendor.",
            timestamp: new Date()
        });
    }
});
let ifsc = require('ifsc');
const ValidateIFSCCodeADMIN = (values) => {
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

const DeleteVendorAdmin = catchAsync(async(req, res) => {
    let values = req.body;
    vendorController.CheckWheatherVendorExists(values).then((UserData) => {
        let query = {
            username: UserData.username
        }
        let changes = {
            $set: {
                status: 1
            }
        }
        Vendors.updateOne(query, changes).lean().exec().then((UpdateStatus) => {
            res.send({
                code: 200,
                success: true,
                message: "Vendor Deleted Success.",
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
    }).catch(err => res.json(err));
});

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
        let AllVendorData = await Vendors.find(values).limit(limit).skip(skip).lean().exec();
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

const CheckWheatherVendorExistsAdmin = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                var query = {};
                if (values.hasOwnProperty("username")) {
                    query = {
                        username: values.username
                    }
                }
                if (values.hasOwnProperty("phoneNumber")) {
                    query = {
                        phoneNumber: values.phoneNumber
                    }
                }
                if (values.hasOwnProperty("employeeMobile")) {
                    query = {
                        employeeMobile: values.employeeMobile
                    }
                }
                Vendors.findOne(query).lean().exec().then((Result) => {
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

//UpdateVendorKYCAdmin
const UpdateVendorKYCAdmin = catchAsync(async(req, res) => {
    console.log(req.body);
    let values = req.body;
    if (values.kycDate && typeof(values.kycDate) == 'string') {
        values.kycDate = my_datehaifen(values.kycDate)
    }
    if (values.username || values.phoneNumber) {
        let files = req.files;
        let newUsernameJSON = {};
        if (values.username != '' && values.username != null && values.username != undefined) {
            newUsernameJSON.username = values.username
        }
        if (values.phoneNumber != '' && values.phoneNumber != null && values.phoneNumber != undefined) {
            newUsernameJSON.phoneNumber = values.phoneNumber
        }
        let UserData = await vendorController.CheckWheatherVendorExists(newUsernameJSON);
        //let Data = {}
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
        if (req.body.panNo) {
            req.body.panNo = req.body.panNo.toUpperCase();
        }
        if (req.body.gstNo) {
            req.body.gstNo = req.body.gstNo.toUpperCase();
        }
        //commented as per umas logic
        let Data = req.body;
        Data.panPath = panPath;
        Data.kycPATH = kycPATH;
        Data.gstPATH = gstPATH;
        Data.isKYC = true;

        if (req.body.panPath && req.body.panPath == '') {
            Data.panPath = '';
        }
        if (req.body.kycPATH && req.body.kycPATH == '') {
            Data.kycPATH = '';
        }
        if (req.body.gstPATH && req.body.gstPATH == '') {
            Data.gstPATH = '';
        }
        let changes = {
            $set: Data
        }
        console.log("changes----->", changes)
        Vendors.updateOne(query, changes).lean().exec().then((UpdateStatus) => {
            if (values.kycStatus && values.kycStatus != '' && values.kycStatus != null && values.kycStatus != undefined) {
                let templateid = AllConstants.SMSTemplateIds.VendorKycStatus;
                let senderid = AllConstants.SenderId.VendorKycStatus;
                let content = AllConstants.SMSContent.VendorKycStatus;
                console.log(content.indexOf("{#var#}"))

                let newkyc = "";
                let newkycreason = "";
                if (values.kycStatus == 0) {
                    newkyc = "Approved";
                    newkycreason = "";
                } else if (values.kycStatus == 1) {
                    newkyc = "Pending";
                    newkycreason = "";
                } else if (values.kycStatus == 2) {
                    newkyc = "Rejected";
                    newkycreason = values.kycReason
                } else if (values.kycStatus == 3) {
                    newkyc = "Re-work";
                    newkycreason = values.kycReason
                }
                content = content.replace("{#var#}", UserData.firstName);
                content = content.replace("{#var#}", newkyc)
                    //content = content.replace("{#var#}",newkycreason)
                    //let content = "";
                let number = UserData.phoneNumber;
                let message = "";
                vendorController.SendSMSInVendor(templateid, senderid, content, number, message).then(() => {
                    let notificationtitle = "Your KYC Status is " + newkyc;
                    let notificationbody = "Hello " + UserData.firstName + ", your KYC status is " + newkyc + "-" + newkycreason + ", Team Paizatto	"
                    vendorController.SendNotificationInVendor({ username: UserData.username, notificationbody: notificationbody, notificationtitle: notificationtitle }).then((NotificationResult) => {
                        res.json({
                            code: 200,
                            success: true,
                            message: "KYC and PAN Update Success.",
                            timestamp: new Date()
                        });
                    }).catch((err) => {
                        console.error('Notification sending Error');
                        console.error(err);
                        res.json({
                            code: 201,
                            success: false,
                            status: "Notification sending error",
                            timestamp: new Date()
                        });
                    })
                }).catch((err) => {
                    console.error('Database Error');
                    console.error(err);
                    res.json({
                        code: 201,
                        success: false,
                        status: "DATABASE_ERROR",
                        timestamp: new Date()
                    });
                })
            } else {
                res.json({
                    code: 200,
                    success: true,
                    message: "KYC and PAN Update Success.",
                    timestamp: new Date()
                });
            }
            console.log(UpdateStatus);
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
        // vendorController.CheckWheatherVendorExists(newUsernameJSON).then((UserData) => {
        //     if(
        //         (req.body.panNo != '' && req.body.panNo != undefined && req.body.panNo != null && files.pan)
        //         || (req.body.gstNo != '' && req.body.gstNo != undefined && req.body.gstNo != null && files.gst)
        //         && files.kyc
        //     ) {
        //         if(files.pan){
        //             const { buffer, originalname } = files.pan[0];
        //             imageUpload.upload(buffer, originalname).then((panPATH) => {
        //                 const { buffer, originalname } = files.kyc[0];
        //                 imageUpload.upload(buffer, originalname).then((kycPATH) => {
        //                     let query = {
        //                         username:UserData.username
        //                     }
        //                     let changes = {
        //                         $set: {
        //                             panNo:req.body.panNo,
        //                             panPath:panPATH.Location,
        //                             kycPATH:kycPATH.Location,
        //                             isKYC: true
        //                         }
        //                     }
        //                     Vendors.updateOne(query, changes).lean().exec().then((UpdateStatus) => {console.log(UpdateStatus);
        //                         res.json({
        //                             code:200,
        //                             success:true,
        //                             message:"KYC and PAN Update Success.",
        //                             timestamp:new Date()
        //                         });
        //                     }).catch((err) => {console.log(err);
        //                         res.json({
        //                             success: false,
        //                             code:201,
        //                             Status: "Database Error",
        //                             Data: {

        //                             },
        //                             "timestamp":new Date() 
        //                         })
        //                     });
        //                 }).catch(err => res.json(err)); 
        //             }).catch(err => res.json(err)); 
        //         }else if(files.gst){
        //             const { buffer, originalname } = files.gst[0];
        //             imageUpload.upload(buffer, originalname).then((gstPATH) => {
        //                 const { buffer, originalname } = files.kyc[0];
        //                 imageUpload.upload(buffer, originalname).then((kycPATH) => {
        //                     let query = {
        //                         username:UserData.username
        //                     }
        //                     let changes = {
        //                         $set: {
        //                             gstNo:req.body.gstNo,
        //                             gstPATH:gstPATH.Location,
        //                             kycPATH:kycPATH.Location
        //                         }
        //                     }
        //                     Vendors.updateOne(query, changes).lean().exec().then((UpdateStatus) => {console.log(UpdateStatus);
        //                         res.json({
        //                             code:200,
        //                             success:true,
        //                             message:"KYC and GST Update Success.",
        //                             timestamp:new Date()
        //                         });
        //                     }).catch((err) => {console.log(err);
        //                         res.json({
        //                             success: false,
        //                             code:201,
        //                             Status: "Database Error",
        //                             Data: {

        //                             },
        //                             "timestamp":new Date() 
        //                         })
        //                     });
        //                 }).catch(err => res.json(err)); 
        //             }).catch(err => res.json(err)); 
        //         }else {
        //             res.json({
        //                 success: false,
        //                 code:201,
        //                 Status: "Either PAN or GST required.",
        //                 Data: {

        //                 },
        //                 "timestamp":new Date() 
        //             })
        //         }
        //     }else{
        //         let response = {};
        //         response.code = 201;
        //         response.success = false;
        //         response.message = "All fields are required.";
        //         response.timestamp = new Date();
        //         res.send(response);
        //     }
        // }).catch(err => res.json(err));  
    } else {
        res.send({
            code: 201,
            success: false,
            message: "Username or PhoneNumber Required to update vendor kyc details.",
            timestamp: new Date()
        });
    }
});

//UpdateShopDetailsAdmin
const UpdateShopDetailsAdmin = catchAsync(async(req, res) => {
    let values = req.body;
    console.log(values.username);
    if (values.username || values.phoneNumber) {
        let files = req.files;
        let newUsernameJSON = {};
        if (values.username != '' && values.username != null && values.username != undefined) {
            newUsernameJSON.username = values.username
        }
        if (values.phoneNumber != '' && values.phoneNumber != null && values.phoneNumber != undefined) {
            newUsernameJSON.phoneNumber = values.phoneNumber
        }
        let UserData = await vendorController.CheckWheatherVendorExists(newUsernameJSON);
        var cipher = crypto.createCipher(algorithm, key);
        let ShopImages = [];
        let offerImages = [];
        let sliderImages = [];
        let featuredImage = "";
        if (files.shop) {
            ShopImages = await vendorController.UploadMultipleFilesToS3(files.shop);
        } else {
            if (req.body.ShopImages) {
                ShopImages = req.body.ShopImages;
            } else {
                ShopImages = UserData.shopImages;
            }
        }

        if (files.offers) {
            offerImages = await vendorController.UploadMultipleFilesToS3(files.offers);
        } else {
            if (req.body.offerImages) {
                offerImages = req.body.offerImages;
            } else {
                offerImages = UserData.offerImages;
            }
        }

        if (files.sliders) {
            sliderImages = await vendorController.UploadMultipleFilesToS3(files.sliders);
        } else {
            if (req.body.sliderImages) {
                sliderImages = req.body.sliderImages;
            } else {
                sliderImages = UserData.sliderImages;
            }
        }

        if (files.featuredImage) {
            console.log(vendorController);
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
        let Data = {}
        if (req.body.shopName) {
            Data.shopName = req.body.shopName
        }
        if (req.body.contactpersonName) {
            Data.contactpersonName = req.body.contactpersonName
        }
        if (req.body.delivery) {
            Data.delivery = req.body.delivery
        }
        if (req.body.Distance) {
            Data.Distance = req.body.Distance
        }
        console.log(req.body.Address);
        if (req.body.Address) {
            console.log("test");
            Data.Address = JSON.parse(req.body.Address);
        }
        if (req.body.Password) {
            Data.Password = cipher.update(req.body.Password, 'utf8', 'hex') + cipher.final('hex')
        }
        if (featuredImage) {
            Data.featuredImage = featuredImage
        }
        if (ShopImages) {
            Data.shopImages = ShopImages
        }
        if (offerImages) {
            Data.offerImages = offerImages
        }
        if (sliderImages) {
            Data.sliderImages = sliderImages
        }
        // let changes = {
        //     $set: Data
        // }

        /////////////// }

        // let query = {
        //     username: UserData.username
        // }
        //let Data = {}
        if (req.body.shopName) {
            Data.shopName = req.body.shopName
        }
        if (req.body.contactpersonName) {
            Data.contactpersonName = req.body.contactpersonName
        }
        if (req.body.delivery) {
            Data.delivery = req.body.delivery
        }
        if (req.body.Distance) {
            Data.Distance = req.body.Distance
        }
        console.log(req.body.Address);
        if (req.body.Address) {
            console.log("test");
            Data.Address = JSON.parse(req.body.Address);
        }
        if (req.body.Password) {
            Data.Password = cipher.update(req.body.Password, 'utf8', 'hex') + cipher.final('hex')
        }
        if (featuredImage) {
            Data.featuredImage = featuredImage
        }
        if (ShopImages) {
            Data.ShopImages = ShopImages
        }
        if (offerImages) {
            Data.offerImages = offerImages
        }
        if (sliderImages) {
            Data.sliderImages = sliderImages
        }
        let changes = {
            $set: Data
        }
        console.log("Vendor Update", changes)
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
        // vendorController.CheckWheatherVendorExists(newUsernameJSON).then((UserData) => {
        //     if(
        //         req.body.shopName != '' && req.body.shopName != null && req.body.shopName != undefined
        //         && req.body.contactpersonName != '' && req.body.contactpersonName != null && req.body.contactpersonName != undefined
        //         && req.body.Address != '' && req.body.Address != null && req.body.Address != undefined
        //         && req.body.delivery != '' && req.body.delivery != null && req.body.delivery != undefined
        //         && req.body.Distance != '' && req.body.Distance != null && req.body.Distance != undefined
        //     ){
        //         vendorController.UploadMultipleFilesToS3(files.shop).then((Result) => {console.log(Result)
        //             vendorController.UploadMultipleFilesToS3(files.offers).then((Result1) => {console.log(Result)
        //                 const { buffer, originalname } = files.QRCode[0];
        //                 imageUpload.upload(buffer, originalname).then((QRCodeImagePath) => {
        //                     const { buffer, originalname } = files.featuredImage[0];
        //                     imageUpload.upload(buffer, originalname).then((featuredImageImagePath) => {
        //                         let query = {
        //                             username:UserData.username
        //                         }
        //                         req.body.Address = JSON.parse(req.body.Address);
        //                         let changes = {
        //                             $set: {
        //                                 shopName:req.body.shopName,
        //                                 contactpersonName:req.body.contactpersonName,
        //                                 Address:JSON.parse(req.body.Address),
        //                                 delivery:req.body.delivery,
        //                                 Distance:req.body.Distance,
        //                                 QRCode:QRCodeImagePath.Location,
        //                                 featuredImage:featuredImageImagePath.Location,
        //                                 shopImages:Result,
        //                                 offerImages:Result1
        //                             }
        //                         }
        //                         Vendors.updateOne(query, changes).lean().exec().then((UpdateStatus) => {
        //                             res.json({
        //                                 code:200,
        //                                 success:true,
        //                                 message:"Vendor Images Update Success.",
        //                                 timestamp:new Date()
        //                             });
        //                         }).catch((err) => {console.log(err);
        //                             res.json({
        //                                 success: false,
        //                                 code:201,
        //                                 Status: "Database Error",
        //                                 Data: {

        //                                 },
        //                                 "timestamp":new Date() 
        //                             })
        //                         });
        //                     }).catch(err => {
        //                         console.log(err)
        //                         res.json(err)});
        //                 }).catch(err => {
        //                     console.log(err)
        //                     res.json(err)});
        //             }).catch(err => {
        //                 console.log(err)
        //                 res.json(err)});
        //         }).catch(err => {
        //             console.log(err)
        //             res.json(err)});
        //     }else{
        //         let response = {};
        //         response.code = 201;
        //         response.success = false;
        //         response.message = "All Fields are Mandatory..";
        //         response.timestamp = new Date();
        //         res.send(response);
        //     }
        // }).catch(err => res.json(err));  
    } else {
        res.send({
            code: 201,
            success: false,
            message: "Username or PhoneNumber Required to update vendor kyc details.",
            timestamp: new Date()
        });
    }
});
///////////////////

const Register_Associate_Admin = (values, ReferralUserData, GeneratedUID, LevelData) => {
    console.log("ADMI", LevelData);
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                if (values.Password) {
                    //  values.Password = Math.floor(100000 + Math.random() * 900000);
                } else {
                    values.Password = Math.floor(100000 + Math.random() * 900000).toString();
                }
                if (values.pincode) {

                } else {
                    values.pincode = null;
                }
                let salt = rand(80, 24);
                let pass = values.Password + salt;
                var cipher = crypto.createCipher(algorithm, key);
                let cipher1 = crypto.createCipher(algorithm, key);
                let hashedDeepLinkId = cipher1.update(GeneratedUID, 'utf8', 'hex') + cipher1.final('hex');
                let Data = {
                    uid: uuid.v4(),
                    username: GeneratedUID,
                    phoneNumber: values.phoneNumber,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    Password: cipher.update(values.Password, 'utf8', 'hex') + cipher.final('hex'),
                    PasswordSalt: salt,
                    createdAt: new Date(),
                    lastModifiedAt: new Date(),
                    createdBy: "Admin",
                    Address: {
                        pincode: values.pincode
                    },
                    deeplink: "https://paizatto.com/register?" + "referralid=" + hashedDeepLinkId,
                    Levels: LevelData,
                    updated_time: new Date(),
                    status: 0
                };
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

const UpdateAssociatePersonalDetailsAdmin = (values, username, UserData) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                let query = {
                    username: username
                };
                //let passwordSalt = UserData.PasswordSalt;

                if (values.hasOwnProperty("firstName") && values.hasOwnProperty("lastName") && values.hasOwnProperty("phoneNumber") &&
                    values.hasOwnProperty("Gender") && values.hasOwnProperty("DOB") && values.hasOwnProperty("Address")
                ) {
                    values.isPersonal = true;
                }
                if (values.hasOwnProperty("UPI")) {
                    let UPIKeys = [];
                    console.log(values.UPI);
                    for (var k in values.UPI) UPIKeys.push(k);
                    for (each in UPIKeys) {
                        if (values.UPI[UPIKeys[each]] != "" && values.UPI[UPIKeys[each]] != null && values.UPI[UPIKeys[each]] != undefined) {
                            console.log("values------>", values.UPI[UPIKeys[each]]);
                            console.log("Algorithm", algorithm);
                            console.log("Key", key);
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
                if (values.DOB != '' && values.DOB != null && values.DOB != undefined) {
                    if (values.hasOwnProperty("DOB")) {
                        console.log(typeof(values.DOB));
                        values.DOB = moment(values.DOB).format('YYYY-MM-DD');
                    }
                } else {
                    values.DOB = null
                }
                console.log(values.Password);
                values.lastModifiedBy = "Admin";
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
                console.log(error);
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
    // if(date_string.indexOf('/') > -1){
    //     date_components = date_string.split("/");
    // }else if(date_string.indexOf('-') > -1){
    //     date_components = date_string.split("-");
    // }
    var day = date_components[0];
    var month = date_components[1];
    var year = date_components[2];
    return new Date(year, month - 1, day);
}

function my_datehaifen(date_string) {
    var date_components = date_string.split("-");
    var day = date_components[0];
    var month = date_components[1];
    var year = date_components[2];
    return new Date(year, month - 1, day);
}

const Register_Vendor_Admin = (values, GeneratedUID, membership1, CategoryData) => {
    console.log("membership1", membership1);
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                let salt = rand(80, 24);
                let pass = values.Password + salt;
                var cipher = crypto.createCipher(algorithm, key);
                let QRcode = "upi://pay?pa=PAIZATTO" + values.phoneNumber + ".08@cmsidfc&pn=" + values.shopName + "Y&tr=" + values.phoneNumber + "&am=&cu=INR&mc=5411";
                let Data = {
                    uid: uuid.v4(),
                    username: GeneratedUID,
                    phoneNumber: values.phoneNumber,
                    firstName: values.shopName,
                    lastName: values.contactpersonName,
                    Password: cipher.update(values.Password, 'utf8', 'hex') + cipher.final('hex'),
                    PasswordSalt: salt,
                    createdAt: new Date(),
                    lastModifiedAt: new Date(),
                    createdBy: "Admin",
                    Address: {
                        pincode: values.pincode
                    },
                    //deeplink:"https://en-rich.herokuapp.com/?"+"referralid="+GeneratedUID,
                    updated_time: new Date(),
                    QRCode: QRcode,
                    status: 2,
                    kycStatus: 1,
                    Category: CategoryData,
                    employeeMobile: values.employeeMobile,
                    Membership: membership1
                };
                if (CategoryData) {
                    Data.fee = CategoryData.fee;
                    Data.gst = CategoryData.gst;
                    //Data.Category = CategoryData
                }
                let accessToken = jwt.sign({ username: GeneratedUID }, process.env.TOKEN_SECRET, { expiresIn: "120s" });
                let refreshToken = jwt.sign({ username: GeneratedUID }, process.env.TOKEN_SECRET, { expiresIn: "1d" });
                Vendors(Data).save().then((Result) => {
                    resolve({
                        code: 200,
                        success: true,
                        status: "Registered Successfully",
                        Data: {
                            membership1: membership1,
                            uid: Result.uid,
                            username: Result.username,
                            firstName: Result.firstName,
                            lastName: Result.lastName,
                            employeeMobile: Result.employeeMobile,
                            phoneNumber: Result.PhoneNumber,
                            accessToken: accessToken,
                            refreshToken: refreshToken,
                            isVerifyUPI: Result.isVerifyUPI,
                            isBank: Result.isBank,
                            isPersonal: Result.isPersonal
                        },
                        timestamp: new Date()
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

const UpdateVendorPersonalDetailsAdmin = (values, username, vendorData) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                var cipher = crypto.createCipher(algorithm, key);
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
                values.lastModifiedBy = "Admin";
                if (values.Password) {
                    var cipher = crypto.createCipher(algorithm, key);
                    values.Password = cipher.update(values.Password, 'utf8', 'hex') + cipher.final('hex')
                }
                console.log("Vendor Bank Update Issue Checking----->", values)
                Vendors.updateOne(query, values).lean().exec().then((UpdateStatus) => {
                    resolve({
                        code: 200,
                        success: true,
                        message: "Vendor Personal Details Updated Success.",
                        timestamp: new Date()
                    })
                }).catch((err) => {
                    console.log(err)
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

const CreateorUpdateGeneralSettings = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                if (!isEmpty(values) &&
                    values.fee != '' && values.fee != null && values.fee != undefined &&
                    values.gst != '' && values.gst != null && values.gst != undefined
                ) {
                    let query = {
                        fee: values.fee,
                        gst: values.gst
                    }
                    let changes = {
                        $set: values
                    }
                    GeneralSetting.updateOne(query, changes, { upsert: true }).lean().exec().then((UpdateStatus) => {
                        console.log(UpdateStatus);
                        resolve({
                            code: 200,
                            success: true,
                            message: "General Settings Updated Success.",
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
                } else {
                    reject({
                        success: false,
                        code: 201,
                        Status: "No params sent to add or update.",
                        "timestamp": new Date()
                    });
                }
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

const GetAllGeneralSettingsAdmin = () => {
        return new Promise((resolve, reject) => {
            setImmediate(() => {
                try {
                    GeneralSetting.find().lean().exec().then((Result) => {
                        resolve({
                            code: 200,
                            success: true,
                            message: "General Settings Retrieved Success.",
                            Data: Result,
                            timestamp: new Date()
                        })
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
    ///////////////
const CreateorUpdateCategories = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                if (!isEmpty(values) &&
                    values.fee != '' && values.fee != null && values.fee != undefined &&
                    values.gst != '' && values.gst != null && values.gst != undefined
                ) {
                    let query = {
                        fee: values.fee,
                        gst: values.gst
                    }
                    let changes = {
                        $set: values
                    }
                    Categories.updateOne(query, changes, { upsert: true }).lean().exec().then((UpdateStatus) => {
                        console.log(UpdateStatus);
                        resolve({
                            code: 200,
                            success: true,
                            message: "Categories Updated Success.",
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
                } else {
                    reject({
                        success: false,
                        code: 201,
                        Status: "No params sent to add or update.",
                        "timestamp": new Date()
                    });
                }
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

const GetAllCategoriesAdmin = () => {
        return new Promise((resolve, reject) => {
            setImmediate(() => {
                try {
                    Categories.find().sort({ 'name': 1 }).lean().exec().then((Result) => {
                        if (Result.length > 0) {
                            for (each in Result) {
                                delete Result[each]._id
                            }
                        }
                        resolve({
                            code: 200,
                            success: true,
                            message: "Categories Retrieved Success.",
                            Data: Result,
                            timestamp: new Date()
                        })
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
    ////////////////
const CreateorUpdatePackages = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                if (!isEmpty(values) &&
                    values.name != '' && values.name != null && values.name != undefined
                ) {
                    let query = {
                        name: values.name
                    }
                    let changes = {
                        $set: values
                    }
                    Packages.updateOne(query, changes, { upsert: true }).lean().exec().then((UpdateStatus) => {
                        console.log(UpdateStatus);
                        resolve({
                            code: 200,
                            success: true,
                            message: "Packages Updated Success.",
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
                } else {
                    reject({
                        success: false,
                        code: 201,
                        Status: "No params sent to add or update.",
                        "timestamp": new Date()
                    });
                }
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

const GetAllPackagesAdmin = () => {
        return new Promise((resolve, reject) => {
            setImmediate(() => {
                try {
                    Packages.find().lean().exec().then((Result) => {
                        resolve({
                            code: 200,
                            success: true,
                            message: "Packages Retrieved Success.",
                            Data: Result,
                            timestamp: new Date()
                        })
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
    ///////////////
const CreateorUpdateLevels = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                if (!isEmpty(values) &&
                    values.name != '' && values.name != null && values.name != undefined
                ) {
                    let query = {
                        name: values.name
                    }
                    let changes = {
                        $set: values
                    }
                    Levels.updateOne(query, changes, { upsert: true }).lean().exec().then((UpdateStatus) => {
                        console.log(UpdateStatus);
                        resolve({
                            code: 200,
                            success: true,
                            message: "Levels Updated Success.",
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
                } else {
                    reject({
                        success: false,
                        code: 201,
                        Status: "No params sent to add or update.",
                        "timestamp": new Date()
                    });
                }
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

const GetAllLevelsAdmin = () => {
        return new Promise((resolve, reject) => {
            setImmediate(() => {
                try {
                    Levels.find().sort({ 'orderBy': 1 }).lean().exec().then((Result) => {
                        resolve({
                            code: 200,
                            success: true,
                            message: "Levels Retrieved Success.",
                            Data: Result,
                            timestamp: new Date()
                        })
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
    ////////////////

const UserCheckNetwork = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("AssociateUsername") && values.AssociateUsername != '' && values.AssociateUsername != null && values.AssociateUsername != undefined) {
        UserCheckNetworkAdmin(values).then((Result) => {
            res.send(Result);
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

const UserCheckNetworkAdmin = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                let query = {};
                if (typeof(values.AssociateUsername) == 'string') {
                    query = {
                        username: values.AssociateUsername
                    }
                } else if (typeof(values.AssociateUsername) == 'number') {
                    query = {
                        phoneNumber: values.AssociateUsername
                    }
                } else {
                    reject({
                        code: 201,
                        success: false,
                        message: "Invalid Type of Username Passed.",
                        timestamp: new Date()
                    });
                }
                Associate.findOne(query).lean().exec().then((Result) => {
                    if (Result != null && isEmpty(Result) == false) {
                        if (Result.hasOwnProperty("referrer") && Result.referrer.referralid != '' && Result.referrer.referralid != 'OL00000001') {
                            let ReferredUserId = Result.referrer.referralid;
                            let query1 = {
                                username: ReferredUserId
                            }
                            Associate.findOne(query1).lean().exec().then((Result1) => {
                                if (Result1 != null && isEmpty(Result1) == false && Result1.parentId != "" && Result1.parentId != null && Result1.parentId != undefined) {
                                    resolve({
                                        status: true,
                                        parentId: Result1.parentId
                                    });
                                } else {
                                    resolve({
                                        status: false
                                    })
                                }
                            }).catch((err) => {
                                console.log(err);
                                reject({
                                    code: 201,
                                    success: false,
                                    message: "DATABASE_ERROR.",
                                    timestamp: new Date()
                                });
                            })
                        } else {
                            resolve(false);
                        }
                    } else {
                        reject({
                            code: 201,
                            success: false,
                            message: "No such user exists.",
                            timestamp: new Date()
                        });
                    }
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
                console.log(err);
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

const InsertPoints = catchAsync(async(values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                if (values.hasOwnProperty("TransactionAmount") && values.TransactionAmount != '' && values.TransactionAmount != null && values.TransactionAmount != undefined &&
                    values.hasOwnProperty("AssociateUsername") && values.AssociateUsername != '' && values.AssociateUsername != null && values.AssociateUsername != undefined &&
                    values.hasOwnProperty("MerchantUsername") && values.MerchantUsername != '' && values.MerchantUsername != null && values.MerchantUsername != undefined
                ) {
                    InsertPointsAdmin(values).then((Result) => {
                        resolve(Result);
                    }).catch(err => {
                        reject(err)
                    });
                } else {
                    reject({
                        code: 201,
                        success: false,
                        message: "All Fields are Mandatory.",
                        timestamp: new Date()
                    });
                }
            } catch (error) {
                console.log(error);
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
});

const InsertPointsAdmin = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                let query = {
                    username: values.MerchantUsername
                }
                Vendors.findOne(query).lean().exec().then((Result) => {
                    if (Result != null && isEmpty(Result) == false && Result.hasOwnProperty("Package")) {
                        console.log(Result.Package)
                        let VendorPackageId = Result.Package[0]["id"]
                        let query1 = {
                            id: VendorPackageId
                        }
                        console.log("query111", query1)
                        Packages.findOne(query1).lean().exec().then((Result1) => {
                            console.log(Result1)
                            if (Result1 != null && isEmpty(Result1) == false) {
                                let PackageAmount = Result1.amount;
                                let PackagePoints = Result1.point;
                                let TransactionAmount = values.TransactionAmount;
                                let PointsToBeAdded = (TransactionAmount / PackageAmount) * PackagePoints;
                                let Data = {
                                    vendorUsername: values.MerchantUsername,
                                    customerUsername: values.AssociateUsername,
                                    points: PointsToBeAdded,
                                    amount: TransactionAmount,
                                    packageId: VendorPackageId,
                                    transactionDate: new Date()
                                }
                                Points(Data).save().then((Result2) => {
                                    console.log("points saved", Result2)
                                    resolve({
                                        success: true,
                                        code: 200,
                                        Status: "Points Added Success",
                                        Data: {
                                            vendorUsername: Result2.vendorUsername,
                                            customerUsername: Result2.customerUsername,
                                            points: Result2.points,
                                            amount: Result2.amount,
                                            packageId: Result2.packageId,
                                            transactionDate: Result2.transactionDate
                                        }
                                    });
                                }).catch((err) => {
                                    console.error('Database Error');
                                    console.error("1", err);
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
                                console.log("INVALID")
                                reject({
                                    code: 201,
                                    success: false,
                                    message: "Invalid Package of Vendor.",
                                    timestamp: new Date()
                                });
                            }
                        }).catch((err) => {
                            console.log("Package for vendor", err);
                            reject({
                                code: 201,
                                success: false,
                                message: "DATABASE_ERROR.",
                                timestamp: new Date()
                            });
                        })
                    } else {
                        reject({
                            code: 201,
                            success: false,
                            message: "Invalid Vendor.",
                            timestamp: new Date()
                        });
                    }
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
                console.log(error);
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

const CashbackCall = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                if (values.hasOwnProperty("TransactionAmount") && values.TransactionAmount != '' && values.TransactionAmount != null && values.TransactionAmount != undefined &&
                    values.hasOwnProperty("AssociateUsername") && values.AssociateUsername != '' && values.AssociateUsername != null && values.AssociateUsername != undefined &&
                    values.hasOwnProperty("MerchantUsername") && values.MerchantUsername != '' && values.MerchantUsername != null && values.MerchantUsername != undefined
                ) {
                    InsertPointsAdmin(values).then((Result) => {
                        console.log("Insert Points Result", Result);
                        resolve(Result);
                    }).catch(err => {
                        console.log("Insert points admin error ----", err)
                        reject(err)
                    });
                } else {
                    reject({
                        code: 201,
                        success: false,
                        message: "All Fields are Mandatory.",
                        timestamp: new Date()
                    });
                }
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
};

const SendCashback = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("AssociateUsername") && values.AssociateUsername != '' && values.AssociateUsername != null && values.AssociateUsername != undefined) {
        UserCheckNetworkAdmin(values).then((Result) => {
            if (Result.status == true) {
                InsertPointsAdmin(values).then((Result) => {
                    res.send(Result);
                }).catch(err => res.json(err));
            } else {
                CheckAndPlaceInNetwork(values).then((Result) => {
                    res.send(Result);
                }).catch(err => res.json(err));
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

const addChild = async(values) => {
    const { parentUserName, childUserName } = values;
    const parent = await Associate.findOne({ username: parentUserName })
    const child = await Associate.findOne({ username: childUserName })
    console.log("parent", parent)
    if (!parent) {
        let data = { message: 'Parent not found' }
        return data;
        //res.status(404).send({message: 'Parent not found'})
    } else if (!child) {
        let data = { message: 'Child not found' }
        return data;
        //res.status(404).send({message: 'Child not found'})
    } else {
        var someParent = await Associate.find({ sub: { "$in": [child.username] } })
        console.log("someParent", someParent)
        if (someParent && someParent.length) {
            let data = { message: "This is another parent's child" }
            return data;
            //res.status(400).send({ message: "This is another parent's child"})
        } else if (parent.sub.length < 3) {
            parent.sub.push(child.username)
                //console.log("Parent----->", parent)
            await parent.save()
            child.parentId = parent.username;
            await child.save()
            let data = {
                success: true,
                code: 200,
                Status: "Placed in network successfully"
            }
            return data

        } else {
            // if length is more than 3 insert in first child
            var emptyChild;
            console.log(emptyChild)
            var tempParent = JSON.parse(JSON.stringify(parent))
                //console.log("tempParent",tempParent)
            let stack;
            console.log("emptyChild inside while", emptyChild)
            if (tempParent.sub && tempParent.sub.length) {
                stack = [...tempParent.sub]
            }
            while (!emptyChild) {

                //  for (var i = 0; i < tempParent.sub.length; i++) {
                //    var child1 = tempParent.sub[i]
                for (var j = 0; j < tempParent.sub.length; j++) {
                    const subChild = await Associate.findOne({ username: tempParent.sub[j] })
                    if (subChild.sub.length < 3 && !emptyChild) {
                        emptyChild = JSON.parse(JSON.stringify(subChild))
                    } else {
                        stack.push(...subChild.sub);
                        console.log(stack);
                    }

                }
                if (!emptyChild) {
                    // tempParent = JSON.parse(JSON.stringify(stack.shift()))
                    tempParent = await Associate.findOne({ username: stack.shift() })
                    console.log("tempParent", tempParent)
                }

                // }


            }
            var newChild = await Associate.findOne({ username: emptyChild.username })
            console.log("child.username", child.username)
            newChild.sub.push(child.username)
            await newChild.save()
            child.parentId = newChild.username;
            try {
                await child.save()
                let data = {
                    success: true,
                    code: 200,
                    Status: "Placed in network successfully"
                }
                return data
            } catch (err) {
                return err
            }
        }
    }
}

const billing = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("documentId") && values.documentId != '' && values.documentId != null && values.documentId != undefined) {
        CheckParentId(values).then((Result) => {
            if (Result.Data.parentId && Result.Data.parentId != "") {
                CashbackCall(Result.Data).then((Result1) => {
                    res.send(Result1);
                }).catch(err => res.json(err));
            } else {
                transactionPoints(Result.Data).then((Result1) => {
                    console.log("Transaction Points---", Result1);
                    if (Result1.Data && Result1.Data >= 10) {
                        CashbackCall(Result.Data).then((Result2) => {
                            console.log("Check ParentID Values---1-->", Result2)
                            addChild(values).then((Result3) => {
                                res.send(Result3);
                            }).catch(err => {
                                console.log("add child error--->", err)
                                res.json(err)
                            });
                        }).catch(err => {
                            console.log("cashback call error--->", err);
                            res.json(err)
                        });
                    } else {
                        console.log("elsee", values)
                        CashbackCall(values).then((Result2) => {
                            console.log("Check ParentID Values---2-->", Result2)
                            res.send(Result2);
                        }).catch(err => {
                            console.log("err at cashbackcall", err)
                            res.json(err)
                        });
                    }
                }).catch(err => {
                    console.log("error on transaction points---->", err);
                    res.json(err)
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

const CheckParentId = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                let username = values.AssociateUsername;
                console.log("check parent", values)
                Associate.findOne({ username: username }).lean().exec().then((Result1) => {
                    console.log("result 1", Result1)
                    if (Result1 != null && isEmpty(Result1) == false) {
                        console.log(Result1.parentId)
                        if (Result1.hasOwnProperty("parentId") && Result1.parentId != '' && Result1.parentId != undefined) {
                            resolve(true)
                        } else {
                            resolve(false)
                        }
                    } else {
                        reject({
                            code: 201,
                            success: false,
                            message: "Invalid Associate.",
                            timestamp: new Date()
                        });
                    }
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

const transactionPoints = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                Transactions.find({ username: values.AssociateUsername }).lean().exec().then((Result) => {
                    if (Result != null && isEmpty(Result) == false) {
                        let monthPoints = 0;
                        for (let i = 0; i < Result.length; i++) {
                            let datePresent = new Date();
                            let presentMonth = datePresent.getMonth();
                            let presentYear = datePresent.getFullYear();
                            let transMonth = new Date(Result[i].transactionDate).getMonth();
                            let transYear = new Date(Result[i].transactionDate).getFullYear();
                            if (presentMonth == transMonth && presentYear == transYear) {
                                monthPoints = monthPoints + Result[i].points;
                            }
                        }
                        resolve({
                            code: 200,
                            success: true,
                            message: "Transaction points retrieved",
                            Data: monthPoints,
                            timestamp: new Date()
                        })
                    } else {
                        resolve({
                            code: 200,
                            success: true,
                            message: "Transaction points retrieved",
                            Data: 0,
                            timestamp: new Date()
                        })
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



const CheckAndPlaceInNetwork = (values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                let query = {
                    username: values.MerchantUsername
                }
                Vendors.findOne(query).lean().exec().then((Result) => {
                    if (Result != null && isEmpty(Result) == false && Result.hasOwnProperty("Package")) {
                        let VendorPackageId = Result.Package[0]["id"]
                        let query1 = {
                            id: VendorPackageId
                        }
                        Packages.findOne(query1).lean().exec().then((Result1) => {
                            if (Result1 != null && isEmpty(Result1) == false) {
                                let PackageAmount = Result1.amount;
                                let PackagePoints = Result1.point;
                                let TransactionAmount = values.TransactionAmount;
                                let PointsToBeAdded = (TransactionAmount / PackageAmount) * PackagePoints;
                                //Points in the month should be calculated
                                let date = new Date();
                                let year = date.getFullYear();
                                let month = date.getMonth() + 1;
                                let startDate = new Date(year, month - 1, 2);
                                let endDate = new Date();
                                Points.find({
                                        customerUsername: values.AssociateUsername,
                                        transactionDate: { $gte: startDate, $lte: endDate }
                                    }).lean().exec().then((Result) => {
                                        let CurrentMonthPoints = 0;
                                        if (Result.length > 0) {
                                            for (each in Result) {
                                                CurrentMonthPoints = CurrentMonthPoints + Result[each].points;
                                            }
                                        } else {
                                            CurrentMonthPoints = CurrentMonthPoints + 0
                                        }
                                        if ((PointsToBeAdded + CurrentMonthPoints) > 10) {
                                            InsertPointsAdmin(values).then((Result) => { //Here We Need to Add PlaceNetwork Logic
                                                resolve(Result);
                                            }).catch(err => reject(err));
                                        } else {
                                            InsertPointsAdmin(values).then((Result) => {
                                                resolve(Result);
                                            }).catch(err => reject(err));
                                        }
                                    }).catch((err) => {
                                        console.log(err);
                                        reject({
                                            code: 201,
                                            success: false,
                                            message: "DATABASE_ERROR.",
                                            timestamp: new Date()
                                        });
                                    })
                                    //resolve({"PointsToBeAdded":PointsToBeAdded});
                            } else {
                                reject({
                                    code: 201,
                                    success: false,
                                    message: "Invalid Package of Vendor.",
                                    timestamp: new Date()
                                });
                            }
                        }).catch((err) => {
                            console.log(err);
                            reject({
                                code: 201,
                                success: false,
                                message: "DATABASE_ERROR.",
                                timestamp: new Date()
                            });
                        })
                    } else {
                        reject({
                            code: 201,
                            success: false,
                            message: "Invalid Vendor.",
                            timestamp: new Date()
                        });
                    }
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
                console.log(error);
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

const getLevel = (values) => {
        return new Promise((resolve, reject) => {
            setImmediate(() => {
                try {
                    Associate.findOne({ username: values.username }).lean().exec().then((Result) => {
                        if (Result != null && isEmpty(Result) == false) {
                            let lastLevel = Result.Levels.pop();
                            let levelName = lastLevel.name;
                            let levelMax = lastLevel.max;
                            resolve({
                                code: 200,
                                success: true,
                                message: "Level data retrieved",
                                Data: {
                                    levelName: levelName,
                                    levelMax: levelMax
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
    //AddProductInAdmin
const AddProductInAdmin = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.name != '' && values.name != null && values.name != undefined) {
        //let mysort = {_id:-1}
        var PreviousProducts = await Products.findOne().sort('-id').lean().exec();
        let id = 1;
        if (PreviousProducts && PreviousProducts.hasOwnProperty('id')) {
            id = PreviousProducts.id + 1;
        } else {
            id = id;
        }
        let Data = {
            id: id,
            name: values.name,
            status: 1,
            createdBy: "Admin",
            createdAt: new Date()
        }
        Products(Data).save().then((Result) => {
            res.send({
                success: true,
                code: 200,
                Status: "Product Added Success.",
                Data: {
                    id: Result.id,
                    name: Result.name
                },
                "timestamp": new Date()
            });
        }).catch((err) => {
            console.error('Database Error');
            console.error(err);
            res.send({
                success: false,
                code: 201,
                Status: "Database Error",
                Data: {

                },
                "timestamp": new Date()

            });
        })
    } else {
        res.send({
            success: false,
            code: 201,
            Status: "Product Name is Mandatory.",
            "timestamp": new Date()
        });
    }
    // AddNewProductInAdmin(values).then((Result) => {
    //     res.send(Result);
    // }).catch(err => res.json(err));  
});

//GetProductInAdmin
const GetProductInAdmin = catchAsync(async(req, res) => {
    let values = req.body;
    Products.find(values).lean().exec().then((Result) => {
        if (Result && Result.length > 0) {
            res.send({
                code: 200,
                success: true,
                message: "Products's Retrieved Success.",
                data: Result,
                timestamp: new Date()
            })
        } else {
            res.send({
                code: 201,
                success: false,
                message: "No product's found.",
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

//UpdateProductInAdmin
const UpdateProductInAdmin = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("id") && values.id != '' && values.id != null && values.id != undefined) {
        let query = {
            id: values.id
        }
        values.updatedBy = "Admin"
        let changes = {
            $set: values
        }
        Products.updateOne(query, changes, { upsert: true }).lean().exec().then((UpdateStatus) => {
            res.send({
                code: 200,
                success: true,
                message: "Product updated Success.",
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

//AutoUpgradeUserLevel(UserData, usercurrentmonthpoints);
const AutoUpgradeUserLevel = async(UserData, usercurrentmonthpoints) => {
    return new Promise(async(resolve, reject) => {
        //setImmediate(() => {
        try {
            let allLevels = await Levels.find({ 'status': 0 }).sort('orderBy').lean().exec();
            let levelsArray = {};
            let allPointsArray = [];
            if (allLevels && allLevels.length > 0) {
                for (each in allLevels) {
                    let newJson = {};
                    levelsArray[allLevels[each].min] = allLevels[each].orderBy;
                    allPointsArray.push(allLevels[each].min)
                }
            }
            console.log("User Current Month Points ------>", usercurrentmonthpoints)
            console.log("allPointsArray ------>", allPointsArray)
            let userCurrentLevelorderBY = UserData.Levels[UserData.Levels.length - 1].orderBy;
            let newLevelPoints = "";
            for (each in allPointsArray) {
                if (usercurrentmonthpoints >= allPointsArray[each]) {
                    newLevelPoints = allPointsArray[each];
                    //  break;
                }
                let newOrderBY = levelsArray[newLevelPoints];

                console.log("Current order by---->", userCurrentLevelorderBY);
                console.log("newOrderBY----->", newOrderBY);
                if (newOrderBY && newOrderBY != undefined) {
                    while (userCurrentLevelorderBY < newOrderBY) {
                        let userNextEligibleLevelforUpgrade = await GetLevelInfo({ orderBy: userCurrentLevelorderBY + 1 });
                        console.log({ orderBy: userCurrentLevelorderBY + 1 });
                        console.log("usernexteligible---", userNextEligibleLevelforUpgrade)
                        console.log("user controller", userController)
                        let UpgradeUserLevel = await UpgradeLevelAssociate({ username: UserData.username }, userNextEligibleLevelforUpgrade, UserData);
                        userCurrentLevelorderBY = userCurrentLevelorderBY + 1;
                    }
                    resolve({ success: "Upgrade Succeess" })
                } else {
                    resolve({ success: "Already at Max Level" })
                }
            }
        } catch (error) {
            console.error('Something Error');
            console.error(error);
            reject({
                success: false,
                code: 201,
                Status: "Auto Upgrade Level Error." + error,
                "timestamp": new Date()
            });
        }
        //});
    });
}

const GetLevelInfo = (values) => {
    console.log("Get level infor----", values);
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                let query = values;
                Levels.findOne(query).lean().exec().then((Result) => {
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

const SendNotificationInAssociate = async(values) => {
    console.log("Send notification in associate----", values)
    try {
        if (values.username && values.notificationbody && values.notificationtitle) {
            let UserData = await CheckWheatherUserExistsAdmin(values);
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

const billing1 = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("AssociateUsername") && values.AssociateUsername != '' && values.AssociateUsername != null && values.AssociateUsername != undefined &&
        values.hasOwnProperty("MerchantUsername") && values.MerchantUsername != '' && values.MerchantUsername != null && values.MerchantUsername != undefined &&
        values.hasOwnProperty("TransactionAmount") && values.TransactionAmount != '' && values.TransactionAmount != null && values.TransactionAmount != undefined &&
        values.hasOwnProperty("transactionDate") && values.transactionDate != '' && values.transactionDate != null && values.transactionDate != undefined) {
        let UserData = await CheckWheatherUserExistsAdmin({ "username": values.AssociateUsername });
        let VendorData = await vendorController.CheckWheatherVendorExists({ "username": values.MerchantUsername });
        let transactiondateold = values.transactionDate.split("-");
        values.transactionDate = new Date(transactiondateold[2], transactiondateold[1] - 1, transactiondateold[0]);

        let nowaddedpoints = 0;

        if (VendorData.hasOwnProperty("Membership") && VendorData.Membership.hasOwnProperty("value")) {
            var PreviousTransactions = await Transactions.findOne().sort('-id').lean().exec();
            let id = 1;
            if (PreviousTransactions && PreviousTransactions.hasOwnProperty('id')) {
                id = PreviousTransactions.id + 1;
            } else {
                id = id;
            }
            let TransactionData = {}
            TransactionData.id = id;
            TransactionData.username = values.AssociateUsername;
            TransactionData.vendor = values.MerchantUsername;
            TransactionData.utrnumber = "null";
            TransactionData.point = values.TransactionAmount / VendorData.Membership.value;
            nowaddedpoints = TransactionData.point;
            TransactionData.amount = values.TransactionAmount;
            TransactionData.status = 0
            TransactionData.createdAt = new Date();
            TransactionData.transactionDate = values.transactionDate;
            if (values.hasOwnProperty("category") && values.category != '' && values.category != null && values.category != undefined) {
                TransactionData.category = values.category;
            } else {
                TransactionData.category = 0;
            }
            if (values.hasOwnProperty("utrnumber")) {
                TransactionData.utrnumber = values.utrnumber;
            }
            let SaveTransactionsData = await Transactions(TransactionData).save();

            let checkparentid = await CheckParentId(values);

            if (checkparentid && checkparentid == true) {
                let PreviousPoints = await Points.findOne().sort('-id').lean().exec();
                let id = 1;
                if (PreviousPoints && PreviousPoints.hasOwnProperty('id')) {
                    id = PreviousPoints.id + 1;
                } else {
                    id = id;
                }
                let PointsData = {}
                PointsData.id = id;
                PointsData.customerUsername = values.AssociateUsername;
                PointsData.vendorUsername = values.MerchantUsername;
                PointsData.points = values.TransactionAmount / VendorData.Membership.value;
                nowaddedpoints = PointsData.points;
                PointsData.amount = values.TransactionAmount;
                PointsData.status = 0
                PointsData.createdAt = new Date();
                PointsData.pointsType = 0; //PayoutTypePoints
                PointsData.transactionDate = values.transactionDate;
                let SavePointsData = await Points(PointsData).save();
                let date = new Date();
                let firstDay = new Date(date.getFullYear(), date.getMonth(), 2);
                let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
                let usercurrentmonthpoints = 0;
                let UserTransactionsOfMonth = await Transactions.find({
                    "username": values.AssociateUsername,
                    "transactionDate": {
                        "$gte": firstDay,
                        "$lt": lastDay
                    }
                }).lean().exec();
                if (UserTransactionsOfMonth.length > 0) {
                    for (each in UserTransactionsOfMonth) {
                        if (UserTransactionsOfMonth[each].hasOwnProperty("point") && UserTransactionsOfMonth[each].point != null && UserTransactionsOfMonth[each].point != undefined) {
                            usercurrentmonthpoints = usercurrentmonthpoints + UserTransactionsOfMonth[each].point;
                        }
                    }
                }

                if (usercurrentmonthpoints > 10) {
                    //also add 50 points this month
                    let PaizattoPreviousPoints = await PaizattoPoints.findOne().sort('-id').lean().exec();
                    let id1 = 1;
                    if (PaizattoPreviousPoints && PaizattoPreviousPoints.hasOwnProperty('id')) {
                        id1 = PaizattoPreviousPoints.id + 1;
                    } else {
                        id1 = id1;
                    }
                    let PaizattoPointsData = {}
                    PaizattoPointsData.id = id1;
                    PaizattoPointsData.customerUsername = values.AssociateUsername;
                    PaizattoPointsData.vendorUsername = "OL00000001";
                    //PointsData.utrnumber = "null";
                    PaizattoPointsData.points = 100;
                    PaizattoPointsData.amount = 0;
                    PaizattoPointsData.status = 0
                    PaizattoPointsData.createdAt = new Date();
                    PaizattoPointsData.pointsType = 2; //PayoutTypePoints
                    PaizattoPointsData.transactionDate = new Date();
                    let SavePaizattoPointsData = await PaizattoPoints(PaizattoPointsData).save();


                    let associatedownlinequery = {
                        username: values.AssociateUsername
                    }
                    let associatechanges = {
                        $set: {
                            isActive: true
                        }
                    }
                    let ActiveAssociateDownline = await Associate.updateOne(associatedownlinequery, associatechanges, { upsert: true }).lean().exec();
                }

                let userCurrentLevelPoints = UserData.Levels[UserData.Levels.length - 1].min;
                if (userCurrentLevelPoints && usercurrentmonthpoints > userCurrentLevelPoints) {
                    let userLevelAutoUpgrade = await AutoUpgradeUserLevel(UserData, usercurrentmonthpoints);

                }
                let templateid = AllConstants.SMSTemplateIds.VendorPaymentConfirmation;
                let senderid = AllConstants.SenderId.VendorPaymentConfirmation;
                let content = AllConstants.SMSContent.VendorPaymentConfirmation;
                content = content.replace("{#var#}", VendorData.firstName)
                content = content.replace("{#var#}", values.TransactionAmount)
                content = content.replace("{#var#}", UserData.firstName)

                content = content.replace("{#var#}", Formatter.toDate(values.transactionDate))
                let number = VendorData.phoneNumber
                let message = "";
                let sendSMS = await vendorController.SendSMSInVendor(templateid, senderid, content, number, message);
                let templateidAssociate = AllConstants.SMSTemplateIds.AssociateBillingConfirmation;
                let senderidAssociate = AllConstants.SenderId.AssociateBillingConfirmation;
                let contentAssociate = AllConstants.SMSContent.AssociateBillingConfirmation;
                contentAssociate = contentAssociate.replace("{#var#}", UserData.firstName)
                contentAssociate = contentAssociate.replace("{#var#}", values.TransactionAmount)
                contentAssociate = contentAssociate.replace("{#var#}", PointsData.points)
                let numberAssociate = UserData.phoneNumber;
                let messageAssociate = "";
                let associateBillingSMS = await SendSMSInAssociate(templateidAssociate, senderidAssociate, contentAssociate, numberAssociate, messageAssociate);

                //SendAssociateBillingSMS
                //ASSOCIATE NOTIFICATION
                //VENDOR NOTIFICATION
                let Associatenotificationbody = "Hi,Billing of Rs: " + values.TransactionAmount + " is completed, " + nowaddedpoints + " points has been added to your Paizatto account"
                let Associatenotificationtitle = "Billing of Rs: " + values.TransactionAmount + " is completed";
                let Vendornotificationbody = "Dear " + VendorData.firstName + ", Payment confirmation of Rs: " + values.TransactionAmount + " done by " + UserData.firstName + " on " + values.transactionDate + ". Payment will be processed shortly."
                let Vendornotificationtitle = "Payment confirmation of Rs: " + values.TransactionAmount + " done by " + UserData.firstName
                let sendVendorNotification = await vendorController.SendNotificationInVendor({ username: VendorData.username, notificationbody: Vendornotificationbody, notificationtitle: Vendornotificationtitle });
                let sendAssociateNotification = await SendNotificationInAssociate({ username: UserData.username, notificationbody: Associatenotificationbody, notificationtitle: Associatenotificationtitle });

                res.send({
                    code: 200,
                    success: true,
                    message: "Points Added Success, No Parent Id.",
                    timestamp: new Date()
                });
            } else if (checkparentid == false) {
                let date = new Date();
                let firstDay = new Date(date.getFullYear(), date.getMonth(), 2);
                let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
                let usercurrentmonthpoints = 0;
                let UserTransactionsOfMonth = await Transactions.find({
                    "username": values.AssociateUsername,
                    "transactionDate": {
                        "$gte": firstDay,
                        "$lt": lastDay
                    }
                }).lean().exec();
                if (UserTransactionsOfMonth.length > 0) {
                    for (each in UserTransactionsOfMonth) {
                        if (UserTransactionsOfMonth[each].hasOwnProperty("point") && UserTransactionsOfMonth[each].point != null && UserTransactionsOfMonth[each].point != undefined) {
                            usercurrentmonthpoints = usercurrentmonthpoints + UserTransactionsOfMonth[each].point;
                        }
                    }
                }


                let userCurrentLevelPoints = UserData.Levels[UserData.Levels.length - 1].min;
                if (userCurrentLevelPoints && usercurrentmonthpoints > userCurrentLevelPoints) {
                    let userLevelAutoUpgrade = await AutoUpgradeUserLevel(UserData, usercurrentmonthpoints);

                }

                if (usercurrentmonthpoints >= 10) {

                    //50 points this month and 25 points for referral
                    let PaizattoPreviousPoints = await PaizattoPoints.findOne().sort('-id').lean().exec();
                    let id1 = 1;
                    if (PaizattoPreviousPoints && PaizattoPreviousPoints.hasOwnProperty('id')) {
                        id1 = PaizattoPreviousPoints.id + 1;
                    } else {
                        id1 = id1;
                    }
                    let PaizattoPointsData = {}
                    PaizattoPointsData.id = id1;
                    PaizattoPointsData.customerUsername = values.AssociateUsername;
                    PaizattoPointsData.vendorUsername = "OL00000001";
                    //PointsData.utrnumber = "null";
                    PaizattoPointsData.points = 100;
                    PaizattoPointsData.amount = 0;
                    PaizattoPointsData.status = 0
                    PaizattoPointsData.createdAt = new Date();
                    PaizattoPointsData.pointsType = 2; //PayoutTypePoints
                    PaizattoPointsData.transactionDate = new Date();
                    let SavePaizattoPointsData = await PaizattoPoints(PaizattoPointsData).save();
                    if (UserData.hasOwnProperty("referrer") && UserData.referrer.hasOwnProperty("referralid") && UserData.referrer.referralid != '' && UserData.referrer.referralid != null && UserData.referrer.referralid != undefined) {
                        let PreviousPaizattoPoints = await PaizattoPoints.findOne().sort('-id').lean().exec();
                        let id2 = 1;
                        if (PreviousPaizattoPoints && PreviousPaizattoPoints.hasOwnProperty('id')) {
                            id2 = PreviousPaizattoPoints.id + 1;
                        } else {
                            id2 = id2;
                        }
                        let PaizattoPointsData1 = {}
                        PaizattoPointsData1.id = id2;
                        PaizattoPointsData1.customerUsername = UserData.referrer.referralid;
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

                    let PreviousPoints = await Points.findOne().sort('-id').lean().exec();
                    let id = 1;
                    if (PreviousPoints && PreviousPoints.hasOwnProperty('id')) {
                        id = PreviousPoints.id + 1;
                    } else {
                        id = id;
                    }
                    let PointsData = {}
                    PointsData.id = id;
                    PointsData.customerUsername = values.AssociateUsername;
                    PointsData.vendorUsername = values.MerchantUsername;

                    PointsData.points = values.TransactionAmount / VendorData.Membership.value;
                    PointsData.amount = values.TransactionAmount;
                    PointsData.status = 0
                    PointsData.createdAt = new Date();
                    PointsData.pointsType = 0; //PayoutTypePoints
                    PointsData.transactionDate = values.transactionDate;
                    let SavePointsData = await Points(PointsData).save();
                    let ParentUsername = "";
                    let FinalParentUsername = "";


                    let associatedownlinequery = {
                        username: values.AssociateUsername
                    }
                    let associatechanges = {
                        $set: {
                            isActive: true
                        }
                    }
                    let ActiveAssociateDownline = await Associate.updateOne(associatedownlinequery, associatechanges, { upsert: true }).lean().exec();

                    // //Add Self Points Current Month
                    // PointsData.points = 50;
                    // PointsData.amount = 0;
                    // PointsData.pointsType = 2;
                    // let saveSelfPointsCurrentMonth =  await Points(PointsData).save();
                    // console.log("saveSelfPointsCurrentMonth--------------->",saveSelfPointsCurrentMonth);
                    // //Add Self Points Next Month
                    // PointsData.transactionDate.setMonth(PointsData.transactionDate.getMonth() + 1);
                    // let saveSelfPointsNexMonth =  await Points(PointsData).save();
                    // console.log("saveSelfPointsNexMonth--------------->",saveSelfPointsNexMonth)

                    if (UserData.hasOwnProperty("referrer") && UserData.referrer.hasOwnProperty("referralid")) {
                        ParentUsername = UserData.referrer.referralid;
                    }
                    //console.log("Parent Username at this logic------>",UserData.referrer);
                    let checkparentid = await CheckParentId({ AssociateUsername: ParentUsername });
                    //console.log("checkparentid---------->",checkparentid);
                    if (checkparentid == true) {
                        FinalParentUsername = ParentUsername;
                    } else {
                        FinalParentUsername = "OL00000001"
                    }
                    //console.log("FinalParentUsername------>",FinalParentUsername);
                    let addnewchild = await addChild({ "parentUserName": FinalParentUsername, "childUserName": values.AssociateUsername })
                    let templateid = AllConstants.SMSTemplateIds.VendorPaymentConfirmation;
                    let senderid = AllConstants.SenderId.VendorPaymentConfirmation;
                    let content = AllConstants.SMSContent.VendorPaymentConfirmation;
                    content = content.replace("{#var#}", VendorData.firstName)
                    content = content.replace("{#var#}", values.TransactionAmount)
                    content = content.replace("{#var#}", UserData.firstName)
                    content = content.replace("{#var#}", Formatter.toDate(values.transactionDate))
                    let number = VendorData.phoneNumber
                    let message = "";
                    let sendSMS = await vendorController.SendSMSInVendor(templateid, senderid, content, number, message);
                    let templateidAssociate = AllConstants.SMSTemplateIds.AssociateBillingConfirmation;
                    let senderidAssociate = AllConstants.SenderId.AssociateBillingConfirmation;
                    let contentAssociate = AllConstants.SMSContent.AssociateBillingConfirmation;
                    contentAssociate = contentAssociate.replace("{#var#}", UserData.firstName)
                    contentAssociate = contentAssociate.replace("{#var#}", values.TransactionAmount)
                    contentAssociate = contentAssociate.replace("{#var#}", PointsData.points)
                    let numberAssociate = UserData.phoneNumber;
                    let messageAssociate = "";
                    let associateBillingSMS = await SendSMSInAssociate(templateidAssociate, senderidAssociate, contentAssociate, numberAssociate, messageAssociate);

                    //SendAssociateBillingSMS
                    //ASSOCIATE NOTIFICATION
                    //VENDOR NOTIFICATION
                    let Associatenotificationbody = "Hi,Billing of Rs: " + values.TransactionAmount + " is completed, " + nowaddedpoints + " points has been added to your Paizatto account"
                    let Associatenotificationtitle = "Billing of Rs: " + values.TransactionAmount + " is completed";
                    let Vendornotificationbody = "Dear " + VendorData.firstName + ", Payment confirmation of Rs: " + values.TransactionAmount + " done by " + UserData.firstName + " on " + values.transactionDate + ". Payment will be processed shortly."
                    let Vendornotificationtitle = "Payment confirmation of Rs: " + values.TransactionAmount + " done by " + UserData.firstName
                    let sendVendorNotification = await vendorController.SendNotificationInVendor({ username: VendorData.username, notificationbody: Vendornotificationbody, notificationtitle: Vendornotificationtitle });
                    let sendAssociateNotification = await SendNotificationInAssociate({ username: UserData.username, notificationbody: Associatenotificationbody, notificationtitle: Associatenotificationtitle });

                    res.send({
                        code: 200,
                        success: true,
                        message: "Points Added and Placed In Network Success.",
                        timestamp: new Date()
                    });
                } else {
                    let PreviousPoints = await Points.findOne().sort('-id').lean().exec();
                    let id = 1;
                    if (PreviousPoints && PreviousPoints.hasOwnProperty('id')) {
                        id = PreviousPoints.id + 1;
                    } else {
                        id = id;
                    }
                    let PointsData = {}
                    PointsData.id = id;
                    PointsData.customerUsername = values.AssociateUsername;
                    PointsData.vendorUsername = values.MerchantUsername;
                    //PointsData.utrnumber = "null";
                    PointsData.points = values.TransactionAmount / VendorData.Membership.value;
                    PointsData.amount = values.TransactionAmount;
                    PointsData.status = 0
                    PointsData.createdAt = new Date();
                    PointsData.transactionDate = values.transactionDate;
                    let SavePointsData = await Points(PointsData).save();
                    let templateid = AllConstants.SMSTemplateIds.VendorPaymentConfirmation;
                    let senderid = AllConstants.SenderId.VendorPaymentConfirmation;
                    let content = AllConstants.SMSContent.VendorPaymentConfirmation;
                    content = content.replace("{#var#}", VendorData.firstName)
                    content = content.replace("{#var#}", values.TransactionAmount)
                    content = content.replace("{#var#}", UserData.firstName)
                    content = content.replace("{#var#}", Formatter.toDate(values.transactionDate))
                    let number = VendorData.phoneNumber
                    let message = "";
                    let sendSMS = await vendorController.SendSMSInVendor(templateid, senderid, content, number, message);
                    let templateidAssociate = AllConstants.SMSTemplateIds.AssociateBillingConfirmation;
                    let senderidAssociate = AllConstants.SenderId.AssociateBillingConfirmation;
                    let contentAssociate = AllConstants.SMSContent.AssociateBillingConfirmation;
                    contentAssociate = contentAssociate.replace("{#var#}", UserData.firstName)
                    contentAssociate = contentAssociate.replace("{#var#}", values.TransactionAmount)
                    contentAssociate = contentAssociate.replace("{#var#}", PointsData.points)
                    let numberAssociate = UserData.phoneNumber;
                    let messageAssociate = "";
                    let associateBillingSMS = await SendSMSInAssociate(templateidAssociate, senderidAssociate, contentAssociate, numberAssociate, messageAssociate);

                    //SendAssociateBillingSMS
                    //ASSOCIATE NOTIFICATION
                    //VENDOR NOTIFICATION\
                    let Associatenotificationbody = "Hi,Billing of Rs: " + values.TransactionAmount + " is completed, " + nowaddedpoints + " points has been added to your Paizatto account"
                    let Associatenotificationtitle = "Billing of Rs: " + values.TransactionAmount + " is completed";
                    let Vendornotificationbody = "Dear " + VendorData.firstName + ", Payment confirmation of Rs: " + values.TransactionAmount + " done by " + UserData.firstName + " on " + values.transactionDate + ". Payment will be processed shortly."
                    let Vendornotificationtitle = "Payment confirmation of Rs: " + values.TransactionAmount + " done by " + UserData.firstName
                    let sendVendorNotification = await vendorController.SendNotificationInVendor({ username: VendorData.username, notificationbody: Vendornotificationbody, notificationtitle: Vendornotificationtitle });
                    let sendAssociateNotification = await SendNotificationInAssociate({ username: UserData.username, notificationbody: Associatenotificationbody, notificationtitle: Associatenotificationtitle });

                    res.send({
                        code: 200,
                        success: true,
                        message: "Points Added Success.",
                        timestamp: new Date()
                    })
                }
            } else {
                res.send({
                    code: 201,
                    success: false,
                    message: "User parent retrieval error.",
                    timestamp: new Date()
                })
            }
        } else {
            res.send({
                code: 201,
                success: false,
                message: "Invalid Memebership of Vendor.",
                timestamp: new Date()
            });
        }
    } else {
        res.send({
            code: 201,
            success: false,
            message: "All fields are mandatory.",
            timestamp: new Date()
        });
    }
});

//AssociateReport
const AssociateReport = catchAsync(async(req, res) => {
    let values = req.body;
    let query = {};
    if (values.hasOwnProperty("username")) {
        query.username = values.username;
    }
    if (values.hasOwnProperty("city")) {
        query["Address.city"] = values.city;
    }
    if (values.hasOwnProperty("state")) {
        query["Address.state"] = values.state;
    }
    if (values.hasOwnProperty("phoneNumber")) {
        query.phoneNumber = values.phoneNumber;
    }
    let AllAssociateData = await Associate.find(query, {
        _id: 0,
        username: 1,
        AssociateName: { $concat: ["$firstName", " ", "$lastName"] },
        phoneNumber: 1,
        pincode: "$Address.pincode",
        city: "$Address.city",
        state: "$Address.state",
        status: "$parentId",
        AssociatePackageLevel: { $last: "$Levels.name" }
    }).lean().exec();
    // let LadderData = await userController.GetLadderInformationCount({username:'OL00000001'});
    if (AllAssociateData.length > 0) {
        for (each in AllAssociateData) {
            if (AllAssociateData[each].status && AllAssociateData[each].status != '') {
                AllAssociateData[each].status = "Network";
            } else {
                AllAssociateData[each].status = "New User";
            }
        }
        let NewResult = [];
        if (values.hasOwnProperty("status")) {
            for (each in AllAssociateData) {
                if (AllAssociateData[each].status == values.status) {
                    NewResult.push(AllAssociateData[each])
                }
            }
        } else {
            NewResult = AllAssociateData;
        }
        let filePath = await ExportAssociateReportsDataExcel(NewResult);
        var fullPublicUrl = 'http://paizattoapi.paizatto.com/';
        let downloadurl = `${fullPublicUrl}${filePath}`
        res.send({
            code: 200,
            success: true,
            message: NewResult,
            downloadurl: downloadurl,
            timestamp: new Date()
        });
    } else {
        res.send({
            code: 201,
            success: false,
            message: "No Data Found.",
            timestamp: new Date()
        });
    }
});

var ExportAssociateReportsDataExcel = async(data) => {
    console.log(data[0])
    try {
        const ALL_DOWNLINE_REPORT_FILES_PATH = path.resolve('public', 'export', 'associatereport_data');
        if (!fs.existsSync(ALL_DOWNLINE_REPORT_FILES_PATH)) {
            fs.mkdirSync(ALL_DOWNLINE_REPORT_FILES_PATH, { recursive: true });
        }
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("associatereport_data");
        worksheet.columns = [
            { header: "Associate User Name", key: "username", width: 25 },
            { header: "Mobile Number", key: "phoneNumber", width: 25 },
            { header: "Associate Name", key: "AssociateName", width: 25 },
            { header: "Pincode", key: "pincode", width: 25 },
            { header: "City", key: "city", width: 25 },
            { header: "State", key: "state", width: 25 },
            { header: "Status", key: "status", width: 25 },
            { header: "Associate Package Level", key: "AssociatePackageLevel", width: 25 },
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
        let fileName = `associatereport_data_${filedate}.xlsx`;
        await workbook.xlsx.writeFile(path.resolve(ALL_DOWNLINE_REPORT_FILES_PATH, fileName));
        return `export/associatereport_data/${fileName}`;
    } catch (err) {
        console.log('Error while generating Sales Summary Report', err);
    }

}

const _ = require("lodash");
const { DataPipeline } = require('aws-sdk');

const AssociateActiveInactiveReport = catchAsync(async(req, res) => {
    let values = req.body;
    let query = {};
    if (values.hasOwnProperty("username")) {
        query.username = values.username
    }
    let AllAssociateData = await Associate.find(query, {
        _id: 0,
        username: 1,
        AssociateName: { $concat: ["$firstName", " ", "$lastName"] },
        phoneNumber: 1,
        pincode: "$Address.pincode",
        city: "$Address.city",
        // state:"$Address.state",
        // status:1,
        parentId: 1,
        AssociatePackageLevel: { $last: "$Levels" }
    }).lean().exec();

    if (AllAssociateData.length > 0) {
        for (each in AllAssociateData) {
            if (AllAssociateData[each].hasOwnProperty("username")) {
                let UserTransactions = await Transactions.find({ username: AllAssociateData[each].username });
                const filteredArray = UserTransactions.filter((t) => {
                    return new Date(t.transactionDate).getMonth() === new Date().getMonth()
                })
                let minValue = 0;
                if (AllAssociateData[each].hasOwnProperty("AssociatePackageLevel")) {
                    minValue = AllAssociateData[each].AssociatePackageLevel.min;
                }
                if (filteredArray.length > 0) {
                    let sum = filteredArray.reduce((prev, next) => {
                        return { point: prev.point + next.point }
                    });
                    if (sum.point >= minValue) {
                        AllAssociateData[each].status = "Active"
                    } else {
                        AllAssociateData[each].status = "Inactive"
                    }
                } else {
                    AllAssociateData[each].status = "Inactive"
                }

                if (AllAssociateData[each].hasOwnProperty("parentId") && AllAssociateData[each].parentId != '' && AllAssociateData[each].parentId != null && AllAssociateData[each].parentId != undefined) {
                    AllAssociateData[each].inNetwork = true
                } else {
                    AllAssociateData[each].inNetwork = false
                }

                delete AllAssociateData[each].AssociatePackageLevel;
            }
        }
    }

    let newData = [];
    if (values.hasOwnProperty("status")) {
        for (each in AllAssociateData) {
            if (AllAssociateData[each].status == values.status) {
                newData.push(AllAssociateData[each]);
            }
        }
    } else {
        newData = AllAssociateData;
    }
    let filePath = await ExportActiveinactiveReportsDataExcel(newData);
    var fullPublicUrl = 'http://paizattoapi.paizatto.com/';
    let downloadurl = `${fullPublicUrl}${filePath}`
    if (newData.length > 0) {
        res.send({
            code: 200,
            success: true,
            message: newData,
            downloadurl: downloadurl,
            timestamp: new Date()
        });
    } else {
        res.send({
            code: 201,
            success: false,
            message: "No Data Found.",
            timestamp: new Date()
        });
    }
});

var ExportActiveinactiveReportsDataExcel = async(data) => {
    console.log(data[0])
    try {
        const ALL_DOWNLINE_REPORT_FILES_PATH = path.resolve('public', 'export', 'activereport_data');
        if (!fs.existsSync(ALL_DOWNLINE_REPORT_FILES_PATH)) {
            fs.mkdirSync(ALL_DOWNLINE_REPORT_FILES_PATH, { recursive: true });
        }
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("activereport_data");
        worksheet.columns = [
            { header: "Associate User Name", key: "username", width: 25 },
            { header: "Mobile Number", key: "phoneNumber", width: 25 },
            { header: "Associate Name", key: "AssociateName", width: 25 },
            { header: "Pincode", key: "pincode", width: 25 },
            { header: "City", key: "city", width: 25 },
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
        let fileName = `activereport_data${filedate}.xlsx`;
        await workbook.xlsx.writeFile(path.resolve(ALL_DOWNLINE_REPORT_FILES_PATH, fileName));
        return `export/activereport_data/${fileName}`;
    } catch (err) {
        console.log('Error while generating Sales Summary Report', err);
    }

}

const AssociateBlankBankDetailsReport = catchAsync(async(req, res) => {
    let values = req.body;
    let query = {};
    if (values.hasOwnProperty("username")) {
        query.username = values.username;
    }
    if (values.hasOwnProperty("phoneNumber")) {
        query.phoneNumber = values.phoneNumber;
    }
    query.isBank = false;
    let AllAssociateData = await Associate.find(query, {
        _id: 0,
        username: 1,
        AssociateName: { $concat: ["$firstName", " ", "$lastName"] },
        phoneNumber: 1,
        pincode: "$Address.pincode",
        city: "$Address.city",
        status: "$parentId",
    }).lean().exec();
    if (AllAssociateData.length > 0) {
        for (each in AllAssociateData) {
            if (AllAssociateData[each].status && AllAssociateData[each].status != '') {
                AllAssociateData[each].status = "Network";
            } else {
                AllAssociateData[each].status = "New User";
            }
        }
        let NewResult = [];
        if (values.hasOwnProperty("status")) {
            for (each in AllAssociateData) {
                if (AllAssociateData[each].status == values.status) {
                    NewResult.push(AllAssociateData[each])
                }
            }
        } else {
            NewResult = AllAssociateData;
        }
        let filePath = await ExportBankDetailsReportsDataExcel(NewResult);
        var fullPublicUrl = 'http://paizattoapi.paizatto.com/';
        let downloadurl = `${fullPublicUrl}${filePath}`
        res.send({
            code: 200,
            success: true,
            message: NewResult,
            downloadurl: downloadurl,
            timestamp: new Date()
        });
    } else {
        res.send({
            code: 201,
            success: false,
            message: "No Data Found.",
            timestamp: new Date()
        });
    }
});

var ExportBankDetailsReportsDataExcel = async(data) => {
    console.log(data[0])
    try {
        const ALL_DOWNLINE_REPORT_FILES_PATH = path.resolve('public', 'export', 'bankdetailsreport_data');
        if (!fs.existsSync(ALL_DOWNLINE_REPORT_FILES_PATH)) {
            fs.mkdirSync(ALL_DOWNLINE_REPORT_FILES_PATH, { recursive: true });
        }
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("bankdetailsreport_data");
        worksheet.columns = [
            { header: "Associate User Name", key: "username", width: 25 },
            { header: "Mobile Number", key: "phoneNumber", width: 25 },
            { header: "Associate Name", key: "AssociateName", width: 25 },
            { header: "Pincode", key: "pincode", width: 25 },
            { header: "City", key: "city", width: 25 },
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
        let fileName = `bankdetailsreport_data${filedate}.xlsx`;
        await workbook.xlsx.writeFile(path.resolve(ALL_DOWNLINE_REPORT_FILES_PATH, fileName));
        return `export/bankdetailsreport_data/${fileName}`;
    } catch (err) {
        console.log('Error while generating Sales Summary Report', err);
    }

}

const SendVendorAppLink = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("username") || values.hasOwnProperty("phoneNumber")) {
        try {
            let VendorData = await vendorController.CheckWheatherVendorExists(values);
            let templateid = AllConstants.SMSTemplateIds.VendorAppLink;
            let senderid = AllConstants.SenderId.VendorAppLink;
            let content = AllConstants.SMSContent.VendorAppLink;
            content = content.replace("{#var#}", AllConstants.Links.vendorapplink)
            let number = VendorData.phoneNumber;
            let message = "";

            vendorController.SendSMSInVendor(templateid, senderid, content, number, message).then((Result) => {
                res.send({
                    code: 200,
                    success: true,
                    status: "App Link sent successful on " + VendorData.phoneNumber,
                    data: Result,
                    timestamp: new Date()
                });
            }).catch((err) => {
                console.error('Database Error');
                console.error(err);
                res.send({
                    code: 201,
                    success: false,
                    status: "Error sending app link",
                    data: err,
                    timestamp: new Date()
                });
            });
        } catch (err) {
            console.log(err)
            res.send({
                code: 201,
                success: false,
                status: "Error retrieving vendor data.",
                data: err,
                timestamp: new Date()
            })
        }
    } else {
        res.send({
            code: 201,
            success: false,
            status: "Phone Number or Username is mandatory.",
            timestamp: new Date()
        });
    }
});

const SendAssociateAppLink = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("username") || values.hasOwnProperty("phoneNumber")) {
        try {
            let VendorData = await userController.CheckWheatherUserExists(values);
            let templateid = AllConstants.SMSTemplateIds.AssociateAppLink;
            let senderid = AllConstants.SenderId.AssociateAppLink;
            let content = AllConstants.SMSContent.AssociateAppLink;
            content = content.replace("{#var#}", AllConstants.Links.associateapplink)
            let number = VendorData.phoneNumber;
            let message = "";

            vendorController.SendSMSInVendor(templateid, senderid, content, number, message).then((Result) => {
                res.send({
                    code: 200,
                    success: true,
                    status: "App Link sent successful on " + VendorData.phoneNumber,
                    data: Result,
                    timestamp: new Date()
                });
            }).catch((err) => {
                console.error('Database Error');
                console.error(err);
                res.send({
                    code: 201,
                    success: false,
                    status: "Error sending app link",
                    data: err,
                    timestamp: new Date()
                });
            });
        } catch (err) {
            console.log(err)
            res.send({
                code: 201,
                success: false,
                status: "Error retrieving associate data.",
                data: err,
                timestamp: new Date()
            })
        }
    } else {
        res.send({
            code: 201,
            success: false,
            status: "Phone Number or Username is mandatory.",
            timestamp: new Date()
        });
    }
});

const VendorBankUpdateSMS = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("username") || values.hasOwnProperty("phoneNumber")) {
        try {
            let VendorData = await vendorController.CheckWheatherVendorExists(values);
            let templateid = AllConstants.SMSTemplateIds.VendorBankUpdate;
            let senderid = AllConstants.SenderId.VendorBankUpdate;
            let content = AllConstants.SMSContent.VendorBankUpdate;
            content = content.replace("{#var#}", AllConstants.Links.vendorapplink)
            let number = VendorData.phoneNumber;
            let message = "";

            vendorController.SendSMSInVendor(templateid, senderid, content, number, message).then((Result) => {
                res.send({
                    code: 200,
                    success: true,
                    status: "App Link sent successful on " + VendorData.phoneNumber,
                    data: Result,
                    timestamp: new Date()
                });
            }).catch((err) => {
                console.error('Database Error');
                console.error(err);
                res.send({
                    code: 201,
                    success: false,
                    status: "Error sending app link",
                    data: err,
                    timestamp: new Date()
                });
            });
        } catch (err) {
            console.log(err)
            res.send({
                code: 201,
                success: false,
                status: "Error retrieving vendor data.",
                data: err,
                timestamp: new Date()
            })
        }
    } else {
        res.send({
            code: 201,
            success: false,
            status: "Phone Number or Username is mandatory.",
            timestamp: new Date()
        });
    }
});

const AssociateBankUpdateSMS = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("username") || values.hasOwnProperty("phoneNumber")) {
        try {
            let VendorData = await userController.CheckWheatherUserExists(values);
            let templateid = AllConstants.SMSTemplateIds.AssociateBankUpdate;
            let senderid = AllConstants.SenderId.AssociateBankUpdate;
            let content = AllConstants.SMSContent.AssociateBankUpdate;
            content = content.replace("{#var#}", AllConstants.Links.associateapplink)
            let number = VendorData.phoneNumber;
            let message = "";

            vendorController.SendSMSInVendor(templateid, senderid, content, number, message).then((Result) => {
                res.send({
                    code: 200,
                    success: true,
                    status: "App Link sent successful on " + VendorData.phoneNumber,
                    data: Result,
                    timestamp: new Date()
                });
            }).catch((err) => {
                console.error('Database Error');
                console.error(err);
                res.send({
                    code: 201,
                    success: false,
                    status: "Error sending app link",
                    data: err,
                    timestamp: new Date()
                });
            });
        } catch (err) {
            console.log(err)
            res.send({
                code: 201,
                success: false,
                status: "Error retrieving associate data.",
                data: err,
                timestamp: new Date()
            })
        }
    } else {
        res.send({
            code: 201,
            success: false,
            status: "Phone Number or Username is mandatory.",
            timestamp: new Date()
        });
    }
});

const AddUserInAdmin = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.firstName != '' && values.firstName != null && values.firstName != undefined &&
        values.lastName != '' && values.lastName != null && values.lastName != undefined &&
        values.phoneNumber != '' && values.phoneNumber != null && values.phoneNumber != undefined &&
        values.rolename != '' && values.rolename != null && values.rolename != undefined &&
        values.password != '' && values.password != null && values.password != undefined &&
        values.roleid != '' && values.roleid != null && values.roleid != undefined
    ) {
        console.log("Values----->", values)
        var CheckPhoneNumber = await User.find({ "phoneNumber": values.phoneNumber }).lean().exec();
        //var CheckUsername = await User.find({"username":values.username}).lean().exec();  
        if (CheckPhoneNumber.length > 0) {
            res.send({
                success: false,
                code: 201,
                Status: "User Name or PhoneNumber exists already.",
                "timestamp": new Date()
            });
        } else {
            var PreviousUsers = await User.findOne().sort('-id').lean().exec();
            let id = 1;
            if (PreviousUsers && PreviousUsers.hasOwnProperty('id')) {
                id = PreviousUsers.id + 1;
            } else {
                id = id;
            }
            let Data = {
                id: id,
                firstName: values.firstName,
                phoneNumber: values.phoneNumber,
                lastName: values.lastName,
                password: values.password,
                roleid: values.roleid,
                rolename: values.rolename,
                status: 0,
                createdBy: "Admin",
                createdAt: new Date()
            }
            if (values.employee) {
                Data.employee = values.employee
            }
            User(Data).save().then((Result) => {
                res.send({
                    success: true,
                    code: 200,
                    Status: "User Added Success.",
                    Data: {
                        id: Result.id,
                        phoneNumber: Result.phoneNumber,
                        firstName: Result.firstName,
                        lastName: Result.lastName,
                    },
                    "timestamp": new Date()
                });
            }).catch((err) => {
                console.error('Database Error');
                console.error(err);
                res.send({
                    success: false,
                    code: 201,
                    Status: "Database Error",
                    Data: err,
                    "timestamp": new Date()

                });
            })
        }
    } else {
        res.send({
            success: false,
            code: 201,
            Status: "All fields are Mandatory.",
            "timestamp": new Date()
        });
    }
});


const GetUsersInAdmin = catchAsync(async(req, res) => {
    let values = req.body;
    User.find(values).lean().exec().then((Result) => {
        if (Result && Result.length > 0) {
            res.send({
                code: 200,
                success: true,
                message: "User's Retrieved Success.",
                data: Result,
                timestamp: new Date()
            })
        } else {
            res.send({
                code: 201,
                success: false,
                message: "No user's found.",
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


const UpdateUserInAdmin = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("id") && values.id != '' && values.id != null && values.id != undefined) {
        let query = {
            id: values.id
        }
        values.updatedBy = "Admin"
        let changes = {
            $set: values
        }
        User.updateOne(query, changes, { upsert: true }).lean().exec().then((UpdateStatus) => {
            res.send({
                code: 200,
                success: true,
                message: "User updated Success.",
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
            message: "Id required to update users.",
            data: {},
            timestamp: new Date()
        });
    }
});
//ActiveInactiveUserInAdmin
const ActiveInactiveUserInAdmin = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("id") && values.id != '' && values.id != null && values.id != undefined) {
        let query = {
            id: values.id
        }
        var checkuserexists = await User.findOne(query).lean().exec();
        console.log(checkuserexists)
        console.log(checkuserexists.hasOwnProperty("status"))
        console.log(checkuserexists.status != '')
        console.log(checkuserexists.status != null)
        console.log(checkuserexists.status != undefined)
        if (checkuserexists) {
            let newValues = {}
            let responseMessage = "User active inactive Success."
            if (checkuserexists.status == 0) {
                newValues.status = 1;
                responseMessage = "User Inactivated Success.";
            }
            if (checkuserexists.status == 1) {
                newValues.status = 0;
                responseMessage = "User Activated Success.";
            }
            newValues.updatedBy = "Admin"
            let changes = {
                $set: newValues
            }
            await User.updateOne(query, changes, { upsert: true }).lean().exec().then((UpdateStatus) => {
                res.send({
                    code: 200,
                    success: true,
                    message: responseMessage,
                    timestamp: new Date()
                })
            }).catch((err) => {
                console.log(err)
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
                message: "Invalid User Id.",
                timestamp: new Date()
            });
        }
    } else {
        res.send({
            code: 201,
            success: false,
            message: "Id required to active/inactive users.",
            data: {},
            timestamp: new Date()
        });
    }
});

const AddMenuInAdmin = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.name != '' && values.name != null && values.name != undefined) {
        var CheckMenuExists = await Menu.find({ "name": values.name }).lean().exec();
        if (CheckMenuExists.length > 0) {
            res.send({
                success: false,
                code: 201,
                Status: "Menu exists already.",
                "timestamp": new Date()
            });
        } else {
            var PreviousMenus = await Menu.findOne().sort('-id').lean().exec();
            let id = 1;
            if (PreviousMenus && PreviousMenus.hasOwnProperty('id')) {
                id = PreviousMenus.id + 1;
            } else {
                id = id;
            }
            let Data = {
                id: id,
                name: values.name,
                status: 0,
                createdBy: "Admin",
                createdAt: new Date()
            }
            Menu(Data).save().then((Result) => {
                res.send({
                    success: true,
                    code: 200,
                    Status: "Menu Added Success.",
                    Data: {
                        id: Result.id,
                        name: Result.name
                    },
                    "timestamp": new Date()
                });
            }).catch((err) => {
                console.error('Database Error');
                console.error(err);
                res.send({
                    success: false,
                    code: 201,
                    Status: "Database Error",
                    Data: err,
                    "timestamp": new Date()

                });
            })
        }
    } else {
        res.send({
            success: false,
            code: 201,
            Status: "Menu Name is Mandatory.",
            "timestamp": new Date()
        });
    }
});

const GetMenuInAdmin = catchAsync(async(req, res) => {
    let values = req.body;
    Menu.find(values).lean().exec().then((Result) => {
        if (Result && Result.length > 0) {
            res.send({
                code: 200,
                success: true,
                message: "Menu's Retrieved Success.",
                data: Result,
                timestamp: new Date()
            })
        } else {
            res.send({
                code: 201,
                success: false,
                message: "No Menu's found.",
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

const UpdateMenuInAdmin = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("id") && values.id != '' && values.id != null && values.id != undefined) {
        let query = {
            id: values.id
        }
        values.updatedBy = "Admin"
        let changes = {
            $set: values
        }
        Menu.updateOne(query, changes, { upsert: true }).lean().exec().then((UpdateStatus) => {
            res.send({
                code: 200,
                success: true,
                message: "Menu updated Success.",
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
            message: "Id required to update Menus.",
            data: {},
            timestamp: new Date()
        });
    }
});
//AddRoleInAdmin
const AddRoleInAdmin = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.name != '' && values.name != null && values.name != undefined) {
        var CheckRoleExists = await Role.find({ "name": values.name }).lean().exec();
        if (CheckRoleExists.length > 0) {
            res.send({
                success: false,
                code: 201,
                Status: "Role exists already.",
                "timestamp": new Date()
            });
        } else {
            var PreviousRoles = await Role.findOne().sort('-id').lean().exec();
            let id = 1;
            if (PreviousRoles && PreviousRoles.hasOwnProperty('id')) {
                id = PreviousRoles.id + 1;
            } else {
                id = id;
            }
            let permissions = [];
            if (values.hasOwnProperty("permissions") && values.permissions.length > 0) {
                permissions = values.permissions;
            }
            let Data = {
                id: id,
                name: values.name,
                permissions: permissions,
                status: 0,
                createdBy: "Admin",
                createdAt: new Date()
            }
            Role(Data).save().then((Result) => {
                res.send({
                    success: true,
                    code: 200,
                    Status: "Roles Added Success.",
                    Data: {
                        id: Result.id,
                        name: Result.name
                    },
                    "timestamp": new Date()
                });
            }).catch((err) => {
                console.error('Database Error');
                console.error(err);
                res.send({
                    success: false,
                    code: 201,
                    Status: "Database Error",
                    Data: err,
                    "timestamp": new Date()

                });
            })
        }
    } else {
        res.send({
            success: false,
            code: 201,
            Status: "Role Name is Mandatory.",
            "timestamp": new Date()
        });
    }
});

const GetRoleInAdmin = catchAsync(async(req, res) => {
    let values = req.body;
    Role.find(values).lean().exec().then((Result) => {
        if (Result && Result.length > 0) {
            res.send({
                code: 200,
                success: true,
                message: "Role's Retrieved Success.",
                data: Result,
                timestamp: new Date()
            })
        } else {
            res.send({
                code: 201,
                success: false,
                message: "No Role's found.",
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

const UpdateRoleInAdmin = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("id") && values.id != '' && values.id != null && values.id != undefined) {
        let query = {
            id: values.id
        }
        values.updatedBy = "Admin"
        let changes = {
            $set: values
        }
        Role.updateOne(query, changes, { upsert: true }).lean().exec().then((UpdateStatus) => {
            res.send({
                code: 200,
                success: true,
                message: "Role updated Success.",
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
            message: "Id required to update Roles.",
            data: {},
            timestamp: new Date()
        });
    }
});

const ExportVendorData = catchAsync(async(req, res) => {
    try {
        let VendorData = await Vendors.find({}).lean().exec();
        if (VendorData && VendorData.length > 0) {

            let vendordataExport = [];
            for (each in VendorData) {

                if (VendorData[each].hasOwnProperty("Category")) {
                    for (each in VendorData[each]["Category"]) {
                        if (VendorData[each]["Category"][each] && VendorData[each]["Category"][each].hasOwnProperty("id")) {
                            VendorData[each]["Category"][each] = await Categories.findOne({ "id": VendorData[each]["Category"][each].id }).lean().exec();
                        }
                    }
                }
                if (VendorData[each].hasOwnProperty("area") && VendorData[each].area.hasOwnProperty("id") && VendorData[each].area.id != null) {
                    VendorData[each].area = await Area.findOne({ "id": VendorData[each].area.id }).lean().exec();
                }
                if (VendorData[each].hasOwnProperty("Membership") && VendorData[each].Membership.hasOwnProperty("id") && VendorData[each].Membership.id != null) {
                    VendorData[each].Membership = await MembershipModel.findOne({ "id": VendorData[each].Membership.id }).lean().exec();
                }

                let newjson = {};
                newjson = VendorData[each];
                newjson.areaname = VendorData[each].area.name;
                newjson.fulladdress = VendorData[each].Address.no + ", " + VendorData[each].Address.street + ", " + VendorData[each].Address.city + ", " + VendorData[each].Address.state + ", " + VendorData[each].Address.country;
                newjson.pincode = VendorData[each].Address.pincode;
                newjson.membershipname = VendorData[each].Membership.name;
                newjson.categorynames = "";
                for (each1 in VendorData[each].Category) {
                    newjson.categorynames = newjson.categorynames + VendorData[each].Category[each1].name + ", "
                }
                vendordataExport.push(newjson);
            }

            let filePath = await ExportVendorDataExcel(vendordataExport);
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
            message: "Vendor Data Retrieval error.",
            data: error,
            timestamp: new Date()
        })
    }
});
//GetAllMemberships
//GetAllAreas
const GetAllMemberships = () => {
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
        let allMembership = await GetAllMemberships();
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

const LoginUserInAdmin = catchAsync(async(req, res) => {
    let values = req.body;
    try {
        if (values.phoneNumber != '' && values.phoneNumber != null && values.phoneNumber != undefined &&
            values.password != '' && values.password != null && values.password != undefined
        ) {
            var CheckUsername = await User.findOne({ "phoneNumber": values.phoneNumber }, { '_id': 0, '__v': 0 }).lean().exec();
            if (CheckUsername && CheckUsername.hasOwnProperty("phoneNumber") && CheckUsername.hasOwnProperty("password")) {
                if (CheckUsername.password == values.password) {
                    let accessToken = jwt.sign({ phoneNumber: CheckUsername.phoneNumber }, process.env.TOKEN_SECRET, { expiresIn: "120s" });
                    let refreshToken = jwt.sign({ phoneNumber: CheckUsername.phoneNumber }, process.env.TOKEN_SECRET, { expiresIn: "1d" });
                    delete CheckUsername.password
                    res.send({
                        success: true,
                        code: 200,
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                        Data: CheckUsername
                    })
                } else {
                    res.send({
                        code: 201,
                        success: false,
                        message: "Password Mismatch.",
                        timestamp: new Date()
                    })
                }
            } else {
                res.send({
                    code: 201,
                    success: false,
                    message: "Invalid Username.",
                    timestamp: new Date()
                })
            }
        } else {
            res.send({
                code: 201,
                success: false,
                message: "Username and Password are mandatory.",
                timestamp: new Date()
            })
        }
        // let UserData = await CheckWheatherVendorExists(values);
        // let Result = await ValidateVendorPasswordForLogin(values, UserData);
        // if(values.hasOwnProperty("fcmToken") && Result && Result.success == true){
        //     let query = {
        //         username:Result.Data.username
        //     }
        //     let changes = {
        //         $set: {
        //             fcmToken:values.fcmToken
        //         }
        //     }
        //     let UpdateFCMToken = await Vendors.updateOne(query, changes).lean().exec();
        // }
        // res.send(Result);
    } catch (e) {
        res.send(e)
    }
});

const GetVendorProfileDetailsEmployeeMobile = catchAsync(async(req, res) => {
    let values = req.body;
    try {
        let UserData = await CheckWheatherVendorExistsAdmin(values);
        //CheckWheatherVendorExistsAdmin(values).then((UserData) => {
        console.log("UserData", UserData);
        if (UserData.hasOwnProperty("Bank")) {
            for (each in UserData["Bank"]) {
                if (UserData["Bank"][each] != "") {
                    var decipher = crypto.createDecipher(algorithm, key);
                    UserData.Password = decipher.update(UserData.Password, 'hex', 'utf8') + decipher.final('utf8');
                }

                if (UserData.hasOwnProperty("status")) {
                    if (UserData.status === 0) {
                        UserData.StatusName = "Approved";
                    } else if (UserData.status === 1) {
                        UserData.StatusName = "Pending";
                    } else if (UserData.status === 2) {
                        UserData.StatusName = "New User";
                    } else if (UserData.status === 3) {
                        UserData.StatusName = "Rejected";
                    } else if (UserData.status === 4) {
                        UserData.StatusName = "Blocked";
                    }
                }
                if (UserData.hasOwnProperty("kycStatus")) {
                    if (UserData.kycStatus == 0) {
                        UserData.kycStatusName = "Approved";
                    }
                    if (UserData.kycStatus == 1) {
                        UserData.kycStatusName = "Pending";
                    }
                    if (UserData.kycStatus == 2) {
                        UserData.kycStatusName = "Rejected";
                    }
                    if (UserData.kycStatus == 3) {
                        UserData.kycStatusName = "Re-work";
                    }
                }
            }
        }
        if (UserData.hasOwnProperty("Password")) {
            var decipher = crypto.createDecipher(algorithm, key);
            UserData.Password = decipher.update(UserData.Password, 'hex', 'utf8') + decipher.final('utf8');
        }

        if (UserData.hasOwnProperty("status")) {
            if (UserData.status === 0) {
                UserData.StatusName = "Approved";
            } else if (UserData.status === 1) {
                UserData.StatusName = "Pending";
            } else if (UserData.status === 2) {
                UserData.StatusName = "New User";
            } else if (UserData.status === 3) {
                UserData.StatusName = "Rejected";
            } else if (UserData.status === 4) {
                UserData.StatusName = "Blocked";
            }
        }
        if (UserData.hasOwnProperty("kycStatus")) {
            if (UserData.kycStatus == 0) {
                UserData.kycStatusName = "Approved";
            }
            if (UserData.kycStatus == 1) {
                UserData.kycStatusName = "Pending";
            }
            if (UserData.kycStatus == 2) {
                UserData.kycStatusName = "Rejected";
            }
        }

        if (UserData.hasOwnProperty("Category")) {
            for (each in UserData["Category"]) {
                UserData["Category"][each] = await Categories.findOne({ "id": UserData["Category"][each].id }).lean().exec();
            }
        }
        if (UserData.hasOwnProperty("area") && UserData.area.hasOwnProperty("id") && UserData.area.id != null) {
            UserData.area = await Area.findOne({ "id": UserData.area.id }).lean().exec();
        }
        if (UserData.hasOwnProperty("Membership") && UserData.Membership.hasOwnProperty("id") && UserData.Membership.id != null) {
            UserData.Membership = await MembershipModel.findOne({ "id": UserData.Membership.id }).lean().exec();
        }

        // res.send({
        //         code: 200,
        //         success: true,
        //         message: "Vendor Data Retrieved Success.",
        //         data: UserData,
        //         timestamp: new Date()
        //     })
        // }).catch(err => res.json(err));

        res.send({
                code: 200,
                success: true,
                message: "Vendor Data Retrieved Success.",
                data: UserData,
                timestamp: new Date()
            })
            // }).catch(err => res.json(err));
    } catch (error) {
        res.send(error)
    }

});


const GetVendorProfileDetailsEmployeeMobileAll = catchAsync(async(req, res) => {
    let values = req.body;
    try {
        let userRoleData = await User.find(values).lean().exec();
        let vendordataExport = [];
        console.log("userRoleData--", userRoleData)
        if (userRoleData && userRoleData.length > 0) {
            let AllVendorIDs = [];
            for (each in userRoleData) {
                AllVendorIDs.push(userRoleData[each].phoneNumber);
                AllVendorIDs = AllVendorIDs.concat(userRoleData[each].employee)
            }
            console.log("AllVendorIDs----", AllVendorIDs)
            if (AllVendorIDs && AllVendorIDs.length > 0) {
                let AllVendorData = await Vendors.find({ employeeMobile: AllVendorIDs }).sort({ createdAt: -1 }).lean().exec();
                console.log("all vendor lenght ---->", AllVendorData.length)
                if (AllVendorData && AllVendorData.length > 0) {
                    for (each in AllVendorData) {
                        // if(AllVendorData[each].hasOwnProperty("Bank")){
                        //     for(each1 in AllVendorData[each]["Bank"]){
                        //         if(AllVendorData[each]["Bank"][each1] != ""){
                        //             var decipher = crypto.createDecipher(algorithm, key);
                        //             AllVendorData[each]["Bank"][each1] = decipher.update(AllVendorData[each]["Bank"][each1], 'hex', 'utf8') + decipher.final('utf8');
                        //         }
                        //     }
                        // }
                        // if(AllVendorData[each].hasOwnProperty("Password")){
                        //     var decipher = crypto.createDecipher(algorithm, key);
                        //     AllVendorData[each].Password = decipher.update(AllVendorData[each].Password, 'hex', 'utf8') + decipher.final('utf8');
                        // }

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
                        // if(AllVendorData[each].hasOwnProperty("area") && AllVendorData[each].area.hasOwnProperty("id") && AllVendorData[each].area.id != null){
                        //     AllVendorData[each].area = await Area.findOne({"id":AllVendorData[each].area.id}).lean().exec();
                        // }
                        // if(AllVendorData[each].hasOwnProperty("Membership") && AllVendorData[each].Membership.hasOwnProperty("id") && AllVendorData[each].Membership.id != null){
                        //     AllVendorData[each].Membership = await MembershipModel.findOne({"id":AllVendorData[each].Membership.id}).lean().exec();
                        // }

                        let newjson = {};
                        newjson = AllVendorData[each];
                        newjson.categorynames = "";
                        for (each1 in AllVendorData[each].Category) {
                            if (AllVendorData[each].Category[each1] != null && AllVendorData[each].Category[each1] != undefined && AllVendorData[each].Category[each1] != '') {
                                newjson.categorynames = newjson.categorynames + AllVendorData[each].Category[each1].name + ", "
                            } else {
                                newjson.categorynames = "";
                            }
                        }
                        newjson.pincode = AllVendorData[each].Address.pincode;
                        vendordataExport.push(newjson);
                    }
                    let filePath = await ExportVendorDataExcelEmployeeMobileAll(vendordataExport);
                    var fullPublicUrl = 'http://paizattoapi.paizatto.com/';
                    let downloadurl = `${fullPublicUrl}${filePath}`
                    res.send({
                        code: 200,
                        success: true,
                        message: "Vendors Retrieved.",
                        downloadurl: downloadurl,
                        data: AllVendorData,
                        timestamp: new Date()
                    })
                } else {
                    res.send({
                        code: 201,
                        success: false,
                        message: "No vendors matched.",
                        data: AllVendorIDs,
                        timestamp: new Date()
                    })
                }

            } else {
                res.send({
                    code: 201,
                    success: false,
                    message: "Unable to retrieve employee mobile numbers.",
                    data: AllVendorIDs,
                    timestamp: new Date()
                })
            }
        } else {
            res.send({
                code: 201,
                success: false,
                message: "Sent user inactive.",
                data: userRoleData,
                timestamp: new Date()
            })
        }
    } catch (error) {
        console.log(error)
        res.send(error)
    }

});

var ExportVendorDataExcelEmployeeMobileAll = async(data) => {
    console.log(data)
    try {
        const ALL_VENDORS_REPORT_FILES_PATH = path.resolve('public', 'export', 'vendordata');
        if (!fs.existsSync(ALL_VENDORS_REPORT_FILES_PATH)) {
            fs.mkdirSync(ALL_VENDORS_REPORT_FILES_PATH, { recursive: true });
        }
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("vendordata");
        worksheet.columns = [
            { header: "Vendor ID", key: "username", width: 25 },
            { header: "Shop Name", key: "firstName", width: 25 },
            { header: "Category", key: "categorynames", width: 25 },
            { header: "Vendor Mobile No", key: "phoneNumber", width: 25 },
            { header: "Employee No", key: "employeeMobile", width: 25 },
            { header: "KYC Status", key: "kycStatusName", width: 25 },
            { header: "Overall Status", key: "StatusName", width: 25 },
            { header: "Pincode", key: "pincode", width: 25 },
            { header: "KYC Date", key: "kycDate", width: 25 },
            { header: "KYC Reason", key: "kycReason", width: 25 },
            { header: "Created Date", key: "createdAt", width: 25 },
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


const AdminDashboard = catchAsync(async(req, res) => {
    let values = req.body;
    let dummyresponse = {
        totalDownlines: 371,
        activeDownlines: 3,
        inactiveDownlines: 368,
        totalAssociates: 894,
        networkAssociates: 371,
        newAssociates: 523,
        currentmonthPurchase: 0,
        currentmonthAssociates: 0,
        currentmonthnetworkAssociates: 0,
        currentmonthnewAssociates: 0,
        totalVendors: 506,
        newUsers: 100,
        pendingUsers: 13,
        approvedUsers: 158,
        rejectedUsers: 49,
        blockedUsers: 180,
        outofscopeUsers: 3,
        currentmonthSales: "10,139",
        currentmonthnewVendors: 0,
        currentmonthapprovedVendors: 0,
        currentmonthnotapprovedVendors: 0,
        overallnotapprovedVendors: 340,
        amountsettledbycompany: 0,
        top3categories: {
            category1name: "10,139",
            category2name: "10,139",
            category3name: "10,139",
        },
        highestsalesPincode: 600041,
        highestsalesPincodeAmount: "10,139",
        companyReferral: 459,
        associateReferral: 435
    }
    res.send({
        code: 200,
        success: true,
        message: "Admin Dashboard Retrieved Success.",
        data: dummyresponse,
        timestamp: new Date()
    })
});

const TESTVENDORDATA = catchAsync(async(req, res) => {
    let allvendors = await Vendors.find({}, { username: 1, shopImages: 1 }).lean().exec();
    let filePath = await ShopImages(allvendors);
    var fullPublicUrl = 'http://paizattoapi.paizatto.com/';
    let downloadurl = `${fullPublicUrl}${filePath}`
    res.send({
        code: 200,
        success: true,
        message: "Vendors Retrieved.",
        downloadurl: downloadurl,
        //data:AllVendorData,
        timestamp: new Date()
    })
});

var ShopImages = async(data) => {
    console.log(data)
    try {
        const ALL_VENDORS_REPORT_FILES_PATH = path.resolve('public', 'export', 'vendordata');
        if (!fs.existsSync(ALL_VENDORS_REPORT_FILES_PATH)) {
            fs.mkdirSync(ALL_VENDORS_REPORT_FILES_PATH, { recursive: true });
        }
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("vendordata");
        worksheet.columns = [
            { header: "Vendor ID", key: "username", width: 25 },
            { header: "Shop Images", key: "shopImages", width: 200 },
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

const UpdateShopImages = catchAsync(async(req, res) => {
    let AllVendors = await Vendors.find({}).lean().exec();
    let tempArray = [];
    for (each in AllVendors) {
        if (AllVendors[each].hasOwnProperty("shopImages") && AllVendors[each].shopImages.length == 1) {
            let eachsplitshopImages = AllVendors[each].shopImages[0].split(',');
            let query = {
                username: AllVendors[each]["username"]
            }
            let newvalues = {
                $set: {
                    shopImages: eachsplitshopImages
                }
            }
            let updateScript = await Vendors.updateOne(query, newvalues).lean().exec();
            tempArray.push(updateScript.nModified)
        }
    }
    res.send(tempArray)
});



const AdminDashboard1 = catchAsync(async(req, res) => {
    try {
        let date = new Date();
        let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        console.log("firstday----->", firstDay);
        console.log("lastDay------>", lastDay);

        let B1 = await Associate.aggregate([{
                "$facet": {
                    "totalDownlines": [{
                            "$match": {
                                "parentId": { "$ne": "" }
                            }
                        },
                        { "$count": "totalDownlines" },
                    ],
                    "activeDownlines": [{
                            "$match": {
                                "isActive": true
                            }
                        },
                        { "$count": "activeDownlines" }
                    ],
                    "inactiveDownlines": [{
                            "$match": {
                                "isActive": false
                            }
                        },
                        { "$count": "inactiveDownlines" }
                    ]
                }
            },
            {
                "$project": {
                    "totalDownlines": { "$arrayElemAt": ["$totalDownlines.totalDownlines", 0] },
                    "activeDownlines": { "$arrayElemAt": ["$activeDownlines.activeDownlines", 0] },
                    "inactiveDownlines": { "$arrayElemAt": ["$inactiveDownlines.inactiveDownlines", 0] }
                }
            }
        ]);

        let B2 = await Associate.aggregate([{
                "$facet": {
                    "totalAssociates": [
                        { "$count": "totalAssociates" },
                    ],
                    "networkAssociates": [
                        { "$match": { "parentId": { "$ne": "" } } },
                        { "$count": "networkAssociates" }
                    ],
                    "newAssociates": [
                        { "$match": { "parentId": "" } },
                        { "$count": "newAssociates" }
                    ]
                }
            },
            {
                "$project": {
                    "totalAssociates": { "$arrayElemAt": ["$totalAssociates.totalAssociates", 0] },
                    "networkAssociates": { "$arrayElemAt": ["$networkAssociates.networkAssociates", 0] },
                    "newAssociates": { "$arrayElemAt": ["$newAssociates.newAssociates", 0] }
                }
            }
        ])

        let B3 = await Transactions.aggregate([{
            $match: {
                transactionDate: {
                    $gte: firstDay,
                    $lte: lastDay
                }
            }
        }, {
            $group: {
                _id: null,
                currentmonthPurchase: {
                    $sum: "$amount"
                }
            }
        }]);

        let B4 = await Associate.aggregate([{
                "$facet": {
                    "currentmonthAssociates": [{
                            "$match": {
                                createdAt: {
                                    $gte: firstDay,
                                    $lte: lastDay
                                }
                            }
                        },
                        { "$count": "currentmonthAssociates" },
                    ],
                    "currentmonthnetworkAssociates": [{
                            "$match": {
                                createdAt: {
                                    $gte: firstDay,
                                    $lte: lastDay
                                },
                                "parentId": { "$ne": "" }
                            }
                        },
                        { "$count": "currentmonthnetworkAssociates" }
                    ],
                    "currentmonthnewAssociates": [{
                            "$match": {
                                createdAt: {
                                    $gte: firstDay,
                                    $lte: lastDay
                                },
                                "status": 2
                            }
                        },
                        { "$count": "currentmonthnewAssociates" }
                    ]
                }
            },
            {
                "$project": {
                    "currentmonthAssociates": { "$arrayElemAt": ["$currentmonthAssociates.currentmonthAssociates", 0] },
                    "currentmonthnetworkAssociates": { "$arrayElemAt": ["$currentmonthnetworkAssociates.currentmonthnetworkAssociates", 0] },
                    "currentmonthnewAssociates": { "$arrayElemAt": ["$currentmonthnewAssociates.currentmonthnewAssociates", 0] }
                }
            }
        ]);

        let B5 = await Vendors.aggregate([
            { $group: { _id: null, totalVendors: { $sum: 1 } } },
            { $project: { _id: 0 } }
        ]);

        let B6 = await Associate.aggregate([{
                "$facet": {
                    "newUsers": [
                        { "$match": { "status": 2 } },
                        { "$count": "newUsers" }
                    ],
                    "pendingUsers": [
                        { "$match": { "status": 1 } },
                        { "$count": "pendingUsers" }
                    ],
                    "approvedUsers": [
                        { "$match": { "status": 0 } },
                        { "$count": "approvedUsers" }
                    ],
                    "rejectedUsers": [
                        { "$match": { "status": 3 } },
                        { "$count": "rejectedUsers" }
                    ],
                    "blockedUsers": [
                        { "$match": { "status": 4 } },
                        { "$count": "blockedUsers" }
                    ],
                }
            },
            {
                "$project": {
                    "newUsers": { "$arrayElemAt": ["$newUsers.newUsers", 0] },
                    "pendingUsers": { "$arrayElemAt": ["$pendingUsers.pendingUsers", 0] },
                    "approvedUsers": { "$arrayElemAt": ["$approvedUsers.approvedUsers", 0] },
                    "rejectedUsers": { "$arrayElemAt": ["$rejectedUsers.rejectedUsers", 0] },
                    "blockedUsers": { "$arrayElemAt": ["$blockedUsers.blockedUsers", 0] },
                }
            }
        ]);

        let B7 = await Transactions.aggregate([{
            $match: {
                transactionDate: {
                    $gte: firstDay,
                    $lte: lastDay
                }
            }
        }, {
            $group: {
                _id: null,
                currentmonthSales: {
                    $sum: "$amount"
                }
            }
        }, {
            $project: { _id: 0 }
        }]);

        let B8 = await Vendors.aggregate([{
                "$facet": {
                    "currentmonthnewVendors": [{
                            "$match": {
                                createdAt: {
                                    $gte: firstDay,
                                    $lte: lastDay
                                }
                            }
                        },
                        { "$count": "currentmonthnewVendors" }
                    ],
                    "currentmonthapprovedVendors": [{
                            "$match": {
                                createdAt: {
                                    $gte: firstDay,
                                    $lte: lastDay
                                },
                                "status": 0
                            }
                        },
                        { "$count": "currentmonthapprovedVendors" }
                    ],
                    "currentmonthnotapprovedVendors": [{
                            "$match": {
                                createdAt: {
                                    $gte: firstDay,
                                    $lte: lastDay
                                },
                                "status": { $in: [1, 2, 3, 4] }
                            }
                        },
                        { "$count": "currentmonthnotapprovedVendors" }
                    ],
                    "overallnotapprovedVendors": [{
                            "$match": {
                                "status": { $in: [1, 2, 3, 4] }
                            }
                        },
                        { "$count": "overallnotapprovedVendors" }
                    ]
                }
            },
            {
                "$project": {
                    "currentmonthnewVendors": { "$arrayElemAt": ["$currentmonthnewVendors.currentmonthnewVendors", 0] },
                    "currentmonthapprovedVendors": { "$arrayElemAt": ["$currentmonthapprovedVendors.currentmonthapprovedVendors", 0] },
                    "currentmonthnotapprovedVendors": { "$arrayElemAt": ["$currentmonthnotapprovedVendors.currentmonthnotapprovedVendors", 0] },
                    "overallnotapprovedVendors": { "$arrayElemAt": ["$overallnotapprovedVendors.overallnotapprovedVendors", 0] },
                }
            }
        ]);

        let B9 = await Payouts.aggregate([{
            $match: {}
        }, {
            $group: {
                _id: null,
                amountsettledbycompany: {
                    $sum: "$amount"
                }
            }
        }, {
            $project: { _id: 0 }
        }]);

        let B10 = await Transactions.aggregate([{
            "$group": {
                "_id": "$category",
                "total": {
                    "$sum": "$amount"
                }
            }
        }])

        let B11 = []

        let B12 = await Associate.aggregate([{
                "$facet": {
                    "companyReferral": [{
                            "$match": {
                                "referrer.referralid": "OL00000001"
                            }
                        },
                        { "$count": "companyReferral" }
                    ],
                    "associateReferral": [{
                            "$match": {
                                "referrer.referralid": { $nin: ["OL00000001", ""] }
                            }
                        },
                        { "$count": "associateReferral" }
                    ]
                }
            },
            {
                "$project": {
                    "companyReferral": { "$arrayElemAt": ["$companyReferral.companyReferral", 0] },
                    "associateReferral": { "$arrayElemAt": ["$associateReferral.associateReferral", 0] }
                }
            }
        ]);

        let response = {}
        if (B1.length > 0) {
            let object1 = B1[0];
            if (object1.hasOwnProperty("totalDownlines")) {
                response.totalDownlines = object1.totalDownlines;
            } else {
                response.totalDownlines = 0
            }

            if (object1.hasOwnProperty("activeDownlines")) {
                response.activeDownlines = object1.activeDownlines;
            } else {
                response.activeDownlines = 0
            }

            if (object1.hasOwnProperty("inactiveDownlines")) {
                response.inactiveDownlines = object1.inactiveDownlines;
            } else {
                response.inactiveDownlines = 0
            }
        }

        if (B2.length > 0) {
            let object1 = B2[0];
            if (object1.hasOwnProperty("totalAssociates")) {
                response.totalAssociates = object1.totalAssociates;
            } else {
                response.totalAssociates = 0
            }

            if (object1.hasOwnProperty("networkAssociates")) {
                response.networkAssociates = object1.networkAssociates;
            } else {
                response.networkAssociates = 0
            }

            if (object1.hasOwnProperty("newAssociates")) {
                response.newAssociates = object1.newAssociates;
            } else {
                response.newAssociates = 0
            }
        }

        if (B3.length > 0) {
            let object1 = B3[0];
            if (object1.hasOwnProperty("currentmonthPurchase")) {
                response.currentmonthPurchase = object1.currentmonthPurchase;
            } else {
                response.currentmonthPurchase = 0
            }
        }

        if (B4.length > 0) {
            let object1 = B4[0];
            if (object1.hasOwnProperty("currentmonthAssociates")) {
                response.currentmonthAssociates = object1.currentmonthAssociates;
            } else {
                response.currentmonthAssociates = 0
            }

            if (object1.hasOwnProperty("currentmonthnetworkAssociates")) {
                response.currentmonthnetworkAssociates = object1.currentmonthnetworkAssociates;
            } else {
                response.currentmonthnetworkAssociates = 0
            }

            if (object1.hasOwnProperty("currentmonthnewAssociates")) {
                response.currentmonthnewAssociates = object1.currentmonthnewAssociates;
            } else {
                response.currentmonthnewAssociates = 0
            }
        }

        if (B6.length > 0) {
            let object1 = B6[0];
            if (object1.hasOwnProperty("newUsers")) {
                response.newUsers = object1.newUsers;
            } else {
                response.newUsers = 0
            }

            if (object1.hasOwnProperty("pendingUsers")) {
                response.pendingUsers = object1.pendingUsers;
            } else {
                response.pendingUsers = 0
            }

            if (object1.hasOwnProperty("approvedUsers")) {
                response.approvedUsers = object1.approvedUsers;
            } else {
                response.approvedUsers = 0
            }

            if (object1.hasOwnProperty("rejectedUsers")) {
                response.rejectedUsers = object1.rejectedUsers;
            } else {
                response.rejectedUsers = 0
            }

            if (object1.hasOwnProperty("blockedUsers")) {
                response.blockedUsers = object1.blockedUsers;
            } else {
                response.blockedUsers = 0
            }
        }

        if (B7.length > 0) {
            let object1 = B7[0];
            if (object1.hasOwnProperty("currentmonthSales")) {
                response.currentmonthSales = object1.currentmonthSales;
            } else {
                response.currentmonthSales = 0
            }
        }

        if (B8.length > 0) {
            let object1 = B8[0];
            if (object1.hasOwnProperty("currentmonthnewVendors")) {
                response.currentmonthnewVendors = object1.currentmonthnewVendors;
            } else {
                response.currentmonthnewVendors = 0
            }

            if (object1.hasOwnProperty("currentmonthapprovedVendors")) {
                response.currentmonthapprovedVendors = object1.currentmonthapprovedVendors;
            } else {
                response.currentmonthapprovedVendors = 0
            }

            if (object1.hasOwnProperty("currentmonthnotapprovedVendors")) {
                response.currentmonthnotapprovedVendors = object1.currentmonthnotapprovedVendors;
            } else {
                response.currentmonthnotapprovedVendors = 0
            }

            if (object1.hasOwnProperty("overallnotapprovedVendors")) {
                response.overallnotapprovedVendors = object1.overallnotapprovedVendors;
            } else {
                response.overallnotapprovedVendors = 0
            }
        }

        if (B9.length > 0) {
            let object1 = B9[0];
            if (object1.hasOwnProperty("amountsettledbycompany")) {
                response.amountsettledbycompany = object1.amountsettledbycompany;
            } else {
                response.amountsettledbycompany = 0
            }
        }

        // if(B10.length > 0){
        //     let newArray = B10?.sort((a, b) => (a.total > b.total ? -1 : 1));

        //     response.top3categories = {}
        //     console.log(newArray)
        //     if(newArray.length > 0){
        //         if(newArray[0] && newArray[0].hasOwnProperty("total")){
        //             let categoryname = await Categories.findOne({"id":newArray[0]._id}).lean().exec();
        //             response.top3categories[categoryname.name] = newArray[0].total;
        //         }
        //         if(newArray[1] && newArray[1].hasOwnProperty("total")){
        //             let categoryname = await Categories.findOne({"id":newArray[1]._id}).lean().exec();
        //             response.top3categories[categoryname.name] = newArray[1].total;
        //         }
        //         if(newArray[2] && newArray[2].hasOwnProperty("total")){
        //             let categoryname = await Categories.findOne({"id":newArray[2]._id}).lean().exec();
        //             response.top3categories[categoryname.name] = newArray[2].total;
        //         }
        //     }
        // }

        // if(B11.length > 0){
        //     let object1 = B1[0];
        //     if(object1.hasOwnProperty("totalDownlines")){
        //         response.totalDownlines = object1.totalDownlines;
        //     }else{
        //         response.totalDownlines = 0
        //     }
        // }

        if (B12.length > 0) {
            let object1 = B12[0];
            if (object1.hasOwnProperty("companyReferral")) {
                response.companyReferral = object1.companyReferral;
            } else {
                response.companyReferral = 0
            }

            if (object1.hasOwnProperty("associateReferral")) {
                response.associateReferral = object1.associateReferral;
            } else {
                response.associateReferral = 0
            }
        }

        if (B1.length > 0) {
            let object1 = B1[0];
            if (object1.hasOwnProperty("totalDownlines")) {
                response.totalDownlines = object1.totalDownlines;
            } else {
                response.totalDownlines = 0
            }
        }

        res.send({
            code: 200,
            success: true,
            message: "Admin Dashboard Retrieved Success.",
            data: response,
            timestamp: new Date()
        })
    } catch (err) {
        console.log(err)
        res.send(err)
    }
});

const SaveTransactionData = catchAsync(async(req, res) => {
    try {
        let values = req.body;
        if (values.hasOwnProperty("VendorID") && values.VendorID != '' && values.VendorID != null && values.VendorID != undefined
            //&& values.hasOwnProperty("PayerAmount") && values.PayerAmount != '' && values.PayerAmount != null && values.PayerAmount != undefined
            // && values.hasOwnProperty("PayerName") && values.PayerName != '' && values.PayerName != null && values.PayerName != undefined
            //&& values.hasOwnProperty("PayerVa") && values.PayerVa != '' && values.PayerVa != null && values.PayerVa != undefined
            //&& values.hasOwnProperty("BankRRN") && values.BankRRN != '' && values.BankRRN != null && values.BankRRN != undefined
            // && values.hasOwnProperty("AssociateRegNo") && values.AssociateRegNo != '' && values.AssociateRegNo != null && values.AssociateRegNo != undefined
            // && values.hasOwnProperty("AssociatePhoneNo") && values.AssociatePhoneNo != '' && values.AssociatePhoneNo != null && values.AssociatePhoneNo != undefined
            // && values.hasOwnProperty("TxnInitDate") && values.TxnInitDate != '' && values.TxnInitDate != null && values.TxnInitDate != undefined
            // && values.hasOwnProperty("TxnCompletionDate") && values.TxnCompletionDate != '' && values.TxnCompletionDate != null && values.TxnCompletionDate != undefined
            //  && values.hasOwnProperty("PayabletoVendor") && values.PayabletoVendor != '' && values.PayabletoVendor != null && values.PayabletoVendor != undefined
            //&& values.hasOwnProperty("UTRNumber") && values.UTRNumber != '' && values.UTRNumber != null && values.UTRNumber != undefined
        ) {
            // if (values.TxnInitDate && typeof(values.TxnInitDate) == 'string') {
            //     values.TxnInitDate = my_datehaifen(values.TxnInitDate)
            // }
            // if (values.TxnCompletionDate && typeof(values.TxnCompletionDate) == 'string') {
            //     values.TxnCompletionDate = my_datehaifen(values.TxnCompletionDate)
            // }

            var PreviousSavedTransactions = await BankTransaction.findOne().sort('-id').lean().exec();
            let id = 1;
            if (PreviousSavedTransactions && PreviousSavedTransactions.hasOwnProperty('id')) {
                id = PreviousSavedTransactions.id + 1;
            } else {
                id = id;
            }

            let Data = values;
            Data.id = id;
            let saveTransactions = await BankTransaction(Data).save();
            console.log(saveTransactions);
            res.send({
                code: 200,
                success: true,
                message: "Bank Transaction Saved Success.",
                data: saveTransactions,
                timestamp: new Date()
            })
        } else {
            res.send({
                code: 201,
                success: false,
                message: "All Fields are Mandatory.",
                timestamp: new Date()
            })
        }
    } catch (err) {
        res.send(err)
    }
});

const GetTransactionData = catchAsync(async(req, res) => {
    try {
        let values = req.body;
        let query = values;
        let GetBankTransactions = await BankTransaction.find(query).sort({ 'createdAt': -1 }).lean().exec();
        if (GetBankTransactions && GetBankTransactions.length > 0) {
            for (each in GetBankTransactions) {
                if (GetBankTransactions[each].hasOwnProperty("TxnInitDate")) {
                    GetBankTransactions[each].TxnInitDate = Formatter.toDate(GetBankTransactions[each].TxnInitDate)
                }
                if (GetBankTransactions[each].hasOwnProperty("TxnCompletionDate")) {
                    GetBankTransactions[each].TxnCompletionDate = Formatter.toDate(GetBankTransactions[each].TxnCompletionDate)
                }
                if (GetBankTransactions[each].hasOwnProperty("Commission")) {
                    GetBankTransactions[each].Commission = GetBankTransactions[each].Commission.toFixed(2)
                }
                if (GetBankTransactions[each].hasOwnProperty("GST")) {
                    GetBankTransactions[each].GST = GetBankTransactions[each].GST.toFixed(2)
                }
                if (GetBankTransactions[each].hasOwnProperty("TotalCommission")) {
                    GetBankTransactions[each].TotalCommission = GetBankTransactions[each].TotalCommission.toFixed(2)
                }
                if (GetBankTransactions[each].hasOwnProperty("PayabletoVendor")) {
                    GetBankTransactions[each].PayabletoVendor = GetBankTransactions[each].PayabletoVendor.toFixed(2)
                }
            }
            res.send({
                code: 200,
                success: true,
                message: "Bank transactions retrieved success.",
                data: GetBankTransactions,
                timestamp: new Date()
            })
        } else {
            res.send({
                code: 200,
                success: true,
                message: "No transactions matched the query.",
                data: {},
                timestamp: new Date()
            })
        }
    } catch (err) {
        res.send(err)
    }
});

const UpdateTransactionData = catchAsync(async(req, res) => {
    try {
        let values = req.body;
        if (values.BankRRN && values.BankRRN != '' && values.BankRRN != null && values.BankRRN != undefined) {
            let query = {
                    BankRRN: values.BankRRN
                }
                // if (values.TxnCompletionDate && typeof(values.TxnCompletionDate) == 'string') {
                //     values.TxnCompletionDate = my_datehaifen(values.TxnCompletionDate)
                // }
            let changes = {
                $set: values
            }
            let UpdateBankTransactions = await BankTransaction.updateOne(query, changes, { upsert: true }).lean().exec();
            res.send({
                code: 200,
                success: true,
                message: "Update Transaction Status.",
                data: UpdateBankTransactions,
                timestamp: new Date()
            })
        } else {
            res.send({
                code: 201,
                success: false,
                message: "INvalid UTR.",
                data: {},
                timestamp: new Date()
            })
        }
    } catch (err) {
        res.send(err)
    }
});

const ExecuteBankTransaction = catchAsync(async(req, res) => {
    try {
        let values = req.body;
        if (values.vendorUsername && values.vendorUsername != '' && values.vendorUsername != null && values.vendorUsername != undefined &&
            values.tranAmount && values.tranAmount != '' && values.tranAmount != null && values.tranAmount != undefined
        ) {
            let vendorData = await Vendors.findOne({ username: values.vendorUsername }, {
                _id: 0,
                area: 1,
                Bank: 1,
                phoneNumber: 1
            }).lean().exec();
            if (vendorData.hasOwnProperty("Bank")) {
                for (each in vendorData.Bank) {
                    var decipher = crypto.createDecipher(algorithm, key);
                    vendorData.Bank[each] = decipher.update(vendorData.Bank[each], 'hex', 'utf8') + decipher.final('utf8');
                }
            }
            if (vendorData.hasOwnProperty("area")) {
                vendorData.area = await Area.findOne({ "id": vendorData.area.id }, {
                    "_id": 0,
                    "id": 1,
                    "name": 1
                }).lean().exec();
            }
            const VendorResp = {};
            VendorResp.beneAccNo = vendorData.Bank.accountnumber;
            VendorResp.beneName = vendorData.Bank.accountholdername;
            VendorResp.beneAddr1 = vendorData.area.name;
            VendorResp.ifsc = vendorData.Bank.ifsccode;
            VendorResp.tranCcy = "INR";
            VendorResp.tranAmount = values.tranAmount;
            VendorResp.paymentType = values.paymentType;
            VendorResp.beneMobile = vendorData.phoneNumber;

            let executeTransactionResponse = await axios.post("http://localhost:8888/executeTransaction", VendorResp);
            console.log("executeTransactionResponse----", executeTransactionResponse)
            if (executeTransactionResponse) {
                res.send({
                    code: executeTransactionResponse.status,
                    success: executeTransactionResponse.statusText,
                    message: "Transaction Success.",
                    data: executeTransactionResponse.data,
                    timestamp: new Date()
                })
            } else {
                res.send({
                    code: 201,
                    success: false,
                    message: "Transaction Failure.",
                    data: {},
                    timestamp: new Date()
                })
            }
        } else {
            res.send({
                code: 201,
                success: false,
                message: "Invalid Vendor Username.",
                data: {},
                timestamp: new Date()
            })
        }
    } catch (err) {
        console.log("error at execute transaction", err)
        res.send(err)
    }
});

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

const AddFaq = catchAsync(async(req, res) => {
    try {
        let values = req.body;
        if (values.hasOwnProperty("category") && values.category != '' && values.category != null && values.category != undefined &&
            values.hasOwnProperty("question") && values.question != '' && values.question != null && values.question != undefined &&
            values.hasOwnProperty("answer") && values.answer != '' && values.answer != null && values.answer != undefined &&
            values.hasOwnProperty("userType") && values.userType != '' && values.userType != null && values.userType != undefined
        ) {
            var PreviousFAQs = await Faq.findOne().sort('-id').lean().exec();
            let id = 1;
            if (PreviousFAQs && PreviousFAQs.hasOwnProperty('id')) {
                id = PreviousFAQs.id + 1;
            } else {
                id = id;
            }
            let Data = {
                id: id,
                category: values.category,
                question: values.question,
                answer: values.answer,
                userType: values.userType
            }
            let SaveFAQs = await Faq(Data).save();
            res.send(SaveFAQs)
        } else {
            res.send({
                code: 201,
                success: false,
                message: "All fields are mandatory.",
                data: {},
                timestamp: new Date()
            })
        }
    } catch (err) {
        console.log("error at execute transaction", err)
        res.send(err)
    }
});


const AddPointsPurchaseAmount = catchAsync(async(req, res) => {
    try {
        let values = req.body;
        let date = new Date();
        let AllAssociates = await Associate.find({}).lean().exec();
        let AllEarnedPoints = []
        let generalSettings = await GeneralSettings.findOne({ "status": 0 }).lean().exec();
        if (AllAssociates && AllAssociates.length > 0) {
            for (each in AllAssociates) {
                let payoutJSON = {};
                let UserLevelMin = 0;
                let UserLevelMax = 0;

                let eachUsername = AllAssociates[each].username;
                let GetEarnedPointsDashboard = await getEarnedPointsWithLevelDashboard({ parentUserName: eachUsername, month: values.month });
                if (AllAssociates[each].hasOwnProperty("Levels")) {
                    let UserLastLevel = AllAssociates[each].Levels[AllAssociates[each].Levels.length - 1]
                    UserLevelMin = UserLastLevel.min;
                    UserLevelMax = UserLastLevel.max;
                }
                GetEarnedPointsDashboard.username = eachUsername;
                GetEarnedPointsDashboard.UserLevelMin = UserLevelMin;
                GetEarnedPointsDashboard.UserLevelMax = UserLevelMax;
                if (GetEarnedPointsDashboard.hasOwnProperty("earnedPoints") && GetEarnedPointsDashboard.earnedPoints != 0) {
                    // if(generalSettings && generalSettings != null){
                    //     GetEarnedPointsDashboard.currentMonthEarnedAmount = GetEarnedPointsDashboard.earnedPoints * generalSettings.pointValue;
                    // }

                    payoutJSON.points = GetEarnedPointsDashboard.earnedPoints;
                    if (payoutJSON.points < GetEarnedPointsDashboard.UserLevelMin) {
                        payoutJSON.points = GetEarnedPointsDashboard.earnedPoints;
                    }
                    if ((payoutJSON.points * generalSettings.pointValue) > GetEarnedPointsDashboard.UserLevelMax) {
                        payoutJSON.points = GetEarnedPointsDashboard.UserLevelMax / generalSettings.pointValue;
                    }

                    payoutJSON.username = GetEarnedPointsDashboard.username;
                    payoutJSON.vendor = "NULL";
                    //payoutJSON.points = GetEarnedPointsDashboard.earnedPoints;
                    payoutJSON.amount = payoutJSON.points * generalSettings.pointValue;
                    payoutJSON.status = 0;
                    payoutJSON.transactionDate = new Date(date.getFullYear(), values.month, 1);
                    payoutJSON.utrnumber = 0000;
                    console.log(payoutJSON.transactionDate)
                    if (AllAssociates[each].hasOwnProperty("Bank") &&
                        AllAssociates[each]["Bank"].hasOwnProperty("accountholdername") &&
                        AllAssociates[each]["Bank"].hasOwnProperty("accountnumber") &&
                        AllAssociates[each]["Bank"].hasOwnProperty("ifsccode")) {
                        payoutJSON.accountholdername = AllAssociates[each]["Bank"].accountholdername
                        payoutJSON.accountnumber = AllAssociates[each]["Bank"].accountnumber
                        payoutJSON.ifsccode = AllAssociates[each]["Bank"].ifsccode
                    }

                    AllEarnedPoints.push(payoutJSON)
                }
            }
            let saveAllRecords = await Payouts.insertMany(AllEarnedPoints);
            res.send({
                code: 200,
                success: true,
                message: "Payouts Added Success.",
                // updatedvalues: saveAllRecords,
                data: saveAllRecords,
                timestamp: new Date()
            })
        }
    } catch (err) {
        console.log("error at add points", err)
        res.send(err)
    }
});

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
            return new Date(t.transactionDate).getMonth() === values.month - 1
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
                        return new Date(t.transactionDate).getMonth() === values.month - 1
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

const getEarnedPointsDashboard = async(values) => {
    return new Promise(async(resolve, reject) => {
        const parentUserName = values.parentUserName;
        const parent = await Associate.findOne({ username: parentUserName })
        let activeCount = 0,
            inActiveCount = 0;
        let totalPoints = 0;
        const pTransactions = await Transactions.find({ username: parentUserName })
        const pFilteredArray = pTransactions.filter((t) => {
            return new Date(t.transactionDate).getMonth() === values.month - 1
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
                        return new Date(t.transactionDate).getMonth() === values.month - 1
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

const UpdateAssociateReferralIDPhoneNumber = catchAsync(async(req, res) => {
    try {
        let values = req.body;
        if (values.hasOwnProperty("username") && values.username != '' && values.username != null && values.username != undefined &&
            ((values.hasOwnProperty("referralid") && values.referralid != '' && values.referralid != null && values.referralid != undefined) ||
                (values.hasOwnProperty("phoneNumber") && values.phoneNumber != '' && values.phoneNumber != null && values.phoneNumber != undefined))
        ) {
            let AssociateCheck = await Associate.findOne({ 'username': values.username }).lean().exec();
            if (AssociateCheck && AssociateCheck.hasOwnProperty("status") && AssociateCheck.status != 3 && AssociateCheck.status != 4) {
                let query = {
                    username: values.username
                }
                let newvalues = {

                }
                if (values.hasOwnProperty("referralid")) {
                    let checkreferralidvalidation = await Associate.findOne({ 'username': values.referralid }).lean().exec();
                    if (checkreferralidvalidation && checkreferralidvalidation.hasOwnProperty("status") && checkreferralidvalidation.status != 3 && checkreferralidvalidation.status != 4) {
                        newvalues.referrer = {}
                        newvalues.referrer.referralid = values.referralid;
                    }
                }

                if (values.hasOwnProperty("phoneNumber")) {
                    let checkphonenumberexists = await Associate.findOne({ 'phoneNumber': values.phoneNumber }).lean().exec();
                    console.log("check phone------------>", checkphonenumberexists)
                    if (checkphonenumberexists == null) {
                        newvalues.phoneNumber = values.phoneNumber
                    }
                }

                let UpdateAssociate = await Associate.updateOne(query, newvalues).lean().exec()
                res.send({
                    code: 200,
                    success: true,
                    message: "User Update Success.",
                    updatedvalues: newvalues,
                    data: UpdateAssociate,
                    timestamp: new Date()
                });
            } else {
                res.send({
                    code: 201,
                    success: false,
                    message: "Inactive User.",
                    data: {},
                    timestamp: new Date()
                })
            }
        } else {
            res.send({
                code: 201,
                success: false,
                message: "phoneNumber or referralid is mandatory to update.",
                data: {},
                timestamp: new Date()
            })
        }
    } catch (err) {
        console.log("error at add points", err)
        res.send(err)
    }
});

const UPDATEMODEL = catchAsync(async(req, res) => {
    try {
        let AllAssociates = await Associate.find({}, { '_id': 0, 'username': 1, 'referrer': 1 }).lean().exec();
        let arrayaddpoints = [];
        if (AllAssociates && AllAssociates.length > 0) {
            for (each in AllAssociates) {
                let AddPoints = await AddReferralPoints(AllAssociates[each])
                arrayaddpoints.push(AddPoints)
            }
        }
        res.send(arrayaddpoints)
    } catch (error) {
        console.log(error)
        res.send(error)
    }

});

const AddReferralPoints = async(values) => {
    return new Promise(async(resolve, reject) => {
        try {
            let PaizattoPreviousPoints = await PaizattoPoints.findOne().sort('-id').lean().exec();
            let id1 = 1;
            if (PaizattoPreviousPoints && PaizattoPreviousPoints.hasOwnProperty('id')) {
                id1 = PaizattoPreviousPoints.id + 1;
            } else {
                id1 = id1;
            }
            let PaizattoPointsData = {}
            PaizattoPointsData.id = id1;
            PaizattoPointsData.customerUsername = values.username;
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


            if (values.hasOwnProperty("referrer") && values.referrer.hasOwnProperty("referralid") && values.referrer.referralid != '' && values.referrer.referralid != null && values.referrer.referralid != undefined && values.referrer.referralid != 'OL00000001') {

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
                PaizattoPointsData1.customerUsername = values.referrer.referralid;
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
            resolve(true)
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

///////////////
function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

module.exports = {
    AddOrUpdateGeneralSettings,
    GetAllGeneralSettings,
    DeleteGeneralSettings,
    AddOrUpdateCategories,
    UpdateCategories,
    GetAllCategories,
    DeleteCategories,
    AddOrUpdatePackages,
    GetAllPackages,
    DeletePackages,
    AddOrUpdateLevels,
    GetAllLevels,
    DeleteLevels,
    UserCheckNetwork,
    InsertPoints,
    CashbackCall,
    SendCashback,
    billing,
    billing1, //This one is a duplicate one for billing api
    dashboard,

    RegisterAssociateAdmin,
    GetAssociatePersonalDetailsAssociateAdmin,
    UpdatePersonalDetailsAssociateAdmin,
    UpdateAssociateKYCAdmin,
    DeleteAssociateAdmin,
    ListAllAssociateAdmin,

    RegisterVendorAdmin,
    UpdateVendorAdmin,
    DeleteVendorAdmin,
    ListAllVendorAdmin,
    GetVendorProfileDetails,
    UpdateVendorKYCAdmin,
    UpdateShopDetailsAdmin,
    getLevel,

    AddProductInAdmin,
    GetProductInAdmin,
    UpdateProductInAdmin,

    AssociateReport,
    AssociateActiveInactiveReport,
    AssociateBlankBankDetailsReport,

    SendVendorAppLink,
    SendAssociateAppLink,
    VendorBankUpdateSMS,
    AssociateBankUpdateSMS,

    AddUserInAdmin,
    GetUsersInAdmin,
    UpdateUserInAdmin,
    ActiveInactiveUserInAdmin,
    LoginUserInAdmin,

    AddMenuInAdmin,
    GetMenuInAdmin,
    UpdateMenuInAdmin,

    AddRoleInAdmin,
    GetRoleInAdmin,
    UpdateRoleInAdmin,

    ExportVendorData,
    GetVendorProfileDetailsEmployeeMobile,
    GetVendorProfileDetailsEmployeeMobileAll,
    GetAllMemberships,
    GetAllAreas,
    GetAllCategoriesForListAllVendor,
    AdminDashboard,
    TESTVENDORDATA,
    UpdateShopImages,
    UPDATEMODEL,
    AdminDashboard1,
    SaveTransactionData,
    GetTransactionData,
    UpdateTransactionData,
    GetAssociatePersonalDetailsAssociateAdminBank,
    ExecuteBankTransaction,

    AddFaq,
    //UpdateFaq,
    AddPointsPurchaseAmount,
    UpdateAssociateReferralIDPhoneNumber
};