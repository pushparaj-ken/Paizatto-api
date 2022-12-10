var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roleSchema = new Schema({
    id: { type: Number, default: "", required:true},
    name:  { type: String, default: "", required:true},
    permissions: [
        {
            id: { type: Number, default: "", required:true},
            menuid: { type: Number, default: "", required:true},
            read: { type: Boolean, default: false, required:true},
            edit: { type: Boolean, default: false, required:true},
            delete: { type: Boolean, default: false, required:true},
        }
    ],
    status: { type: Number, default: 1, required:false},  //0 active, 1 inactive
    //createdAt: { type: Date, default: "", required:false},
    createdBy: { type: String, default: "", required:false},
    //updatedAt: { type: Date, default: new Date(), required:false},
    updatedBy: { type: String, default: "", required:false},
},
{
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
}
)

module.exports = mongoose.model('Role', roleSchema);