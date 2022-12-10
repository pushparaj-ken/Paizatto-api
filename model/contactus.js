var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ContactusSchema = new Schema({
    id: { type: Number, default: "", required: true },
    name: { type: String, default: "", required: true },
    email: { type: String, default: "", required: true },
    mobile: { type: Number, default: "", required: true },
    message: { type: String, default: "", required: true },
    role: { type: String, default: "", required: true },
    status: { type: Number, default: 0, required: false }, //0 active 1 inactive
    resolutionstatus: { type: Number, default: 3, required: false }, // 0 resolved, 1 pending, 2 in progress, 3 created
    remarks: { type: String, default: "", required: false },
    createdBy: { type: String, default: "", required: false },
    lastModifiedBy: { type: Date, default: new Date(), required: false },
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})

module.exports = mongoose.model('Contactus', ContactusSchema);