var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var vendorSchema = new Schema({
    uid: { type: String, default: "", required: true },
    username: { type: String, default: "", required: true },
    phoneNumber: { type: Number, default: "", required: true },
    firstName: { type: String, default: "", required: true }, //firstname is shopname
    lastName: { type: String, default: "", required: true }, //last name is contact person name
    QRCode: { type: String, default: "", required: false },
    Password: { type: String, default: "", required: true },
    LastPassword: { type: Array, required: false },
    Gender: { type: String, default: "", required: false },
    kycStatus: { type: Number, default: 1, required: false }, //0 - Approved, 1- Pending, 2-rejected, 3 - rework
    status: { type: Number, default: 2, required: false }, // 0 - Approved, 1 - Pending, 2 - New User , 3 - Rejected, 4 - blocked
    rework: { type: String, default: "", required: false },
    createdAt: { type: Date, default: "", required: false },
    createdBy: { type: String, default: "", required: false },
    lastModifiedAt: { type: Date, default: new Date(), required: false },
    lastModifiedBy: { type: String, default: "", required: false },
    otp: { type: Number, default: "", required: false },
    isfavourite: { type: Number, default: 0, required:false},
    //deeplink: { type: String, default: "", required:false},
    featuredImage: { type: String, default: "", required: false },
    delivery: { type: Boolean, default: false, required: false },
    Distance: { type: String, default: "", required: false },
    ParentID: { type: String, default: "", required: false },
    rating: { type: Number, default: "", required: false },
    fee: { type: Number, default: "", required: false },
    gst: { type: Number, default: "", required: false },
    employeeMobile: { type: Number, default: "", required: false },
    isForm: { type: Boolean, default: false, required: false }, // 0 - Yes, 1 - Not a from
    Address: {
        no: { type: String, default: "", required: false },
        street: { type: String, default: "", required: false },
        city: { type: String, default: "", required: false },
        pincode: { type: Number, default: "", required: false },
        state: { type: String, default: "", required: false },
        country: { type: String, default: "", required: false },
        geometry: {
            type: {
                type: String,
                default: "Point"
            },
            coordinates: {
                type: [Number]
            },
            index: { type: String, default: "2dsphere", required: false },
        },
    },
    area: {
        id: { type: Number, default: "", required: false },
        districtid: { type: Number, default: "", required: false },
        //name: { type: String, default: "", required:false},
    },
    Sliders: [{
        id: { type: Number, default: "", required: false },
        image: { type: String, default: "", required: false },
        deepLink: { type: String, default: "", required: false },
        orderBy: { type: String, default: "", required: false },
    }],
    Membership: {
        id: { type: Number, default: "", required: false },
        // image: { type: String, default: "", required:false},
        // name: { type: String, default: "", required:false},
        // value: { type: Number, default: "", required:false},
    },
    Category: [{
        id: { type: Number, default: "", required: false },
        //primaryCategory:  { type: Number, default: "", required:false},
        //name: { type: String, default: "", required:false},
    }],
    Offers: [{
        id: { type: Number, default: "", required: false },
        orderBy: { type: String, default: "", required: false },
        image: { type: String, default: "", required: false },
    }],
    Product: [{
        id: { type: Number, default: "", required: false },
        name: { type: String, default: "", required: false },
    }],
    Package: [{
        id: { type: Number, default: "", required: false },
        name: { type: String, default: "", required: false },
    }],
    Bank: {
        accountholdername: { type: String, default: "", required: false },
        accountnumber: { type: String, default: "", required: false },
        ifsccode: { type: String, default: "", required: false },
        bankname: { type: String, default: "", required: false },
        branchname: { type: String, default: "", required: false },
    },
    fcmToken: { type: String, default: "", required: false },
    isBank: { type: Boolean, default: false, required: false }, //false - not updated, true - updated
    isLocation: { type: Boolean, default: false, required: false }, //false - not updated, true - updated
    isKYC: { type: Boolean, default: false, required: false }, //false - not updated, true - updated
    panNo: { type: String, default: "", required: false },
    gstNo: { type: String, default: "", required: false },
    panPath: { type: String, default: "", required: false },
    gstPATH: { type: String, default: "", required: false },
    kycPATH: { type: String, default: "", required: false },
    shopImages: { type: Array, default: [], required: false },
    offerImages: { type: Array, default: [], required: false },
    //sliderImages:{type:Array, default: [], required:false},
    kycDate: { type: Date, default: "", required: false },
    kycReason: { type: String, default: "", required: false },
    //primaryCategory: { type: Number, default: "", required:false},
    //kycApprovedDate: { type: Date, default: "", required:false},
    //kycRejectedDate: { type: Date, default: "", required:false},
    //kycRejectedReasons: { type: String, default: "", required:false},
    //reworkDate:  { type: Date, default: "", required:false},
    //reworkReason: { type: String, default: "", required:false},

}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'lastModifiedAt' }
})

vendorSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.Password;
    return obj;
}

vendorSchema.pre('save', function(next) {
    this.lastModifiedAt = Date.now();
    return next();
});

module.exports = mongoose.model('Vendor', vendorSchema);