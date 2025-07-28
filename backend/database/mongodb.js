import mongoose from "mongoose";
import { MONGO_URI ,NODE_ENV} from "../config/env.js";


if(!MONGO_URI){
    throw new Error("Please define your Mongodb url in .env.<development/production>.local");
}

const connectToDatabase=async ()=>{
    try{
        await mongoose.connect(MONGO_URI);
        console.log(`Connected the database in ${NODE_ENV} mode`);
    }catch(e){
        console.log("Error connecting to database",e);
        process.exit(1);
    }
}

export default connectToDatabase;