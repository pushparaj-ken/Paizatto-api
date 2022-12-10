const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode');
var User = require('../model/user');
var Associate = require('../model/associate')
var AssociateOtp = require('../model/associateotp')
let moment = require('moment');
let uuid = require('uuid');
const _ = require("lodash");

let crypto = require('crypto');
let rand = require('csprng');

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

var package = require('../model/package');




const imageUpload = require('../services/image_upload.service');
const AllConstants = require('../services/constants');

const packagedetails = catchAsync(async (req, res) => {
    package.find({}).lean().exec().then((Result) => {
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

const addpackage = catchAsync(async (req, res) => {
    let values = req.body;
    if (values.name != '' && values.name != null && values.name != undefined

    ) {
        var PreviousPackage = await package.findOne().sort('-id').lean().exec(); 
        let id = 1;
        if(PreviousPackage.hasOwnProperty('id')){
            id = PreviousPackage.id + 1 ;
        }else{
            id = id;
        }
        let Data = {
            id : id,
            name: values.name,
            message: values.message,
            icon: values.icon,
            pin: values.pin,
            status: "0",
            createdAt: new Date(),
            updatedAt: new Date(),

        }
        package(Data).save().then((Result) => {
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

const Updatepackage = catchAsync(async (req, res) => {
    let values = req.body;
    if(values.hasOwnProperty("id") && values.id != '' && values.id != null && values.id != undefined){
        let query = {
            id:values.id
        }
        let changes = {
            $set:values
        }
        package.updateOne(query, changes, {upsert:true}).lean().exec().then((UpdateStatus) => {
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
        message:"Id required to update Packages.",
        data:{},
        timestamp: new Date()
    });
}
});

const deletepackage = catchAsync(async (req, res) => {
    let values = req.body;
    if(values.hasOwnProperty("id") && values.id != '' && values.id != null && values.id != undefined){
        let query = {
            id:values.id
        }
        let changes = {
            $set: {
                status: 1
            }
        }
        package.updateOne(query, changes, {upsert:true}).lean().exec().then((UpdateStatus) => {
        res.send({
            code: 200,
            success: true,
            message: "Data Deleted.",
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
            message:"Id required to update Packages.",
            data:{},
            timestamp: new Date()
        });
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

module.exports = {
    packagedetails,
    addpackage,
    Updatepackage,
    deletepackage
    
};