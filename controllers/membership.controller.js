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

var GeneralSetting = require('../model/generalsetting');
var Categories = require('../model/category');
var Packages = require('../model/package');
var Levels = require('../model/level');
var Vendors = require('../model/vendor');
var points = require('../model/point');
var products = require('../model/product');
var product = require('../model/product');
var membership = require('../model/membership');
var Contactus = require('../model/contactus');
var Transactions = require('../model/transaction');
var refervendormodel = require('../model/refervendor');
let MarketingMessage = require('../model/merketingmessages');
let Faq = require('../model/faq');



const imageUpload = require('../services/image_upload.service');
const AllConstants = require('../services/constants');

const membershipdetails = catchAsync(async (req, res) => {
    await membership.find({}).lean().exec().then((Result) => {
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

const addmembership = catchAsync(async (req, res) => {
    let values = req.body;
    if (values.name != '' && values.name != null && values.name != undefined

    ) {
        var PreviousProducts = await membership.findOne().sort('-id').lean().exec(); 
        let id = 1;
        if(PreviousProducts.hasOwnProperty('id')){
            id = PreviousProducts.id + 1;
        }else{
            id = id;
        }
        let Data = {
            id : id,
            name: values.name,
            image: values.image,
            value: values.value,
            status: "0",
            createdAt: new Date(),
            updatedAt: new Date(),

        }
        await membership(Data).save().then((Result) => {
            res.send({
                success: true,
                code: 200,
                Status: "Membership Saved Success",
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

const Updatemembership = catchAsync(async (req, res) => {
    let values = req.body;
    if(values.hasOwnProperty("id") && values.id != '' && values.id != null && values.id != undefined){
        let query = {
            id:values.id
        }
        let changes = {
            $set:values
        }
        await membership.updateOne(query, changes, {upsert:true}).lean().exec().then((UpdateStatus) => {
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
        message:"Id required to update products.",
        data:{},
        timestamp: new Date()
    });
}
});

/*const id = req.params.id;
membership.findByIdAndUpdate(id, req.body, { useFindAndModify: false }).lean().exec().then((UpdateStatus) => {
    res.send({
        code: 200,
        success: true,
        message: "Data Update Success.",
        timestamp: new Date()
    })
    .catch((err) => {
        res.send({
            code: 201,
            success: false,
            message: "DATABASE_ERROR.",
            timestamp: new Date()
        });
    })
});*/


const ActiveInactivemembership = catchAsync(async(req, res) => {
    let values = req.body;
    if(values.hasOwnProperty("id") && values.id != '' && values.id != null && values.id != undefined){
        let query = {
            id:values.id
        }
        var checkuserexists = await membership.findOne(query).lean().exec();
        if(checkuserexists){
            let newValues = {}
            let responseMessage = "Membership active inactive Success."
            if(checkuserexists.status == 0){
                newValues.status = 1;
                responseMessage = "Membership Inactivated Success.";
            }
            if(checkuserexists.status == 1){
                newValues.status = 0;
                responseMessage = "Membership Activated Success.";
            }
            newValues.updatedBy = "Admin"
            let changes = {
                $set:newValues
            }
            await membership.updateOne(query, changes, {upsert:true}).lean().exec().then((UpdateStatus) => {
                res.send({ 
                    code:200,
                    success:true,
                    message:responseMessage,
                    timestamp:new Date()
                })
            }).catch((err) => {console.log(err)
                res.send({
                    code:201,
                    success:false,
                    message:"DATABASE_ERROR.",
                    timestamp:new Date()
                });
            })
        }else{
            res.send({
                code:201,
                success:false,
                message:"Invalid Membership Id.",
                timestamp:new Date()
            });
        }
    }else{
        res.send({
            code:201,
            success: false,
            message:"Id required to active/inactive membership.",
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
    membershipdetails,
    addmembership,
    Updatemembership,
    ActiveInactivemembership
    
};