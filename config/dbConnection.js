import mongoose from "mongoose";

mongoose.set('strictQuery',false)  // not gave error when extra info is required

const connectionToDB=async()=>{
    try {
        const {connection} = await mongoose.connect(
            process.env.MONGO_URL,
        )
        // console.log(connection);
        
        if (connection) {
            console.log(`connected to ${connection.name} database`);
        }
    } catch (error) {
        console.log(error.message);
        process.exit(1)
    }
}

export default connectionToDB