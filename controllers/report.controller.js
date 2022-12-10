const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode');
var User = require('../model/user');
let moment = require('moment');
let uuid = require('uuid');

let crypto = require('crypto');
let rand = require('csprng');

//const { response } = require('../app');
//Google Distance Module and API key kept here, move api key to env file
const distanceCalc = require('google-distance');
distanceCalc.apiKey = '';
var axios = require('axios');

const userController = require('../controllers/user.controller');
const vendorController = require('../controllers/vendor.controller')

var Associate = require('../model/associate')
var AssociateOtp = require('../model/associateotp')
var GeneralSetting = require('../model/generalsetting');
var Categories = require('../model/category');
var Packages = require('../model/package');
var Levels = require('../model/level');
var Vendors = require('../model/vendor');
var Points = require('../model/point');
const vendor = require('../model/vendor');

//Need to move these keys to env file
var algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
var key = 'password';
const imageUpload = require('../services/image_upload.service');

//downlinePointsReport
const downlinePointsReport = catchAsync(async(req, res) => {
    
    let dataResult = [
        {
            "dateTime": "30-08-2021 01:07 PM", 
            "associateRegNumber": "A000000004", 
            "associateName": "Geetanjali P", 
            "purchaseAmount": "1000",
            "level": "Ladder 1",
            "associateLevel": "Level- 1",
        },
        {
            "dateTime": "23-10-2021 03:32 PM", 
            "associateRegNumber": "A000000013", 
            "associateName": "Rajesh M", 
            "purchaseAmount": "850",
            "level": "Ladder 2",
            "associateLevel": "Level- 2",
        },
        {
            "dateTime": "20-08-2021 02:42 PM", 
            "associateRegNumber": "A000000040", 
            "associateName": "Kalaivani J", 
            "purchaseAmount": "2000",
            "level": "Ladder 2",
            "associateLevel": "Level- 3",
        },
    ]

    res.send({ 
        code:200,
        success:true,
        message:"Retrieved",
        data: dataResult,
        timestamp:new Date()
    })
});

//referralReport
const referralReport = catchAsync(async(req, res) => {
    
    let dataResult = [
        {
            "associateRegNumber": "A000010742", 
            "associateName": "Nithesh Nahar", 
            "mobileNumber": "8056163538",
            "city": "Chennai",
            "pincode": "600015",
            "referredBy": "A000000001",
            "actualReferral": "A000000001",
            "status": "New User",
        },
        {
            "associateRegNumber": "A000010741", 
            "associateName": "Dinesh Kumar", 
            "mobileNumber": "9841368550",
            "city": "Chennai",
            "pincode": "600039",
            "referredBy": "A000000001",
            "actualReferral": "A000000001",
            "status": "New User",
        },
        {
            "associateRegNumber": "A000000708", 
            "associateName": "Syed M", 
            "mobileNumber": "9791177766",
            "city": "Hosur",
            "pincode": "600002",
            "referredBy": "A000000001",
            "actualReferral": "A000000001",
            "status": "New User",
        },
    ]

    res.send({ 
        code:200,
        success:true,
        message:"Retrieved",
        data: dataResult,
        timestamp:new Date()
    })
});

//levelReport
const levelReport = catchAsync(async(req, res) => {
    
    let dataResult = [
        {
            "level": "LEVEL - 1", 
            "numberOfAssociates": "3", 
            "totalSlots": "3",
            "availableSlots": "0",
        },
        {
            "level": "LEVEL - 2", 
            "numberOfAssociates": "9", 
            "totalSlots": "9",
            "availableSlots": "0",
        },
        {
            "level": "LEVEL - 3", 
            "numberOfAssociates": "27", 
            "totalSlots": "27",
            "availableSlots": "0",
        },
    ]

    res.send({ 
        code:200,
        success:true,
        message:"Retrieved",
        data: dataResult,
        timestamp:new Date()
    })
});

//purchaseReport
const purchaseReport = catchAsync(async(req, res) => {
    
    let dataResult = [
        {
            "dateTime": "15-09-2021 07:40 PM", 
            "vendor": "Sri Saranya medicals", 
            "category": "Medicals",
            "purchaseAmount": "150",
            "pointsGenerated": "1.5",
        },
        {
            "dateTime": "25-08-2021 07:33 PM", 
            "vendor": "Sri Saranya medicals", 
            "category": "Medicals",
            "purchaseAmount": "25",
            "pointsGenerated": "0.3",
        },
        {
            "dateTime": "05-08-2021 12:58 PM", 
            "vendor": "Hapiee Shopee", 
            "category": "Clothing",
            "purchaseAmount": "900",
            "pointsGenerated": "9",
        },
    ]

    res.send({ 
        code:200,
        success:true,
        message:"Retrieved",
        data: dataResult,
        timestamp:new Date()
    })
});

module.exports = {
    downlinePointsReport,
    referralReport,
    levelReport,
    purchaseReport,
};