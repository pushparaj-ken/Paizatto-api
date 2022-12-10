var express = require('express');
var router = express.Router();
const jwt_decode = require('jwt-decode');
var User = require('../model/user')
//const adminController = require('../controllers/admin.controller');
const userController = require('../controllers/user.controller');

var cors = require('cors');

const multer = require("multer");

const upload = multer({});

// use it before all route definitions
router.use(cors({ origin: ['http://localhost:8080','http://paizattoteam.paizatto.com','http://admopal.paizatto.com','http://paizattoadmin.paizatto.com'] }));

/* Public Routes */
router.post('/getPincodeAutofill', userController.AutocompletionServiceGetPredictions)

router.post('/register', userController.register_associate)

router.post('/sendOTP', userController.SendOTPAssociate)

router.post('/verifyOTP', userController.VerifyOTPAssociate)

//Commented Login API to Update the API
//router.post('/loginAssociate', userController.LoginAssociate)

router.post('/forgotPassword', userController.forgotPassword)

router.post('/validateReferralID', userController.ValidateReferralIdAPI)

router.post('/validateReferralUID', userController.ValidateReferralUIdAPI)

router.post('/profile', userController.UpdatePersonalDetailsAssociate)

router.post('/getprofile', userController.GetAssociateDetails)

//router.post('/kyc', upload.fields([{name: 'aadhar', maxCount: 1}, {name: 'pan', maxCount: 1}]), userController.UpdateAssociateKYC)

router.post('/kyc', upload.fields([{name:'aadhar', maxCount: 1}, {name:'pan', maxCount: 1}]), userController.UpdateAssociateKYC)

router.post('/ifsc', userController.GetBankDetailsWithIFSC)

router.post('/updatepassword', userController.UpdateAssociatePassword)

router.post('/verify', userController.VerifyPhoneNumberExistsAlready)

router.post('/login', userController.LoginAssociate)

router.post('/otplogin', userController.OTPLoginAssociate)

router.post('/getallvendors', userController.GetAllVendors);

router.post('/upgradelevel', userController.UpgradeLevel);

router.post('/gynealogy1', userController.Gynealogy);
//Need to remove this dummy one in future
router.post('/gynealogy', userController.Gynealogy);

router.post('/gynealogyweb', userController.GynealogyWeb);

router.post('/dashboard', userController.DashboardAssociate);

router.post('/faq', userController.FAQAssoiate);

router.post('/contactus', userController.ContactUsAssoiate);

router.post('/add-children', userController.addChild)
router.get('/all-children', userController.getAllChildren)

router.post('/getlevel', userController.GetAssociateLevelInformation);

router.get('/active-count', userController.getActiveCount )
router.get('/earned-points', userController.getEarnedPoints)
router.get('/earned-points-level', userController.getEarnedPointsWithLevel)

router.post('/sendnotificatons', userController.SendNotification)

router.post('/getcategories', userController.GetVendorRegisteredCategories);

router.get('/getmembership', userController.GetAllMemberships);

router.post('/sendotpcode', userController.SendOTPCodeAssociate);

router.post('/verifyotpcode', userController.VerifyOTPCodeAssociate);

router.post('/getVendor', userController.GetVendorProfileDetails);

router.get('/isliders', userController.sliderdetails); 

router.post('/addisliders', userController.addsliderdetails); 

router.post('/readnotificatons', userController.ReadNotification)

router.post('/allnotificatons', userController.GetAllNotification)

router.post('/downlinereport', userController.DownlineReportOfUser)

router.post('/overallearnback', userController.OverallEarnback)

router.post('/dashboard', userController.dashboard);

router.post('/listallVendor', userController.ListAllVendorAdmin);

router.get('/categorylist', userController.categorylist); 

router.post('/isfavourite', userController.isfavourite); 

router.get('/isfavourite', userController.isfavouritedetails); 

//router.get('/usertranscation', userController.usertranscationdetails); 

//router.get('/userreferrals', userController.userreferralsdetails); 


router.get('/', function(req, res, next) {
    res.send({
        message: "Welcome"
    })
});



module.exports = router;