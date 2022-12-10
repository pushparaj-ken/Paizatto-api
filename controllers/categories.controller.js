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
var categories = require('../model/category');
var MembershipModel = require('../model/membership');
var Contactus = require('../model/contactus');
var Transactions = require('../model/transaction');
var refervendormodel = require('../model/refervendor');
let MarketingMessage = require('../model/merketingmessages');
let Faq = require('../model/faq');



const imageUpload = require('../services/image_upload.service');
const AllConstants = require('../services/constants');

const categoriesdetails = catchAsync(async (req, res) => {
    categories.find({}).lean().exec().then((Result) => {
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

const GetMemberShipBasedOnId = (values) => {console.log("Values   ---",values);
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                // console.log(MembershipModel)
                MembershipModel.findOne(values).lean().exec().then((Result) => {
                    if(Result){
                        resolve(Result)
                    }else{
                        reject({
                            code:201,
                            success: false, 
                            status: "Level 1 Membership Not Found",
                            timestamp:new Date()
                        });
                    }
                    
                }).catch(err => {console.log(err)
                    res.json(err)});
            } catch (error) {
                console.error('Something Error');
                console.error(error);
                reject({ 
                    code:201,
                    success: false, 
                    status: "DATABASE_ERROR",
                    timestamp:new Date()
                });
            }
        })
    });    
}


const addcategorieslist = catchAsync(async(req, res) => {
    let values = req.body;
    GetMemberShipBasedOnId({"id": values.membershipid}).then((Membership1) => {
        addcategories(req, res, Membership1)
    })
})


/*const addcategories = catchAsync(async(req, res) => {
    let values = req.body;
    GetMemberShipBasedOnId({"id":values.membershipid}).then((Membership1) => {
        if (values.name != '' && values.name != null && values.name != undefined
        ) {
            let id = 1;
            var PreviousProducts = categories.findOne().sort('-id').lean().exec(); 
            
            if(PreviousProducts.hasOwnProperty('id')){
                id = PreviousProducts.id + 1;
            }else{
                id = id;
            }
            let Data = {
                id: id,
                fee: values.fee,
                gst: values.gst,
                name: values.name,
                createdAt: new Date(),
                updatedAt: new Date(),
                Membership:Membership1,

            }
            categories(Data).save().then((Result) => {
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
})*/



const addcategories = catchAsync(async (req, res, Membership1) => {
    let values = req.body;
    if (values.name != '' && values.name != null && values.name != undefined
    ) {
        var PreviousProducts = await categories.findOne().sort('-id').lean().exec(); 
        let id = 1;
        if(PreviousProducts.hasOwnProperty('id')){
            id = PreviousProducts.id + 1;
        }else{
            id = id;
        }
        let Data = {
            id: id,
            fee: values.fee,
            gst: values.gst,
            name: values.name,
            createdAt: new Date(),
            updatedAt: new Date(),
            Membership:Membership1,

        }
        categories(Data).save().then((Result) => {
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



/*const Updatecategories = catchAsync(async (req, res) => {
    let values = req.body;
    GetMemberShipBasedOnId({"id":values.memebershipid}).then((Membership1) => {
        if(values.hasOwnProperty("id") && values.id != '' && values.id != null && values.id != undefined){
            let query = {
                id:values.id,
                Membership:Membership1,

            }
            let changes = {
                $set:values
            }
            categories.updateOne(query, changes, {upsert:true}).lean().exec().then((UpdateStatus) => {
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
    })
});*/

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
const deletecategories = catchAsync(async (req, res) => {
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
        categories.updateOne(query, changes, {upsert:true}).lean().exec().then((UpdateStatus) => {
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
        message:"Id required to update products.",
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
    categoriesdetails,
    addcategories,
    addcategorieslist,
   // Updatecategories,
   deletecategories
};