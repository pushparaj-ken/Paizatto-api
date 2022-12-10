var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = new Schema({
    id: { type: Number, default: "", required:true},
    name: { type: String, default: "", required:true},
    status: { type: Number, default: 0, required:false}, //0 inactive, 1 - active
    createdBy : { type: String, default: "", required:true},
    updatedBy : { type: String, default: "", required:false},
    //createdAt: { type: Date, default: "", required:false},
    //updatedAt: { type: Date, default: new Date(), required:false},
},
{
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
}
)

module.exports = mongoose.model('Product', productSchema);