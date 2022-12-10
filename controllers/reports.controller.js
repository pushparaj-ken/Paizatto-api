const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode');
var User = require('../model/user');
let moment = require('moment');

let uuid = require('uuid');
var Transactions = require('../model/transaction')
let crypto = require('crypto');
let rand = require('csprng');

//const { response } = require('../app');
var Associate = require('../model/associate')
var AssociateOtp = require('../model/associateotp')
var GeneralSetting = require('../model/generalsetting');
var Categories = require('../model/category');
var Packages = require('../model/package');
var Levels = require('../model/level');
var Vendors = require('../model/vendor');
var Points = require('../model/point');
const vendor = require('../model/vendor');
const Payout = require('../model/payout');
const Transaction = require('../model/transaction');

const userController = require('../controllers/user.controller');
const Formatter = require('../services/formatter');
const Constants = require('../services/constants')

const excel = require("exceljs");
var fs = require('fs');
var path = require('path');
//const Categories = require('../model/category')

function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}
const CashbackReports = catchAsync(async(req, res) => {
    let values = req.body;
    let query = {}
    if (values.hasOwnProperty("username")) {
        query.username = values.username;
    }
    if (values.hasOwnProperty("status") && values.status != 0) {
        query.status = values.status;
    }
    // if(values.hasOwnProperty("transactionDate")){
    //     let split_date = values.transactionDate.split('-');
    //     let year = split_date[0];
    //     let month = split_date[1];
    //     let lastdate = daysInMonth (month, year);console.log(lastdate);
    //     let startDate = new Date(year, month-1, 01)
    //     let endDate = new Date(year, month, 1)
    //     query.transactionDate = {$gte:startDate.toISOString(),$lte:endDate.toISOString()}
    // }

    if (values.hasOwnProperty("from")) {
        let datesfrom = values.from.split('/');
        startDate = new Date(datesfrom[2], datesfrom[1] - 1, parseInt(datesfrom[0]) + 1)
    }
    if (values.hasOwnProperty("to")) {
        let datesto = values.to.split('/');
        endDate = new Date(datesto[2], datesto[1] - 1, parseInt(datesto[0]) + 1)
    }
    if (startDate != '' && endDate != '') {
        query.transactionDate = { $gte: startDate.toISOString(), $lte: endDate.toISOString() }
    }
    console.log("Payout Query------>", query)
    var newdata = new Array();
    Payout.find(query).lean().exec().then(async(Result) => {
        console.log("pau=--", Result)
        if (Result && Result != null) {
            if (Result.length > 0) {
                for (each in Result) {
                    if (Result[each].hasOwnProperty("transactionDate")) {
                        let currentFullYear = Result[each].transactionDate.getFullYear();
                        let currentDay = Result[each].transactionDate.getMonth();
                        if (currentDay < 10) {
                            currentDay = "0" + currentDay;
                        }
                        Result[each]["tran_date"] = Formatter.toDate(Result[each].transactionDate);
                        delete Result[each].transactionDate;
                        Result[each].cashbackmonth = currentFullYear.toString() + "-" + currentDay.toString();
                        if (Result[each].hasOwnProperty("status")) {
                            if (Result[each].status == 1) {
                                Result[each].status = "success"
                            } else if (Result[each].status == 2) {
                                Result[each].status = "pending"
                            } else if (Result[each].status == 3) {
                                Result[each].status = "failed"
                            }
                        }
                    }
                    let Data = {
                        "_id": Result[each]._id,
                        "username": Result[each].username,
                        "vendor": Result[each].vendor,
                        "category": Result[each].category,
                        "point": Result[each].points,
                        "amount": Formatter.toINR(Result[each].amount),
                        "status": Result[each].status,
                        "utrnumber": Result[each].utrnumber,
                        "createdAt": Result[each].createdAt,
                        "updatedAt": Result[each].updatedAt,
                        "transactionDate": Formatter.toDate(Result[each].transactionDate),
                        "cashbackmonth": Result[each].cashbackmonth,
                    }
                    newdata.push(Data);
                }
            }
            let filePath = await ExportCashbackReportsDataExcel(newdata);
            var fullPublicUrl = 'http://paizattoapi.paizatto.com/';
            let downloadurl = `${fullPublicUrl}${filePath}`
            res.send({
                success: true,
                code: 200,
                Status: "Cashback Reports Retrieved Success.",
                Data: newdata,
                downloadurl: downloadurl,
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

 

var ExportCashbackReportsDataExcel = async(data) => {
    console.log(data[0])
    try {
        const ALL_DOWNLINE_REPORT_FILES_PATH = path.resolve('public', 'export', 'cashback_data');
        if (!fs.existsSync(ALL_DOWNLINE_REPORT_FILES_PATH)) {
            fs.mkdirSync(ALL_DOWNLINE_REPORT_FILES_PATH, { recursive: true });
        }
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("cashback_data");
        worksheet.columns = [
            { header: "Username", key: "username", width: 25 },
            { header: "Vendor", key: "vendor", width: 25 },
            { header: "Category", key: "category", width: 25 },
            { header: "Amount", key: "amount", width: 25 },
            { header: "Points", key: "points", width: 25 },
            { header: "Status", key: "status", width: 25 },
            { header: "Utrnumber", key: "utrnumber", width: 25 },
            { header: "Date Time", key: "transactionDate", width: 25 },
            { header: "Cashbackmonth", key: "cashbackmonth", width: 25 },
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
        let fileName = `cashback_${filedate}.xlsx`;
        await workbook.xlsx.writeFile(path.resolve(ALL_DOWNLINE_REPORT_FILES_PATH, fileName));
        return `export/cashback_data/${fileName}`;
    } catch (err) {
        console.log('Error while generating Sales Summary Report', err);
    }

}

const ActiveInactiveReports = catchAsync(async(req, res) => {
    let values = req.body;
    //let userActiveInactive = await userController.GetUserActiveInactiveData(values);
    // if(values.hasOwnProperty("username") && values.username != '' && values.username != null && values.username != undefined){
    let UserData = await GetAssociateData(values);
    console.log("UserData--------------------->", UserData);
    let userActiveInactive = await GetUserActiveInactiveData({ 'username': UserData[0].username, Levels: UserData[0].Levels });
    let PayoutData = await GetAssociatePayoutDataForCurrentMonth(values);
    let UserCompleteData = UserData.map((item, i) => Object.assign({}, item, PayoutData[i]));
    let responseData = [];
    if (UserCompleteData.length > 0) {
        for (each in UserCompleteData) {
            let dataJSON = {};
            dataJSON.username = UserCompleteData[each].username;
            dataJSON.name = UserCompleteData[each].firstName + " " + UserCompleteData[each].lastName;
            dataJSON.Level = UserCompleteData[each].Levels[UserCompleteData[each].Levels.length - 1].name;
            if (UserCompleteData[each].hasOwnProperty("count")) {
                // if (UserCompleteData[each].count >= UserCompleteData[each].Levels[UserCompleteData[each].Levels.length - 1].min) {
                //     dataJSON.status = "Active."
                // } else {
                //     dataJSON.status = "Inactive."
                // }
                dataJSON.transactionDate = Formatter.toDate(UserCompleteData[each].transactionDate[UserCompleteData[each].transactionDate.length - 1]);
            } else {
                //dataJSON.status = "Inactive."
                dataJSON.transactionDate = "No Payout Information."
            }
            if (userActiveInactive.hasOwnProperty("statusName") && userActiveInactive.hasOwnProperty("status")) {
                dataJSON.status = userActiveInactive.status;
                dataJSON.statusName = userActiveInactive.statusName;
            }
            responseData.push(dataJSON);
        }
    }
    res.send({
        code: 200,
        success: true,
        Status: "Active Inactive Reports Retrieved Success.",
        data: responseData,
        "timestamp": new Date(),
    });
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
                    value.statusName = "approved"
                    value.status = 1;
                } else {
                    value.statusName = "pending"
                    value.status = 2;
                }

            } else {
                value.statusName = "pending"
                value.status = 2;
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

const GetAssociatePayoutDataForCurrentMonth = (values) => {
    let query = values;
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                let year = new Date().getFullYear();
                let month = new Date().getMonth() + 1;
                let startDate = new Date(year, month - 1, 01)
                let endDate = new Date(year, month, 1)
                query.transactionDate = { $gte: startDate, $lte: endDate }
                console.log(query);
                Transaction.aggregate([{
                            $match: query
                        },
                        {
                            $group: {
                                _id: "$username",
                                count: {
                                    $sum: "$points"
                                },
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
                    ])
                    .then((Result) => {
                        if (Result && Result != null) {
                            resolve(Result);
                        } else {
                            reject({
                                success: false,
                                code: 200,
                                Status: "No Payout Data Found.",
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

const GetAssociateData = (values) => {
    let query = values;
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                Associate.find(query, { 'username': 1, 'firstName': 1, 'lastName': 1, 'Levels': 1 }).lean().exec().then((Result) => {
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

const AggregateAssociatePayoutData = (values) => {
        console.log(values);
        let newvalues = JSON.parse(values);
        return new Promise((resolve, reject) => {
            //setImmediate(() => {
            try {
                console.log(newvalues);
                result = newvalues.reduce(function(r, a) {
                    r[a.username] = r[a.username] || [];
                    r[a.username].push(a);
                    return r;
                }, Object.create(null));
                resolve(result);
                console.log(result);
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
            // });
        });
    }
    //DownlinePoints1
const DownlinePoints1 = catchAsync(async(req, res) => {
    console.log("HHH")
    try {
        let values = req.body;
        let ResponseData = [];
        //Ladder Details
        let LadderInformation = await GetLadderInformation({ username: values.username });

        let onlyuserNamesLadder = {}
        let allChildren = [];
        let oldLadderArray = {};
        for (each in LadderInformation) {
            for (each1 in LadderInformation[each]) {
                oldLadderArray[LadderInformation[each][each1].username] = "Level- " + each;
                allChildren.push(LadderInformation[each][each1].username)
            }
            onlyuserNamesLadder[each] = oldLadderArray;
        }
        //console.log(LadderInformation);
        //Associate Details
        let BasicDetails = {};
        let AllDownlineBasicData = await Associate.find({ username: allChildren }, { '_id': 0, 'username': 1, 'firstName': 1, 'lastName': 1, 'Levels': 1 }).lean().exec();

        if (AllDownlineBasicData && AllDownlineBasicData.length > 0) {
            for (each in AllDownlineBasicData) {
                BasicDetails[AllDownlineBasicData[each].username] = {
                    "fullname": AllDownlineBasicData[each].firstName + " " + AllDownlineBasicData[each].lastName,
                    "Level": AllDownlineBasicData[each].Levels[AllDownlineBasicData[each].Levels.length - 1].name
                };
            }
        }
        //Transaction Details
        let payoutquery = {};
        let startDate = "";
        let endDate = "";
        if (values.hasOwnProperty("from")) {
            let datesfrom = values.from.split('/');
            startDate = new Date(datesfrom[2], datesfrom[1] - 1, datesfrom[0])
        }
        if (values.hasOwnProperty("to")) {
            let datesto = values.to.split('/');
            endDate = new Date(datesto[2], datesto[1] - 1, datesto[0])
        }
        if (startDate != '' && endDate != '') {
            payoutquery.transactionDate = { $gte: startDate, $lte: endDate }
        }
        if (values.hasOwnProperty("associate")) {
            payoutquery.username = [values.associate];
        } else {
            payoutquery.username = allChildren;
        }
        // console.log("payoutquery------>",payoutquery);
        //console.log("allChildren------>",allChildren);
        console.log(payoutquery);
        let alldownlineTransactionData = await Transaction.find(payoutquery, { '_id': 0, 'username': 1, 'transactionDate': 1, 'amount': 1, 'point': 1 }).sort({ "transactionDate": -1 }).lean().exec();
        // console.log("alldownlineTransactionData-------------------->",alldownlineTransactionData);
        if (alldownlineTransactionData && alldownlineTransactionData.length > 0) {
            for (each in alldownlineTransactionData) {
                let newJSON = {};
                let username = alldownlineTransactionData[each].username;
                newJSON.associateRegNumber = alldownlineTransactionData[each].username;
                newJSON.associateName = BasicDetails[username].fullname;
                newJSON.associateLevel = oldLadderArray[username];
                newJSON.dateTime = moment(alldownlineTransactionData[each].transactionDate).format('YYYY-MM-DD');
                newJSON.purchaseAmount = Formatter.toINR(alldownlineTransactionData[each].amount);
                newJSON.points = alldownlineTransactionData[each].point.toFixed(2);
                newJSON.level = BasicDetails[username].Level;
                if (values.hasOwnProperty("associateLevel")) {
                    if (newJSON.associateLevel == values.associateLevel) {
                        ResponseData.push(newJSON);
                    }
                } else {
                    ResponseData.push(newJSON);
                }
            }
        }
        let filePath = await ExportDownlineReportsDataExcel(ResponseData);
        var fullPublicUrl = 'http://paizattoapi.paizatto.com/';
        let downloadurl = `${fullPublicUrl}${filePath}`
        res.send({
            success: true,
            code: 200,
            status: "Downline report retrieved success.",
            downloadurl: downloadurl,
            data: ResponseData,
            "timestamp": new Date()
        });
    } catch (error) {
        console.log("error-----", error)
        res.send({
            success: false,
            code: 201,
            status: "Database Error.",
            data: error,
            "timestamp": new Date()
        })
    }
});

var ExportDownlineReportsDataExcel = async(data) => {
    console.log(data[0])
    try {
        const ALL_DOWNLINE_REPORT_FILES_PATH = path.resolve('public', 'export', 'downline_report');
        if (!fs.existsSync(ALL_DOWNLINE_REPORT_FILES_PATH)) {
            fs.mkdirSync(ALL_DOWNLINE_REPORT_FILES_PATH, { recursive: true });
        }
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("downline_report");
        worksheet.columns = [
            { header: "Username", key: "associateRegNumber", width: 25 },
            { header: "Associate Name", key: "associateName", width: 25 },
            { header: "Associate Level", key: "associateLevel", width: 25 },
            { header: "Date Time", key: "dateTime", width: 25 },
            { header: "Amount", key: "purchaseAmount", width: 25 },
            { header: "Points", key: "points", width: 25 },
            { header: "Level", key: "level", width: 25 },
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
        await workbook.xlsx.writeFile(path.resolve(ALL_DOWNLINE_REPORT_FILES_PATH, fileName));
        return `export/downline_report/${fileName}`;
    } catch (err) {
        console.log('Error while generating Sales Summary Report', err);
    }

}

const DownlinePoints = catchAsync(async(req, res) => {
    console.log("HHH")
    let values = req.body;
    let userQuery = {};
    let payoutquery = {};
    let parentQuery = {};
    if (values.hasOwnProperty("username")) {
        userQuery.username = values.username
        payoutquery.username = values.username
        parentQuery.username = values.username
    }
    if (values.hasOwnProperty("from") && values.hasOwnProperty("to")) {
        payoutquery.from = values.from;
        payoutquery.to = values.to;
    }
    //let LadderInformation = await GetLadderInformation({username:Constants.AssociateDefaultUsername});
    //let LadderInformation = await GetLadderInformation({username:values.username});
    let LadderInformation = await GetLadderInformation({ username: values.username });
    console.log("LadderInformation------->", LadderInformation);
    let LadderOfUser = "";
    for (each in LadderInformation) {
        let TraceIndex = LadderInformation[each].findIndex(field => {
            return field.username && field.username === values.username;
        });
        if (TraceIndex > -1) {
            LadderOfUser = "Level " + each;
        }
    }
    let UserData = await GetAssociateDataDownline(userQuery);
    //console.log("GetAssociateDataDownline---------->",UserData)
    let PayoutData = await GetAssociatePayoutData(payoutquery);
    //console.log("PayoutData------>",PayoutData)
    let UserCompleteData = UserData.map((item, i) => Object.assign({}, item, PayoutData[i]));
    let responseData = [];
    if (UserCompleteData.length > 0) {
        for (each in UserCompleteData) {
            let dataJSON = {};
            dataJSON.associateRegNumber = UserCompleteData[each].username;
            dataJSON.associateName = UserCompleteData[each].firstName + " " + UserCompleteData[each].lastName;
            dataJSON.associateLevel = UserCompleteData[each].Levels[UserCompleteData[each].Levels.length - 1].name;
            dataJSON.dateTime = Formatter.toDate(UserCompleteData[each].createdAt);
            if (UserCompleteData[each].hasOwnProperty("count")) {
                dataJSON.purchaseAmount = UserCompleteData[each].count;
            } else {
                dataJSON.purchaseAmount = 0;
            }
            dataJSON.level = LadderOfUser;
            //dataJSON.dateTime = "";
            responseData.push(dataJSON);
        }
    }
    let subUsers = UserData[0].sub;
    //console.log("subUserssubUserssubUserssubUsers",UserData);
    if (subUsers.length > 0) {
        for (each in subUsers) {
            let subuserData = await GetAssociateDataDownline({ username: subUsers[each] });
            payoutquery.username = subUsers[each];
            let subuserPayoutData = await GetAssociatePayoutData(payoutquery);
            let subuserUserCompleteData = subuserData.map((item, i) => Object.assign({}, item, subuserPayoutData[i]));
            //console.log("subuserUserCompleteData------->",subuserUserCompleteData)
            for (each in subuserUserCompleteData) {
                let dataJSON = {};
                dataJSON.associateRegNumber = subuserUserCompleteData[each].username;
                dataJSON.associateName = subuserUserCompleteData[each].firstName + " " + subuserUserCompleteData[each].lastName;
                dataJSON.associateLevel = subuserUserCompleteData[each].Levels[subuserUserCompleteData[each].Levels.length - 1].name;
                dataJSON.dateTime = Formatter.toDate(subuserUserCompleteData[each].createdAt);
                if (UserCompleteData[each].hasOwnProperty("count")) {
                    dataJSON.purchaseAmount = subuserUserCompleteData[each].count;
                } else {
                    dataJSON.purchaseAmount = 0;
                }
                dataJSON.level = LadderOfUser;
                //dataJSON.dateTime = "";
                responseData.push(dataJSON);
            }
        }
    }
    //console.log("SUb Data For User----->",UserData);
    res.send({
        "success": true,
        "code": 200,
        "data": responseData,
        "timestamp": new Date()
    });
});

const GetAssociatePayoutData = (values) => {
    let query = values;
    let newquery = {};
    let startDate = '';
    let endDate = '';
    if (query.hasOwnProperty("username")) {
        newquery.username = query.username;
    }
    if (query.hasOwnProperty("from")) {
        let datesfrom = values.from.split('/');
        startDate = new Date(datesfrom[2], datesfrom[1] - 1, datesfrom[0])
    }
    if (query.hasOwnProperty("to")) {
        let datesto = values.to.split('/');
        endDate = new Date(datesto[2], datesto[1] - 1, datesto[0])
    }
    if (startDate != '' && endDate != '') {
        newquery.transactionDate = { $gte: startDate, $lte: endDate }
    }
    //console.log("new query---->",newquery);
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                Transaction.aggregate([{
                            $match: newquery
                        },
                        {
                            $group: {
                                _id: "$username",
                                count: {
                                    $sum: "$amount"
                                }
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                username: "$_id",
                                count: 1
                            }
                        }
                    ])
                    .then((Result) => {
                        if (Result && Result != null) {
                            resolve(Result);
                        } else {
                            reject({
                                success: false,
                                code: 200,
                                Status: "No Payout Data Found.",
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

const GetAssociateDataDownline = (values) => {
    let query = values;
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                Associate.find(query, { 'username': 1, 'firstName': 1, 'lastName': 1, 'Levels': 1, 'createdAt': 1, 'sub': 1 }).lean().exec().then((Result) => {
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

const ReferralReport = catchAsync(async(req, res) => {
    try {
        let values = req.body;
        let UserData = await CheckWheatherUserExists(values);
        let ReferralData = await GetUserReferredData(values);
        console.log("ReferralData------>", ReferralData)
            //userController.CheckWheatherUserExists(values).then((UserData) => {
            // GetUserReferredData(values).then((ReferralData) => {
        let responseData = [];

        let count = 0;
        if (ReferralData.length > 0) {
            for (each in ReferralData) {
                let eachUser = {};
                if (ReferralData[each].hasOwnProperty("isActive") && ReferralData[each].isActive != '' && ReferralData[each].isActive == true) {
                    ReferralData[each].levelstatus = 1;
                } else {
                    ReferralData[each].levelstatus = 0;
                }
                count = count + 1;
                eachUser.associateRegNumber = ReferralData[each].username;
                eachUser.associateName = ReferralData[each].firstName + " " + ReferralData[each].lastName;
                eachUser.mobileNumber = ReferralData[each].phoneNumber;
                eachUser.city = ReferralData[each].Address.city;
                eachUser.pincode = ReferralData[each].Address.pincode;
                eachUser.referredby = values.username;
                eachUser.actualreferral = values.username;
                console.log("Referral Data----", ReferralData[each])
                if (ReferralData[each].levelstatus == 0) {
                    eachUser.status = "New User"
                }
                if (ReferralData[each].levelstatus == 1) {
                    eachUser.status = "Active"
                }

                if (values.hasOwnProperty("status")) {
                    if (ReferralData[each].levelstatus == values.status) {
                        responseData.push(eachUser);
                    } else {
                        responseData.push(eachUser);
                    }
                } else {
                    responseData.push(eachUser);
                }
                // if(ReferralData[each].status == 2){
                //     eachUser.status = "Inactive"
                // }
                // if(ReferralData[each].status == 3){
                //     eachUser.status = "Blocked"
                // }
            }
        }
        //console.log(res);
        let filePath = await ExportReferralReportsDataExcel(responseData);
        var fullPublicUrl = 'http://paizattoapi.paizatto.com/';
        let downloadurl = `${fullPublicUrl}${filePath}`
            //if(count == ReferralData.length){
        res.send({
            'code': 200,
            'status': 'success',
            'message': 'Referral Data Retrieved Success.',
            'downloadurl': downloadurl,
            'data': responseData,
            'timestamp': new Date()
        });
        //}
        // }).catch(err => res.json(err));
        //}).catch(err => res.json(err));
    } catch (error) {
        console.log(error)
        res.send(error)
    }
});


var ExportReferralReportsDataExcel = async(data) => {
    console.log("data" + data[0])
    try {
        const ALL_DOWNLINE_REPORT_FILES_PATH = path.resolve('public', 'export', 'referraldata');
        if (!fs.existsSync(ALL_DOWNLINE_REPORT_FILES_PATH)) {
            fs.mkdirSync(ALL_DOWNLINE_REPORT_FILES_PATH, { recursive: true });
        }
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("referraldata");
        worksheet.columns = [
            { header: "Username", key: "associateRegNumber", width: 25 },
            { header: "Associate Name", key: "associateName", width: 25 },
            { header: "Associate Phone No", key: "mobileNumber", width: 25 },
            { header: "City", key: "city", width: 25 },
            { header: "Pincode", key: "pincode", width: 25 },
            { header: "Referred By", key: "referredby", width: 25 },
            { header: "Actual Referral", key: "actualreferral", width: 25 },
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
        let fileName = `Referral_${filedate}.xlsx`;
        await workbook.xlsx.writeFile(path.resolve(ALL_DOWNLINE_REPORT_FILES_PATH, fileName));
        return `export/referraldata/${fileName}`;
    } catch (err) {
        console.log('Error while generating Sales Summary Report', err);
    }

}


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

const GetUserReferredData = (values) => {
    let query = {
        'referrer.referralid': values.username
    };
    console.log("test2" + values.username);
    let startDate = '';
    let endDate = '';
    if (values.hasOwnProperty("from")) {
        let datesfrom = values.from.split('/');
        startDate = new Date(datesfrom[2], datesfrom[1] - 1, parseInt(datesfrom[0]) + 1)
    }
    if (values.hasOwnProperty("to")) {
        let datesto = values.to.split('/');
        endDate = new Date(datesto[2], datesto[1] - 1, parseInt(datesto[0]) + 1)
    }
    if (startDate != '' && endDate != '') {
        query.createdAt = { $gte: startDate.toISOString(), $lte: endDate.toISOString() }
    }
    console.log("test" + query);
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                Associate.find(query, {
                    '_id': 0,
                    'username': 1,
                    'firstName': 1,
                    'lastName': 1,
                    'phoneNumber': 1,
                    'Address.city': 1,
                    'Address.pincode': 1,
                    'status': 1,
                    'referrer.referralid': 1,
                    'parentId': 1,
                    'isActive': 1
                }).lean().exec().then((Result) => {
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

const PurchaseReport = catchAsync(async(req, res) => {
    try {
        let values = req.body;
        let AllCategories = await Categories.find().sort({ 'name': 1 }).lean().exec();
        let catJSON = {}
        for (each in AllCategories) {
            if (AllCategories[each].hasOwnProperty("id") && AllCategories[each].hasOwnProperty("name")) {
                let catId = AllCategories[each].id;
                let catName = AllCategories[each].name;
                console.log(catId);
                console.log(catName)
                catJSON[catId] = catName;
            }
        }
        //console.log("catJSON----->",catJSON)
        let UserData = await CheckWheatherUserExists(values);
        let PurchaseData = await GetPurchaseDataofUser(values);
        console.log("Purchase Data Of User------>", PurchaseData)
        let responseData = [];
        if (PurchaseData.length > 0) {
            for (each in PurchaseData) {
                let eachTransaction = {};
                eachTransaction.dateTime = Formatter.toDate(PurchaseData[each].transactionDate);
                eachTransaction.vendor = PurchaseData[each].vendor_details[0].firstName + " " + PurchaseData[each].vendor_details[0].lastName;
                eachTransaction.purchaseAmount = Formatter.toINR(PurchaseData[each].amount);
                eachTransaction.pointsGenerated = PurchaseData[each].point.toFixed(2);
                eachTransaction.category = catJSON[PurchaseData[each].category];
                if (PurchaseData[each].vendor_details[0].hasOwnProperty("Membership")) {
                    eachTransaction.shopType = PurchaseData[each].vendor_details[0].Membership.name
                }

                if (values.hasOwnProperty("shopType") && values.shopType != '' && values.shopType != null && values.shopType != undefined) {
                    console.log(typeof(PurchaseData[each].category))
                    console.log(typeof(values.shopType))
                    if (PurchaseData[each].category == values.shopType) {
                        responseData.push(eachTransaction);
                    }
                } else {
                    responseData.push(eachTransaction);
                }
            }
        }
        if (responseData.length > 0) {
            let filePath = await ExportPurchaseReportDataExcel(responseData);
            var fullPublicUrl = 'http://paizattoapi.paizatto.com/';
            let downloadurl = `${fullPublicUrl}${filePath}`
            res.send({
                success: true,
                code: 200,
                downloadurl: downloadurl,
                data: responseData,
                Status: "Data retrieved success.",
                "timestamp": new Date()
            });
        } else {
            res.send({
                success: true,
                code: 200,
                data: [],
                Status: "No Data Found.",
                "timestamp": new Date()
            });
        }
    } catch (err) {
        res.send(err)
    }
});

var ExportPurchaseReportDataExcel = async(data) => {
    console.log(data[0])
    try {
        const ALL_PURCHASE_REPORT_FILES_PATH = path.resolve('public', 'export', 'purchasereport');
        if (!fs.existsSync(ALL_PURCHASE_REPORT_FILES_PATH)) {
            fs.mkdirSync(ALL_PURCHASE_REPORT_FILES_PATH, { recursive: true });
        }
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("purchasereport");
        worksheet.columns = [
            { header: "Date", key: "dateTime", width: 25 },
            { header: "Vendor", key: "vendor", width: 25 },
            { header: "Purchase Amount", key: "purchaseAmount", width: 25 },
            { header: "Points Earned", key: "pointsGenerated", width: 25 }, 
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
        let fileName = `Purchasereport_${filedate}.xlsx`;
        await workbook.xlsx.writeFile(path.resolve(ALL_PURCHASE_REPORT_FILES_PATH, fileName));
        return `export/purchasereport/${fileName}`;
    } catch (err) {
        console.log('Error while generating Sales Summary Report', err);
    }

}

const GetPurchaseDataofUser = (values) => {
    console.log("Values", values);
    let query = {
        'username': values.username
    };
    let startDate = '';
    let endDate = '';
    if (values.hasOwnProperty("from")) {
        let datesfrom = values.from.split('/');
        startDate = new Date(datesfrom[2], datesfrom[1] - 1, datesfrom[0])
    }
    if (values.hasOwnProperty("to")) {
        let datesto = values.to.split('/');
        endDate = new Date(datesto[2], datesto[1] - 1, datesto[0])
    }
    if (startDate != '' && endDate != '') {
        query.transactionDate = { $gte: startDate, $lte: endDate }
    }
    if (values.hasOwnProperty("status")) {
        if (values.status == 1) {
            query.status = 0
        }
        if (values.status == 2) {
            query.status = 1
        }
    }
    // console.log("Query Purchgase----------->",query)
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                Transaction.aggregate([{
                        $match: query
                    },
                    {
                        $lookup: {
                            from: "vendors",
                            localField: "vendor",
                            foreignField: "username",
                            as: "vendor_details",
                        }
                    }
                ]).then((Result) => {
                    if (Result) {
                        //console.log("hsjfhoishfihsdfnoksdnfokneokfoi",Result)
                        resolve(Result)
                    } else {
                        reject({
                            success: false,
                            code: 201,
                            Status: "Phone Number  Username Doesn't Exist.",
                            "timestamp": new Date()
                        });
                    }
                }).catch((err) => {
                    console.log("err" + err);
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

const LevelReport = catchAsync(async(req, res) => {
    let values = req.body;
    CheckWheatherUserExists(values).then((UserData) => {
        GetLadderInformation(values).then((LadderData) => {
            //LadderData = JSON.parse(LadderData);
            var Ladders = [];
            for (var k in LadderData) Ladders.push(k);
            let all_Levels = [];
            let ResponseData = [];
            if (Ladders.length > 0) {
                for (each in Ladders) {
                    let eachJSON = {};
                    eachJSON.level = "Level " + Ladders[each];
                    eachJSON.totalSlots = Math.pow(3, parseInt(Ladders[each]));
                    eachJSON.numberOfAssociates = LadderData[Ladders[each]].length;
                    console.log("Total--->", eachJSON.totalSlots);
                    console.log("Total--->", eachJSON.totalSlots);
                    eachJSON.availableSlots = parseInt(eachJSON.totalSlots) - parseInt(eachJSON.numberOfAssociates);
                    ResponseData.push(eachJSON);
                }
            }
            res.send({
                success: true,
                code: 200,
                Data: ResponseData,
                Status: "Levels Report retrieved successfully",
                "timestamp": new Date()
            });
        }).catch((err) => {
            console.log(err);
            reject({
                success: false,
                code: 201,
                Status: "Phone Number or Username Doesn't Exist.",
                "timestamp": new Date()
            });
        })
    }).catch(err => res.json(err));
});

//const GetLadderInformation  = async(values) => {
const GetLadderInformation = async(values) => {

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
        //});
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
    CashbackReports,
    ActiveInactiveReports,
    DownlinePoints,
    ReferralReport,
    PurchaseReport,
    LevelReport,
    GetLadderInformation,

    GetAssociatePayoutDataForCurrentMonth,
    DownlinePoints1
};