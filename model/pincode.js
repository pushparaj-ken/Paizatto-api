var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pincodeSchema = new Schema({
    id: { type: Number, default: "", required:true},
    pincode:  { type: Number, default: "", required:true},
    cityname: { type: String, default: "", required:true},
    country: { type: String, default: "India", required:false},
    status: { type: Number, default: 0, required:false},      //0 active, 1 inactive
    createdAt: { type: Date, default: "", required:false},
    createdBy: { type: String, default: "", required:false},
    updatedAt: { type: Date, default: new Date(), required:false},
    updatedBy: { type: String, default: "", required:false},
},
{
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
}
)

module.exports = mongoose.model('pincode', pincodeSchema);
