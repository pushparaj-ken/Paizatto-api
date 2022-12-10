var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var associateotpSchema = new Schema({
    phoneNumber: { type: Number, default: "", required:true},
    count: { type: Number, default: 0, required:true},
    repeatcount: { type: Number, default: 0, required:true},
    lastModifiedAt: { type: Date, default: new Date(), required:false},
    otp: { type: Number, default: "", required:true},
},{
    timestamps: true
  })

associateotpSchema.pre('save', function(next) {
    this.lastModifiedAt = Date.now();
    return next();
});

module.exports = mongoose.model('associateotp', associateotpSchema);