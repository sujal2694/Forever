import mongoose from "mongoose";

export const userSchema = mongoose.Schema({
    email: {type:String,require,unique},
    password: {type:String,require}
})

export const useModel = mongoose.models.model || mongoose.model("user", userSchema);