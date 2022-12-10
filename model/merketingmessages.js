var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MarketingMessagesSchema = new Schema({
    id: {type: Number, default: "", required:true},
    vendorusername: { type: String, default: "", required:true},
    pincode: { type: Number, default: "", required:true},
    subject: { type: String, default: "", required:false},
    message: { type: String, default: "", required:false},
    status: { type: Number, default: 1, required:false}, //0 - Approved, 1- Pending, 2-rejected
    createdAt: { type: Date, default: new Date, required:false},
},
{
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
}
)

module.exports = mongoose.model('MarketingMessages', MarketingMessagesSchema);