import dotenv from 'dotenv'
import express from 'express';
import Aws from 'aws-sdk'
import multer from 'multer';
import multers3 from 'multer-s3';
import { v4 as uuid} from 'uuid'
dotenv.config();

const awsConfig = {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.ACCESS_SECRET,
    region: process.env.REGION
};

const S3 = new Aws.S3(awsConfig);


const app = express();
app.use(express.json())
app.use(express.urlencoded({extended:true}));

let upload = multer({})

const uploadToS3 =async (file)=>{
    const params = {
        Bucket: process.env.BUCKET,
        Key: uuid(),
        Body: file.buffer
    }
    console.log('params :>> ', params);
    // S3.upload(params,(err,data)=>{
    //     if(err){
    //         console.log('err :>> ', err);
    //         return err;
    //     }else{
    //         console.log('data :>> ', data);
    //         return data;
    //     }
    // })
    const resp = await S3.upload(params).promise();
    return resp;
    
}


app.post('/upload',upload.single("file"),async (req,res)=>{
    console.log('req.file :>> ', req.file);
    if(req.file){
        const resp =  await uploadToS3(req.file);
        res.status(200).json({status:"Success",response: resp})
    }else{
        res.status(500).json({status:"Failed",response: {
            message:"File not uploaded."
        }})
    }
})

app.listen(process.env.PORT,()=>{
    console.log("Server started Listening at "+process.env.PORT+"...");
})
