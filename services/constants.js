const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const SMSTemplateIds = {
    "VendorBankUpdate":"1207162753838362459",
    "AssociateBankUpdate":"1207162753835175369",
    //New 19 May 2022
    "VendorSignupSMS":"1207161900501677034",
    "VendorAppLink":"1207164932758545980",
    "VendorForgotPassword":"1207164932749504847",  
    "VendorKycStatus":"1207164932252065025",
    "VendorPaymentConfirmation":"1207162685711070862",
    "AssociateSignupSMS":"1207165029816952084",
    "AssociateForgotPassword":"1207164932741841645",
    "AssociateAppLink":"1207164932455776388",
    "AssociateRegistrationOTPCode":"1207164932673861961",
    "AssociateBillingConfirmation":"1207161778416534795"
}

const SMSContent = {
    "Forgot1Password":"Your Paizatto Password:",
    "VendorBankUpdate":"Greetings from Paizatto. Dear Vendor, please enter your bank details to receive the settlement directly in your bank account. Click on the link to download the app {#var#}",
    "AssociateBankUpdate":"Greetings from Paizatto. Dear Associate, please enter your bank details to receive your Cash Back directly in your bank account. Click on the link to download the app {#var#}",
    //New 19 May 2022
    "VendorSignupSMS":"Your Vendor Registration is completed. Your Paizatto ID :{#var#}",
    "VendorAppLink":"Thank you for being Paizatto affiliated vendor. Click to download the app:{#var#} For any support contact 9007900780",
    "VendorForgotPassword":"Your Paizatto Vendor Password : {#var#}",
    "VendorKycStatus":"Hello {#var#},your KYC status is {#var#}, Team Paizatto",
    "VendorPaymentConfirmation":"Dear {#var#}, this is a confirmation for payment of Rs: {#var#} done by {#var#} on {#var#}. Payment will be processed shortly. Regards Paizatto",
    "AssociateSignupSMS":"Thank you for registering with Paizatto, Your UserName: {#var#} and pwd: {#var#}",
    "AssociateForgotPassword":"Your Paizatto Associate Password : {#var#}",
    "AssociateAppLink":"Thank you for being Paizatto Associate.Click to download the app {#var#} For any support contact 9007900780",
    "AssociateRegistrationOTPCode":"Use {#var#} as your Paizatto Associate Registration OTP",
    "AssociateBillingConfirmation":"Hi {#var#}, Your billing of {#var#} is completed successfully and {#var#}points has been credited to your wallet."
}

const SenderId = {   
    "VendorBankUpdate":"Paizat",
    "AssociateBankUpdate":"Paizat",
    //New 19 May 2022
    "VendorSignupSMS":"Paizat",
    "VendorAppLink":"Paizat",
    "VendorForgotPassword":"Paizat",
    "VendorKycStatus":"Paizat",
    "VendorPaymentConfirmation":"Paizat",
    "AssociateSignupSMS":"Paizat",
    "AssociateForgotPassword":"Paizat", 
    "AssociateAppLink":"Paizat",
    "AssociateRegistrationOTPCode":"Paizat",
    "AssociateBillingConfirmation":"Paizat"
}

const Links = {
    "associateapplink":"https://onelink.to/3svncm",
    "vendorapplink":"https://onelink.to/m6kzf9"
}

const ImageExtensions = ["JPG", "PNG", "JPEG"]

const AssociateDefaultUsername = "OL00000001";
//Universals.VendorUniversalPassword
const Universals = {
    VendorUniversalPassword:process.env.VENDOR_UNIVERSAL_PASSWORD,
    AssociateUniversalPassword:process.env.ASSOCIATE_UNIVERSAL_PASSWORD,
}

module.exports = {
    SMSTemplateIds,
    SenderId,
    SMSContent,
    ImageExtensions,
    AssociateDefaultUsername,
    Links,
    Universals
};