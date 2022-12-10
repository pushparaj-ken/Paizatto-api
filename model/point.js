var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pointSchema = new Schema({
    id: { type: Number, default: "", required:false},
    customerUsername: { type: String, default: "", required:true},
    vendorUsername: { type: String, default: "", required:true},
    points: { type: Number, default: "", required:true},
    pointsType: { type: Number, default: 0, required:false},
    amount: { type: Number, default: "", required:true},
    status:{ type: Number, default: 0, required:true}, //0 active 1 inactive
    transactionDate:{ type: Date, default: new Date(), required:true},
    //createdAt: { type: Date, default: "", required:false},
    //updatedAt: { type: Date, default: new Date(), required:false},
},
{
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
}
)

module.exports = mongoose.model('Point', pointSchema);