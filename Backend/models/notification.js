import mongoose from 'mongoose';


const nottificationSchema = new mongoose.Schema( {
    from : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    to : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    type : {
        type : String,
        enum : ["follow", "like"],
        required : true
    },
    read : {
        type : Boolean,
        default : false
    }
},{ timestamps : true });


const Notification = mongoose.model("Notification", nottificationSchema);
export default Notification;