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

const excel = require("exceljs");
var fs = require('fs');
var path = require('path');
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


var Refervendor = require('../model/refervendor');


const refervendordetails = catchAsync(async(req, res) => {

    Refervendor.find({ status: 0 }).sort("-createdAt").lean().exec().then((Result) => {
        var newdata = new Array();
        Associate.find({ referredBy: Result.referredBy }).lean().exec().then(async(Result_new) => {
            for (let i = 0; i < Result.length; i++) {

                // Result = Result_new.firstName;
                let Data = {
                    "Address": Result[i].Address,
                    "id": Result[i].id,
                    "referredBy": Result[i].referredBy,
                    "shopName": Result[i].shopName,
                    "dealerName": Result[i].dealerName,
                    "phoneNumber": Result[i].phoneNumber,
                    "email": Result[i].email,
                    "status": Result[i].status,
                    "Category": Result[i].Category,
                    "createdAt": Result[i].createdAt,
                    "updatedAt": Result[i].updatedAt,
                    "Associate_name": Result_new[i].firstName + " " + Result_new[i].lastName,
                };
                newdata.push(Data);
            }
            let filePath = await ExportVendorDataExcel(newdata);
            //var fullPublicUrl = `${req.protocol}://${req.get('host')}/`;
            var fullPublicUrl = 'http://paizattoapi.paizatto.com/';
            let downloadurl = `${fullPublicUrl}${filePath}`
            if (Result && Result.length > 0) {

                res.send({
                    code: 200,
                    success: true,
                    message: "Data Retrieved Success.",
                    data: newdata,
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


const ExportVendorData = catchAsync(async(req, res) => {
    try {
        let VendorData = await Refervendor.find({}).lean().exec();
        if (VendorData && VendorData.length > 0) {
            let newjson = {};
            newjson = VendorData[each];
            newjson.referredBy = VendorData[each].refer.referredBy;
            newjson.shopName = VendorData[each].shop.shopName;
            newjson.dealerName = VendorData[each].dealer.dealerName;
            newjson.phoneNumber = VendorData[each].phone.phoneNumber;
            newjson.email = VendorData[each].email.email;

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
            { header: "Referred By", key: "referredBy", width: 25 },
            { header: "Associate Name", key: "Associate_name", width: 25 },
            { header: "Shop Name", key: "shopName", width: 25 },
            { header: "Dealer Name", key: "dealerName", width: 25 },
            { header: "Mobile Number", key: "phoneNumber", width: 25 },
            { header: "Email", key: "email", width: 25 },
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
        let fileName = `Refervendor_${filedate}.xlsx`;
        console.log(fileName);
        await workbook.xlsx.writeFile(path.resolve(ALL_VENDORS_REPORT_FILES_PATH, fileName));
        return `export/vendordata/${fileName}`;
    } catch (err) {
        console.log('Error while generating Sales Summary Report', err);
    }

}

const addrefervendor = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.referredBy != '' && values.referredBy != null && values.referredBy != undefined

    ) {
        var Previousrefer = await Refervendor.findOne().sort('-id').lean().exec();
        let id = 1;
        if (Previousrefer && Previousrefer.hasOwnProperty('id')) {
            id = Previousrefer.id + 1;
        } else {
            id = id;
        }
        let Data = {
            id: id,
            referredBy: values.referredBy,
            shopName: values.shopName,
            dealerName: values.dealerName,
            phoneNumber: values.phoneNumber,
            email: values.email,
            Category: values.Category,
            Address: {
                no: values.no,
                street: values.street,
                city: values.city,
                pincode: values.pincode,
                state: values.state,
                country: values.country,
                geometry: {
                    type: values.type,
                    coordinates: values.coordinates,
                    index: values.index,
                }

            },
            status: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        Refervendor(Data).save().then((Result) => {
            res.send({
                success: true,
                code: 200,
                data: Data,
                Status: "Refer Vendor Saved Success.",

            });
        }).catch((err) => {
            console.error('Database Error');
            console.error(err);
            res.send({
                success: false,
                code: 200,
                Status: "Database Error",

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



const Updaterefervendor = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("id") && values.id != '' && values.id != null && values.id != undefined) {
        let query = {
            id: values.id
        }
        let changes = {
            $set: values
        }
        Refervendor.updateOne(query, changes, { upsert: true }).lean().exec().then((UpdateStatus) => {
            res.send({
                code: 200,
                success: true,
                message: "Refer Vendor Update Success.",
                timestamp: new Date()
            })
        }).catch((err) => {
            console.log("Refer Vendor Error-----", err)
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
            message: "Id required to update ReferVendors.",
            data: {},
            timestamp: new Date()
        });
    }
});

const deleterefervendor = catchAsync(async(req, res) => {
    let values = req.body;
    let query = values;
    let changes = {
        $set: {
            status: 1,
        }
    }
    Refervendor.updateOne(query, changes, { upsert: true }).lean().exec().then((UpdateStatus) => {
        console.log(UpdateStatus);
        res.send({
            code: 200,
            success: true,
            message: "Refer Vendor Deleted Success.",
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





///////////////
function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

module.exports = {
    refervendordetails,
    addrefervendor,
    Updaterefervendor,
    deleterefervendor,
    ExportVendorData
};