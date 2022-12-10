var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var membershipSchema = new Schema({
    id: { type: Number, default: "", required:true},
    name: { type: String, default: "", required:true},
    image: { type: String, default: "", required:true},
    value: { type: Number, default: "", required:true},
    status: { type: Number, default: "0", required:false},
    createdAt: { type: Date, default: "", required:false},
    updatedAt: { type: Date, default: new Date(), required:false},
    updatedBy: { type: String, default: "", required:false},
},
{
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
}
)

module.exports = mongoose.model('memberships', membershipSchema);
