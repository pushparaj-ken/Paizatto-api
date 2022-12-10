var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var payoutSchema = new Schema({
    username: { type: String, default: "", required:true},
    vendor:{ type: String, default: "", required:true},
    category: { type: String, default: "", required:false},
    points: { type: Number, default: "", required:true},
    amount: { type: Number, default: "", required:true},
    status: { type: Number, default: "", required:true},
    transactionDate: { type: Date, default: new Date(), required:true},
    utrnumber: { type: Number, default: "", required:true},
    accountholdername: { type: String, default: "", required:false},
    accountnumber: { type: String, default: "", required:false},
    ifsccode: { type: String, default: "", required:false},
    //createdAt: { type: Date, default: "", required:false},
    //updatedAt: { type: Date, default: new Date(), required:false},
},
{
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
}
)

module.exports = mongoose.model('Payout', payoutSchema);