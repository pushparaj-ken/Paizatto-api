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

const excel = require("exceljs");
var fs = require('fs');
var path = require('path');

var area = require('../model/area');
var district = require('../model/district')
const Pincode = require('../model/pincode')


const areadetails = catchAsync(async(req, res) => {
    let values = req.query;
    let query = values;
    query.status = 0;
    var newdata = new Array();
    area.find(query).sort({ 'name': 1 }).lean().exec().then(async(Result) => {
        for (let i = 0; i < Result.length; i++) {
            var record = await district.find({ id: Result[i].districtid }).lean().exec().then();
            if (record != undefined && record != null && record != '') {
                var districtname = record[0].name;
            } else {
                var districtname = "-";
            }
            let Data = {
                "id": Result[i].id,
                "name": Result[i].name,
                "orderBy": Result[i].orderBy,
                "status": Result[i].status,
                "districtid": Result[i].districtid,
                "districtname": districtname,
                "createdAt": Result[i].createdAt,
                "updatedAt": Result[i].updatedAt,
                "updatedBy": Result[i].updatedBy,
            };
            newdata.push(Data);
        }
        let filePath = await AreaDetailsReportsDataExcel(newdata);
        var fullPublicUrl = 'http://paizattoapi.paizatto.com/';
        let downloadurl = `${fullPublicUrl}${filePath}`
        if (newdata && newdata.length > 0) {
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
    }).catch((err) => {
        res.send({
            code: 201,
            success: false,
            message: "DATABASE_ERROR.",
            timestamp: new Date()
        });
    })
});


var AreaDetailsReportsDataExcel = async(data) => {
    console.log(data[0])
    try {
        const ALL_DOWNLINE_REPORT_FILES_PATH = path.resolve('public', 'export', 'area_details_report_data');
        if (!fs.existsSync(ALL_DOWNLINE_REPORT_FILES_PATH)) {
            fs.mkdirSync(ALL_DOWNLINE_REPORT_FILES_PATH, { recursive: true });
        }
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("area_details_report_data");
        worksheet.columns = [
            { header: "	Area Name", key: "name", width: 25 },
            { header: "	District Name", key: "districtname", width: 25 },
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
        let fileName = `area_details_report_data${filedate}.xlsx`;
        await workbook.xlsx.writeFile(path.resolve(ALL_DOWNLINE_REPORT_FILES_PATH, fileName));
        return `export/area_details_report_data/${fileName}`;
    } catch (err) {
        console.log('Error while generating Sales Summary Report', err);
    }

}

const addarea = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.name != '' && values.name != null && values.name != undefined) {
        var Previousarea = await area.findOne().sort('-id').lean().exec();
        var CheckAreaExists = await area.findOne({ name: values.name }).sort('-id').lean().exec();
        if (CheckAreaExists && CheckAreaExists != null && CheckAreaExists != undefined && CheckAreaExists.hasOwnProperty("id")) {
            res.send({
                code: 201,
                success: false,
                status: "Area exists already.",
                data: CheckAreaExists,
                timestamp: new Date()
            });
        } else {
            let id = 1;
            if (Previousarea && Previousarea.hasOwnProperty('id')) {
                id = Previousarea.id + 1;
            } else {
                id = id;
            }
            let Data = {
                id: id,
                districtid: values.districtid,
                name: values.name,
                status: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
            if (values.hasOwnProperty("createdBy")) {
                Data.createdBy = values.createdBy
            } else {
                Data.createdBy = "Admin"
            }
            if (values.hasOwnProperty("orderBy")) {
                Data.orderBy = values.orderBy
            } else {
                Data.orderBy = Previousarea.orderBy + 1;
            }
            await area(Data).save().then((Result) => {
                res.send({
                    success: true,
                    code: 200,
                    data: Result,
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
        }
    } else {
        res.send({
            code: 201,
            success: false,
            status: "All Fields are Mandatory",
            timestamp: new Date()
        });
    }
});

const Updatearea = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("id") && values.id != '' && values.id != null && values.id != undefined) {
        let query = {
            id: values.id
        }
        if (values.hasOwnProperty("name") && values.name != '' && values.name != null && values.name != undefined) {
            var CheckAreaExists = await area.findOne({ name: values.name }).sort('-id').lean().exec();
            if (CheckAreaExists && CheckAreaExists != null && CheckAreaExists != undefined && CheckAreaExists.hasOwnProperty("id")) {
                delete values.name;
            }
        }
        values.updatedAt = new Date();
        if (values.hasOwnProperty("updatedBy")) {

        } else {
            values.updatedBy = "Admin"
        }
        let changes = {
            $set: values
        }
        let CheckIdExists = await area.findOne({ id: values.id }).sort('-id').lean().exec();
        if (CheckIdExists && CheckIdExists != null && CheckIdExists != undefined && CheckIdExists.hasOwnProperty("id")) {
            await area.updateOne(query, changes, { upsert: false }).lean().exec().then((UpdateStatus) => {
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
                message: "Invalid Id.",
                timestamp: new Date()
            });
        }
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
const deletearea = catchAsync(async(req, res) => {
    let values = req.body;
    console.log(values);
    if (values.hasOwnProperty("id") && values.id != '' && values.id != null && values.id != undefined) {
        let query = { id: values.id };
        values.updatedAt = new Date();
        if (values.hasOwnProperty("updatedBy")) {

        } else {
            values.updatedBy = "Admin"
        }
        let changes = {
            $set: {
                status: 1,
                updatedAt: values.updatedAt,
                updatedBy: values.updatedBy
            }
        }
        console.log(changes)
        await area.updateOne(query, changes, { upsert: false }).lean().exec().then((UpdateStatus) => {
            console.log(UpdateStatus);
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
            message: "Id is mandatory to delete area.",
            timestamp: new Date()
        });
    }
});

const adddistrict = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.name != '' && values.name != null && values.name != undefined) {
        var Previousarea = await district.findOne().sort('-id').lean().exec();
        var CheckAreaExists = await district.findOne({ name: values.name }).sort('-id').lean().exec();
        if (CheckAreaExists && CheckAreaExists != null && CheckAreaExists != undefined && CheckAreaExists.hasOwnProperty("id")) {
            res.send({
                code: 201,
                success: false,
                status: "District exists already.",
                data: CheckAreaExists,
                timestamp: new Date()
            });
        } else {
            let id = 1;
            if (Previousarea && Previousarea.hasOwnProperty('id')) {
                id = Previousarea.id + 1;
            } else {
                id = id;
            }
            let Data = {
                id: id,
                name: values.name,
                status: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
            if (values.hasOwnProperty("createdBy")) {
                Data.createdBy = values.createdBy
            } else {
                Data.createdBy = "Admin"
            }
            if (values.hasOwnProperty("orderBy")) {
                Data.orderBy = values.orderBy
            } else {
                Data.orderBy = Previousarea.orderBy + 1;
            }
            await district(Data).save().then((Result) => {
                res.send({
                    success: true,
                    code: 200,
                    data: Result,
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
        }
    } else {
        res.send({
            code: 201,
            success: false,
            status: "All Fields are Mandatory",
            timestamp: new Date()
        });
    }
});

const districtdetails = catchAsync(async(req, res) => {
    let values = req.query;
    let query = values;
    await district.find(query).sort({ 'name': 1 }).lean().exec().then((Result) => {
        console.log(Result.length);
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

const districtarea = catchAsync(async(req, res) => {
    let values = req.body;

    var newdata = new Array();
    area.find({ "districtid": values.districtid, "status": 0 }).sort().lean().exec().then(async(Result) => {
        for (let i = 0; i < Result.length; i++) {
            var record = await district.find({ id: Result[i].districtid }).lean().exec().then();
            let Data = {
                "id": Result[i].id,
                "name": Result[i].name,
                "orderBy": Result[i].orderBy,
                "status": Result[i].status,
                "districtid": Result[i].districtid,
                "districtname": record[0].name,
                "createdAt": Result[i].createdAt,
                "updatedAt": Result[i].updatedAt,
                "updatedBy": Result[i].updatedBy,
            };
            newdata.push(Data);
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
                success: true,
                message: "No Data exists.",
                data: newdata,
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

const Updatedistrict = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("id") && values.id != '' && values.id != null && values.id != undefined) {
        let query = {
            id: values.id
        }
        if (values.hasOwnProperty("name") && values.name != '' && values.name != null && values.name != undefined) {
            var CheckAreaExists = await district.findOne({ name: values.name }).sort('-id').lean().exec();
            if (CheckAreaExists && CheckAreaExists != null && CheckAreaExists != undefined && CheckAreaExists.hasOwnProperty("id")) {
                delete values.name;
            }
        }
        values.updatedAt = new Date();
        if (values.hasOwnProperty("updatedBy")) {

        } else {
            values.updatedBy = "Admin"
        }
        let changes = {
            $set: values
        }
        let CheckIdExists = await district.findOne({ id: values.id }).sort('-id').lean().exec();
        if (CheckIdExists && CheckIdExists != null && CheckIdExists != undefined && CheckIdExists.hasOwnProperty("id")) {
            await district.updateOne(query, changes, { upsert: false }).lean().exec().then((UpdateStatus) => {
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
                message: "Invalid Id.",
                timestamp: new Date()
            });
        }
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


const deletedistrict = catchAsync(async(req, res) => {
    let values = req.body;
    console.log(values);
    if (values.hasOwnProperty("id") && values.id != '' && values.id != null && values.id != undefined) {
        let query = { id: values.id };
        values.updatedAt = new Date();
        if (values.hasOwnProperty("updatedBy")) {

        } else {
            values.updatedBy = "Admin"
        }
        let changes = {
            $set: {
                status: 1,
                updatedAt: values.updatedAt,
                updatedBy: values.updatedBy
            }
        }
        console.log(changes)
        await district.updateOne(query, changes, { upsert: false }).lean().exec().then((UpdateStatus) => {
            console.log(UpdateStatus);
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
            message: "Id is mandatory to delete area.",
            timestamp: new Date()
        });
    }
});

const pincodedetails = catchAsync(async(req, res) => {
    let values = req.query;
    let query = values;
    await Pincode.find(query).sort({ 'name': 1 }).lean().exec().then((Result) => {
        console.log(Result.length);
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

const addpincode = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.pincode != '' && values.pincode != null && values.pincode != undefined
    && values.cityname != '' && values.cityname != null && values.cityname != undefined
    ) {
        var Previouspincode = await Pincode.findOne().sort('-id').lean().exec();
        var CheckPincodeExists = await Pincode.findOne({ pincode: values.pincode }).sort('-id').lean().exec();
        if (CheckPincodeExists && CheckPincodeExists != null && CheckPincodeExists != undefined && CheckPincodeExists.hasOwnProperty("id")) {
            res.send({
                code: 201,
                success: false,
                status: "Pincode exists already.",
                data: CheckPincodeExists,
                timestamp: new Date()
            });
        } else {
            let id = 1;
            if (Previouspincode && Previouspincode.hasOwnProperty('id')) {
                id = Previouspincode.id + 1;
            } else {
                id = id;
            }
            let Data = {
                id: id,
                pincode: values.pincode,
                cityname: values.cityname,
                status: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
            if (values.hasOwnProperty("createdBy")) {
                Data.createdBy = values.createdBy
            } else {
                Data.createdBy = "Admin"
            }
           
            await Pincode(Data).save().then((Result) => {
                res.send({
                    success: true,
                    code: 200,
                    data: Result,
                    Status: " Pincode Saved Success",
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
        }
    } else {
        res.send({
            code: 201,
            success: false,
            status: "All Fields are Mandatory",
            timestamp: new Date()
        });
    }
});

const Updatepincode = catchAsync(async(req, res) => {
    let values = req.body;
    if (values.hasOwnProperty("id") && values.id != '' && values.id != null && values.id != undefined) {
        let query = {
            id: values.id
        }
        if (values.hasOwnProperty("pincode") && values.pincode != '' && values.pincode != null && values.pincode != undefined) {
            var CheckPincodeExists = await Pincode.findOne({ pincode: values.pincode }).sort('-id').lean().exec();
            if (CheckPincodeExists && CheckPincodeExists != null && CheckPincodeExists != undefined && CheckPincodeExists.hasOwnProperty("id")) {
                delete values.pincode;
            }
        }
        values.updatedAt = new Date();
        if (values.hasOwnProperty("updatedBy")) {

        } else {
            values.updatedBy = "Admin"
        }
        let changes = {
            $set: values
        }
        let CheckIdExists = await Pincode.findOne({ id: values.id }).sort('-id').lean().exec();
        if (CheckIdExists && CheckIdExists != null && CheckIdExists != undefined && CheckIdExists.hasOwnProperty("id")) {
            await Pincode.updateOne(query, changes, { upsert: false }).lean().exec().then((UpdateStatus) => {
                res.send({
                    code: 200,
                    success: true,
                    message: "Pincode Update Success.",
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
                message: "Invalid Id.",
                timestamp: new Date()
            });
        }
    } else {
        res.send({
            code: 201,
            success: false,
            message: "Id required to update pincode.",
            data: {},
            timestamp: new Date()
        });
    }
});


const deletepincode = catchAsync(async(req, res) => {
    let values = req.body;
    console.log(values);
    if (values.hasOwnProperty("id") && values.id != '' && values.id != null && values.id != undefined) {
        let query = { id: values.id };
        values.updatedAt = new Date();
        if (values.hasOwnProperty("updatedBy")) {

        } else {
            values.updatedBy = "Admin"
        }
        let changes = {
            $set: {
                status: 1,
                updatedAt: values.updatedAt,
                updatedBy: values.updatedBy
            }
        }
        console.log(changes)
        await Pincode.updateOne(query, changes, { upsert: false }).lean().exec().then((UpdateStatus) => {
            console.log(UpdateStatus);
            res.send({
                code: 200,
                success: true,
                message: "Pincode Deleted Success.",
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
            message: "Id is mandatory to delete pincode.",
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
    areadetails,
    addarea,
    Updatearea,
    deletearea,

    adddistrict,
    districtdetails,
    Updatedistrict,
    deletedistrict,

    districtarea,

    pincodedetails,
    addpincode,
    Updatepincode,
    deletepincode
};