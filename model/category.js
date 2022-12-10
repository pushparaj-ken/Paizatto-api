var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categorySchema = new Schema({
    id: { type: Number, default: "", required:true},
    fee: { type: Number, default: "", required:true},
    gst: { type: Number, default: "", required:true},
    name: { type: String, default: "", required:true},
    status: { type: Number, default: 0, required:true},
    Membership: {
        id: { type: Number, default: "", required:false},
        name: { type: String, default: "", required:false},
        value: { type: Number, default: "", required:false},
    },
    primaryCategory: { type: Number, default: "", required:false},
    //createdAt: { type: Date, default: "", required:false},
    //updatedAt: { type: Date, default: new Date(), required:false},
},
{
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
}
)

module.exports = mongoose.model('Category', categorySchema);