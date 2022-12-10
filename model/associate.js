var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 
var associateSchema = new Schema({
    uid: { type: String, default: "", required:true},
    username: { type: String, default: "", required:true},
    referrer: {
        //referraluid: { type: String, default: "", required:false},
        referralid: { type: String, default: "", required:false},
        //referralusername: { type: String, default: "", required:false},
        //referralName: { type: String, default: "", required:false},
    },
    phoneNumber: { type: Number, default: "", required:true},
    firstName: { type: String, default: "", required:false},
    lastName: { type: String, default: "", required:false},
    DOB: { type: Date, default: "", required:false},
    email: { type: String, default: "", required:false},
    Password: { type: String, default: "", required:false},
    LastPassword: { type: Array, required:false},
    Gender: { type: String, default: "", required:false},
    isPhone: { type: Boolean, default: false, required:false},
    Address: {
        no: { type: String, default: "", required:false},
        street: { type: String, default: "", required:false},
        city: { type: String, default: "", required:false},
        pincode: { type: Number, default: "", required:false},
        state: { type: String, default: "", required:false},
        country: { type: String, default: "", required:false},
        lat: { type: Number, default: "", required:false},
        long: { type: Number, default: "", required:false},
    },
    fcmToken:[ { type: String, default: "", required:false}],
    status: { type: Number, default: 0, required:false}, // 0 - Approved, 1 - Pending, 2 - New User , 3 - Rejected, 4 - blocked
    isActive: { type: Boolean, default: false, required:false}, // true - Active Downline, false - Inactive Downline
    createdAt: { type: Date, default: "", required:false},
    createdBy: String,
    lastModifiedAt: { type: Date, default: new Date(), required:false},
    lastModifiedBy: { type: String, default: "", required:false},
    PasswordSalt: { type: String, default: "", required:false},
    otp: { type: String, default: "", required:false},
    deeplink: { type: String, default: "", required:false},
    UPI: {
        gpay: { type: String, default: "", required:false},
        phonepe: { type: String, default: "", required:false},
        paytm: { type: String, default: "", required:false},
        bhim: { type: String, default: "", required:false},
        gaxis: { type: String, default: "", required:false},
        ghdfc: { type: String, default: "", required:false},
        gicici: { type: String, default: "", required:false},
        gsbi: { type: String, default: "", required:false},
        pyes: { type: String, default: "", required:false},
        picici: { type: String, default: "", required:false},
        paxis: { type: String, default: "", required:false}
    },
    Bank: {
        accountholdername: { type: String, default: "", required:false},
        accountnumber: { type: String, default: "", required:false},
        ifsccode: { type: String, default: "", required:false},
        bankname: { type: String, default: "", required:false},
        branchname: { type: String, default: "", required:false},
    },
    panNo: { type: String, default: "", required:false},
    aadharNo: { type: String, default: "", required:false},
    panPath: { type: String, default: "", required:false},
    aadharPath:{ type: String, default: "", required:false},
    // dashboard: {
    //     currentLevel: { type: String, default: "", required:false},
    //     poitntsEarned: { type: String, default: "", required:false},
    //     pointsEligible: { type: String, default: "", required:false},
    // },
    isVerifyUPI: { type: Boolean, default: false, required:false},
    isBank: { type: Boolean, default: false, required:false},
    isPersonal: { type: Boolean, default: false, required:false},
    isfavourite: { type: Number, default: 0, required:false},
    parentId: {type: String, default: "", required: false},
    Levels:
    [
        {
            id: { type: String, default: "", required:true},
            name:{ type: String, default: "", required:true},
            icon: { type: String, default: "", required:true},
            point: { type: Number, default: "", required:true},
            max: { type: Number, default: "", required:true},
            capping: { type: Number, default: "", required:true},
            Downline: { type: String, default: "", required:true},
            min: { type: Number, default: "", required:true},
            status: { type: String, default: "Active", required:true},
            orderBy: { type: Number, default: "", required:true},
        }
    ],
    sub: { type: Array, default: [], required: false},
    whatsapp:  { type: Number, default: "", required:false},
},
{
    timestamps: { createdAt: 'createdAt', updatedAt: 'lastModifiedAt' }
}
)

associateSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.password;
    return obj;
}

associateSchema.pre('save', function(next) {
    this.lastModifiedAt = Date.now();
    return next();
});

module.exports = mongoose.model('Associate', associateSchema);