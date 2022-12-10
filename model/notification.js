var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var notificationsSchema = new Schema({
    id:  { type: Number, default: 1, required:true},
    username: { type: String, default: "", required:true},
    fcmToken: { type: String, default: "", required:true},
    userType: { type: String, default: "", required:true}, //Vendor, Associate
    notificationbody: { type: String, default: "", required:true},
    notificationtitle: { type: String, default: "", required:true},
    createdAt: { type: Date, default: "", required:false},
    updatedAt: { type: Date, default: new Date(), required:false},
    status: { type: Number, default: 0, required:false},  //0 unread, 1 - read
    isRead: {type: Boolean, default: false, required: false}
},
{
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
}
)

module.exports = mongoose.model('Notification', notificationsSchema);