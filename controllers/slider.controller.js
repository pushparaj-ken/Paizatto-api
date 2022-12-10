const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync'); 


var sliders = require('../model/slider'); 
var isliders = require('../model/islider')

const sliderdetails = catchAsync(async (req, res) => {
    let values = req.body
    sliders.find(values).lean().exec().then((Result) => {
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

const addsliderdetails = catchAsync(async (req, res) => {
    let values = req.body; 
        var Previouspoints = await sliders.findOne().sort('-id').lean().exec(); 
        let id = 1;
        if(Previouspoints && Previouspoints.hasOwnProperty('id')){
            id = Previouspoints.id + 1;
        }else{
            id = id;
        }
        let Data = {
            id : id ,
            image: values.image,
            deeplink: values.deeplink,  
            createdAt: new Date(),
            updatedAt: new Date(),
            lastModifiedAt: new Date(),
            LastModifiedBy: '',

        }
        sliders(Data).save().then((Result) => {
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

const isliderdetails = catchAsync(async (req, res) => {
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

const addisliderdetails = catchAsync(async (req, res) => {
    let values = req.body; 
        var Previouspoints = await isliders.findOne().sort('-id').lean().exec(); 
        let id = 1;
        if(Previouspoints && Previouspoints.hasOwnProperty('id')){
            id = Previouspoints.id + 1;
        }else{
            id = id;
        }
        let Data = {
            id : id ,
            image: values.image,
            deeplink: values.deeplink,  
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

///////////////
function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
 
module.exports = {
    sliderdetails, 
    addsliderdetails,
    isliderdetails, 
    addisliderdetails
    
};