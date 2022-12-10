var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var referevendorSchema = new Schema({
    id: { type: Number, default: "", required:true},
    referredBy: { type: String, default: "", required:true},
    shopName: { type: String, default: "", required:true},
    dealerName: { type: String, default: "", required:true},
    phoneNumber: { type: Number, default: "", required:true},
    email: { type: String, default: "", required:false},
    Category: [
        {
            id: { type: String, default: "", required:false},
            name: { type: String, default: "", required:false},
        }
    ],
    Address: {
        no: { type: String, default: "", required:false},
        street: { type: String, default: "", required:false},
        city: { type: String, default: "", required:false},
        pincode: { type: Number, default: "", required:false},
        state: { type: String, default: "", required:false},
        country: { type: String, default: "", required:false},
        geometry: {
            type: {
                type: String,
                default: "Point"
            },
            coordinates: {
                type: [Number]
            },
            index: { type: String, default: "2dsphere", required:false},
        }
    },
    status :{ type: Number, default: 0, required:true},   ///Status 0  active,1 inactive
    //createdAt: { type: Date, default: new Date(), required:false},
    //updatedAt: { type: Date, default: new Date(), required:false},
},
{
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
}
)

module.exports = mongoose.model('Refervendor', referevendorSchema);