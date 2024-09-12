import mongoose from "mongoose";

mongoose.set('strictQuery',false)  // not gave error when extra info is required

const connectionToDB=async()=>{
    try {
        const {connection} = await mongoose.connect(
            process.env.MONGO_URL // || 
        )
        if (connection) {
            console.log(`connected to ${connection}`);
        }
    } catch (error) {
        console.log(e.message);
        process.exit(1)
    }
}

export default connectionToDB