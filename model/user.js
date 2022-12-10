var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    id: { type: Number, default: "", required:true},
    firstName:  { type: String, default: "", required:true},
    lastName:  { type: String, default: "", required:true},
    phoneNumber: { type: Number, default: "", required:true},
    employee:[
        { type: Number, default: "", required:false}
    ],
    password:  { type: String, default: "", required:true},
    roleid: { type: Number, default: "", required:true},
    rolename: { type: String, default: "", required:true},
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

module.exports = mongoose.model('User', userSchema);