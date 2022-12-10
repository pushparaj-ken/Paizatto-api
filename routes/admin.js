var express = require('express');
var router = express.Router();
const adminController = require('../controllers/admin.controller');
const userController = require('../controllers/user.controller');

var cors = require('cors');
router.use(cors({ origin: ['http://localhost:8080','http://paizattoteam.paizatto.com','http://admopal.paizatto.com','http://paizattoadmin.paizatto.com'] }));

const multer = require("multer");

const upload = multer({});

//router.post('/registerAssociateAdmin', adminController.register_associate)

//router.post('/deleteAssociateAdmin', adminController.delete_associate)

router.post('/generalsettings', adminController.AddOrUpdateGeneralSettings);
 
router.post('/GetAllgeneralsettings', adminController.GetAllGeneralSettings);

router.post('/deletegeneralsettings', adminController.DeleteGeneralSettings);

router.post('/categories', adminController.AddOrUpdateCategories);

router.post('/updatecategories', adminController.UpdateCategories);

router.post('/GetAllcategories', adminController.GetAllCategories);

router.post('/deletecategories', adminController.DeleteCategories);

router.post('/packages', adminController.AddOrUpdatePackages);

router.post('/GetAllpackages', adminController.GetAllPackages);

router.post('/deletepackages', adminController.DeletePackages);

router.post('/levels', adminController.AddOrUpdateLevels);

router.post('/GetAlllevels', adminController.GetAllLevels);

router.post('/deletelevels', adminController.DeleteLevels);

router.post('/UserCheckNetwork', adminController.UserCheckNetwork);

router.post('/InsertPoints', adminController.InsertPoints);

router.post('/CashbackCall', adminController.CashbackCall);

router.post('/SendCashback', adminController.SendCashback);

//router.post('/billing', adminController.billing);

router.post('/billing', adminController.billing1);

//router.post('/dashboard', adminController.dashboard);

//User API's
router.post('/registerAssociate', adminController.RegisterAssociateAdmin);

router.post('/getAssociate', adminController.GetAssociatePersonalDetailsAssociateAdmin);

router.post('/getAssociateBank', adminController.GetAssociatePersonalDetailsAssociateAdminBank);

router.post('/updateAssociate', adminController.UpdatePersonalDetailsAssociateAdmin);

router.post('/kyc', upload.fields([{name:'aadhar', maxCount: 1}, {name:'pan', maxCount: 1}]), adminController.UpdateAssociateKYCAdmin)

router.post('/deleteAssociate', adminController.DeleteAssociateAdmin);

router.post('/listallAssociate', adminController.ListAllAssociateAdmin);

//Vendor

router.post('/registerVendor', adminController.RegisterVendorAdmin);

router.post('/updateVendor', adminController.UpdateVendorAdmin);

router.post('/deleteVendor', adminController.DeleteVendorAdmin);

router.post('/listallVendor', adminController.ListAllVendorAdmin);

router.post('/getVendor', adminController.GetVendorProfileDetails);

router.post('/vendorkyc', upload.fields([{name:'pan', maxCount: 1}, {name:'gst', maxCount: 1}, {name:'kyc', maxCount: 1}]), adminController.UpdateVendorKYCAdmin)

router.post('/updateshop', upload.fields([{name:'shop', maxCount: 10}, {name:'offers', maxCount: 10}, {name:'sliders', maxCount: 10}, {name:'QRCode', maxCount: 1}, {name:'featuredImage', maxCount: 1}]), adminController.UpdateShopDetailsAdmin)

//Product APIS
router.post('/addproduct', adminController.AddProductInAdmin);

router.post('/getproducts', adminController.GetProductInAdmin);

router.post('/updateproducts', adminController.UpdateProductInAdmin);


//Reports
router.post('/associatereport', adminController.AssociateReport);

router.post('/activeinactivereport', adminController.AssociateActiveInactiveReport);

router.post('/blankbankdetails', adminController.AssociateBlankBankDetailsReport);

router.post('/sendvendorapplink', adminController.SendVendorAppLink);

router.post('/sendassociateapplink', adminController.SendAssociateAppLink);

router.post('/vendorbankupdate', adminController.VendorBankUpdateSMS);

router.post('/associatebankupdate', adminController.AssociateBankUpdateSMS);

//User API's
router.post('/adduser', adminController.AddUserInAdmin);

router.post('/getuser', adminController.GetUsersInAdmin);

router.post('/updateuser', adminController.UpdateUserInAdmin);

router.post('/activeinactiveuser', adminController.ActiveInactiveUserInAdmin);

router.post('/loginuser', adminController.LoginUserInAdmin);

//Menu API's
router.post('/addmenu', adminController.AddMenuInAdmin);

router.post('/getmenu', adminController.GetMenuInAdmin);

router.post('/updatemenu', adminController.UpdateMenuInAdmin);

//Roles API's
router.post('/addrole', adminController.AddRoleInAdmin);

router.post('/getrole', adminController.GetRoleInAdmin);

router.post('/updaterole', adminController.UpdateRoleInAdmin);

router.post('/exportvendor', adminController.ExportVendorData);

router.post('/getvendoremployeemobile', adminController.GetVendorProfileDetailsEmployeeMobile);

router.post('/getvendoremployeemobileall', adminController.GetVendorProfileDetailsEmployeeMobileAll);

router.post('/admindashboard', adminController.AdminDashboard1);

//router.post('/admindashboard1', adminController.AdminDashboard1);

router.post('/savebanktransaction', adminController.SaveTransactionData);

router.post('/getbanktransaction', adminController.GetTransactionData);

router.post('/updatebanktransaction', adminController.UpdateTransactionData);

router.post('/executetransaction', adminController.ExecuteBankTransaction);

//router.post('/testv', adminController.TESTVENDORDATA);

router.post('/updatemodel', adminController.UPDATEMODEL);

//router.post('/shopimages', adminController.UpdateShopImages);

router.post('/addfaq', adminController.AddFaq);

//router.post('/updatefaq', adminController.UpdateFaq);

router.post('/addpointspurchaseamount', adminController.AddPointsPurchaseAmount);

router.post('/updatereferralidphoneassociate', adminController.UpdateAssociateReferralIDPhoneNumber);

module.exports = router;