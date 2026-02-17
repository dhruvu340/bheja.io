import mongoose from "mongoose";


export const connectDb : ()=> Promise<void> = async () => {
    try {
        await mongoose.connect(process.env.MONGO_PASS as string);
        console.log("connection to db success");
    } catch (error : unknown) {
        if(error instanceof Error){
             console.log(`Error connecting to db : ${error.message}`);
        }else{
            console.log("unknown db error")
        }
        process.exit(1);
    }
}