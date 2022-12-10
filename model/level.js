var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var levelSchema = new Schema({
    id: { type: Number, default: "", required:true},
    name:{ type: String, default: "", required:true},
    icon: { type: String, default: "", required:true},
    point: { type: Number, default: "", required:true},
    max: { type: Number, default: "", required:true},
    capping: { type: Number, default: "", required:true},
    Downline: { type: String, default: "", required:true},
    min: { type: Number, default: "", required:true},
    status: { type: Number, default: 0, required:true},
    orderBy: { type: Number, default: "", required:true},
    createdAt: { type: Date, default: "", required:false},
    updatedAt: { type: Date, default: new Date(), required:false},
},
{
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
}
)

module.exports = mongoose.model('Level', levelSchema);