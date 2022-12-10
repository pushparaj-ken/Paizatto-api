var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var faqSchema = new Schema({
    id: { type: Number, default: "", required:true},
    category: { type: String, default: "", required:true},
    question: { type: String, default: "", required:true},
    answer: { type: String, default: "", required:true},
    status: { type: Number, default: 0, required:true},  //0 active 1 inactive
    userType: { type: String, default: "", required:true}, //Vendor, Associate
    createdAt: { type: Date, default: "", required:false},
    updatedAt: { type: Date, default: new Date(), required:false},
},
{
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
}
)

module.exports = mongoose.model('faqs', faqSchema);