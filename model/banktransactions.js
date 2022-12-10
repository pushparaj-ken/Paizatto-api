var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var banktransactionSchema = new Schema({
    id: { type: Number, default: "", required:true},
    VendorID: { type: String, default: "", required: true},
    shopName: { type: String, default: "", required: false},
    TxnStatus: { type: Number, default: 0, required: false}, // 0 Pending, 1 success, 2 failure
    PayerAmount: { type: Number, default: 0, required: false},
    PayerName: { type: String, default: "", required: false},
    PayerVa:  { type: String, default: "", required: false},
    BankRRN: { type: Number, default: 0, required: false},
    AssociateRegNo: { type: String, default: "", required: false},
    AssociatePhoneNo: { type: Number, default: 0, required: false},
    TxnInitDate: { type: Date, default: "", required:false},
    TxnCompletionDate: { type: Date, default: "", required:false},
    Commission: { type: Number, default: 0, required: false},
    GST: { type: Number, default: 0, required: false},
    TotalCommission: { type: Number, default: 0, required: false},
    PayabletoVendor: { type: Number, default: 0, required: false},
    PayoutStatus: { type: Number, default: 0, required: false}, // 0 Pending, 1 success, 2 failure
    UTRNumber:{ type: Number, default: 0, required: false},
},
{
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
}
)

module.exports = mongoose.model('banktransaction', banktransactionSchema);
