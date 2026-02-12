import Notification from "../models/notification.js";


// GET Notifications (Paginated + Mark as Read)
export const getNotification = async(req, res) => {
    try {

        const userId = req.user._id;

        // Pagination (default: page 1, limit 20)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page-1)*limit;

        console.log(req.query.page);
        console.log(req.query.limit);
        console.log(skip);
        
        
        const notifications = await Notification.find({to : userId})
        .populate ({
            path : "from",
            select : "username profileImg"
        })
        .sort({ createdAt : -1 })
        .skip(skip)
        .limit(limit)
        .lean();

        // Mark only unread notifications as read
        await Notification.updateMany(
            {to : userId, read : false}, 
            { $set : {read : true}}
        );

        const total = await Notification.countDocuments({to : userId});

        return res.status(200).json({
            success : true,
            page,
            totalPages : Math.ceil(total/limit),
            totalNotifications : total,
            data : notifications
        });

    }catch(error) {
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
}


export const deleteNotification = async(req, res) => {
    try {
        const userId = req.user._id;
        if(!userId) {
            return res.status(404).json({
                success : false,
                message : "user not found"
            });
        }
        await Notification.deleteMany({to : userId});

        return res.status(200).json({
            success : true,
            message : "notification delete successfully"
        });

    }catch(error) {
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
}


export const deleteOneNotification = async(req, res) => {
    try {
        const notificationId  = req.params.id;
        const userId = req.user._id;
        const notification = await Notification.findById(notificationId);

        if(!notification) {
            return res.status(404).json({
                success : false,
                message : "Notification not found"
            });
        }

        if(notificationId.to.toString() !== userId.toString()) {
            return res.status(403).json({
                success : false,
                message : "you are not allowed to delete this notification"
            });
        }

        await Notification.findByIdAndDelete(notificationId);

        return res.status(200).json({
            success : true,
            message : "Notifiacation deleted successfully"
        });

    }catch(error) {
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
}