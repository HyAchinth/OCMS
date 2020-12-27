const mongoose = require("mongoose");


const RoomSchema = new mongoose.Schema({
    className:{
        type:String,
        required:true
    },
    students:[{
       student: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
        }
    }],
    teacher:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",

    },
    announcements:[{
        announcement: {
         type:mongoose.Schema.Types.ObjectId,
         ref:"Announcement"
         }
     }],
    resources: [{
        resource :{                                 // resources === assignment
            type: String
        },
        description:{
            type:String
        },
        createdAt:{
            type:Date,
            default:Date.now
        },
        deadline:{
            type:Date,
            default:Date.now
        }
    }],
    submissions:[
                {
                    student_id: mongoose.Schema.Types.ObjectId,
                    resource_id:mongoose.Schema.Types.ObjectId,
                    submission:{
                        type:String
                    },
                    description:{
                        type:String
                    },
                    createdAt:{
                        type:Date,
                        default:Date.now
                    }
                }
            ],
            
    materials: [{
        material :{
            type: String
        },
        description:{
            type:String
        },
        createdAt:{
            type:Date,
            default:Date.now
        }
    }],
    date:{
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model("Room",RoomSchema);