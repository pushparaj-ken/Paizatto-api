var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var isliderSchema = new Schema({
    id: { type: Number, default: "", required:false},
    image: { type: String, default: "", required:true},
    title: { type: String, default: "", required:true},
    description: { type: String, default: "", required:true},
    deeplink: { type: String, default: "", required:true}, 
    createdAt: { type: Date, default: "", required:false},
    updatedAt: { type: Date, default: new Date(), required:false},
    lastModifiedAt: { type: Date, default: new Date(), required:false},
    LastModifiedBy: { type: String, default: "", required:false},

},
{
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
}
)

module.exports = mongoose.model('iSlider', isliderSchema);