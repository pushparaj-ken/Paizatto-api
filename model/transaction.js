var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var transactionSchema = new Schema({
    id: { type: Number, default: "", required:false},
    username:{ type: String, default: "", required:true},
    vendor:{ type: String, default: "", required:true},
    utrnumber:{ type: String, default: "", required:true},
    category: { type: String, default: "", required:false},
    point:{ type: Number, default: "", required:true},
    amount:{ type: Number, default: "", required:true},
    status:{ type: Number, default: 0, required:true}, //0 active 1 inactive
    transactionDate:{ type: Date, default: "", required:true},
    pointsType: { type: Number, default: 0, required:false}, //0-payout,1-referral,2-self,3 bonus
    //createdAt: { type: Date, default: "", required:false},
    //updatedAt: { type: Date, default: new Date(), required:false},
},
{
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
}
)

module.exports = mongoose.model('Transaction', transactionSchema);