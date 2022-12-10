var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var packageSchema = new Schema({
    id: { type: Number, default: "", required:true},
    name: { type: String, default: "", required:true},
    message: { type: String, default: "", required:true},
    icon: { type: String, default: "", required:true},
    status: { type: Number, default: 0, required:true},
    pin: { type: Number, default: "0", required:true},
    //createdAt: { type: Date, default: "", required:false},
    //updatedAt: { type: Date, default: new Date(), required:false},
},
{
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
}
)

module.exports = mongoose.model('Package', packageSchema);