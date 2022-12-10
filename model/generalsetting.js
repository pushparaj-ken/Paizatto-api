var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var generalsettingSchema = new Schema({
    id: { type: Number, default: "", required:true},
    fee: { type: Number, default: "", required:true},
    gst: { type: Number, default: "", required:true},
    logo: { type: String, default: "", required:true},
    icon: { type: String, default: "", required:true},
    pointValue: { type: String, default: "", required:true}, //0 active, 1 inactive
    status: { type: Number, default: 0, required:true}, //0 active, 1 inactive
    createdAt: { type: Date, default: "", required:false},
    updatedAt: { type: Date, default: new Date(), required:false},
},
{
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
}
)

module.exports = mongoose.model('GeneralSetting', generalsettingSchema);