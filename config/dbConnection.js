import mongoose from "mongoose";

mongoose.set('strictQuery',false)  // not gave error when extra info is required

const connectionToDB=async()=>{
    try {
        const {connection} = await mongoose.connect(
            "mongodb://localhost:27017/LMS "
        )
        if (connection) {
            console.log(`connected to ${connection.host}`);
        }
    } catch (error) {
        console.log(error.message);
        process.exit(1)
    }
}

export default connectionToDB