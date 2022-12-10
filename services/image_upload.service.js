const AWS = require("aws-sdk");
const Sharp = require("sharp");
const AllConstants = require("../services/constants");

// Amazon SES configuration
const config = {
    // current version of Amazon S3 API (see: https://docs.aws.amazon.com/AmazonS3/latest/API/Welcome.html)
    apiVersion: "2006-03-01",
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    region: process.env.AWS_S3_REGION
};

var s3 = new AWS.S3(config);

exports.upload = (file, fileName) => {console.log("File Name--------->",fileName)
    return new Promise((resolve, reject) => {
        let epochtimeseconds = Date.now();
        fileName = fileName.replace(".", epochtimeseconds + ".");
        let params = {
            Body: '',
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileName
        };
        let split_fileName = fileName.split(".");
        let extension_of_file = split_fileName[1];
        let imgext = AllConstants.ImageExtensions;
        // resize image and upload to S3
        if(imgext.indexOf(extension_of_file) > -1){console.log("Before Upload to s3------>",file)
        Sharp(file)
            .webp({ quality: 20 })
            .resize(null, null, {
                fit: Sharp.fit.inside,
                withoutEnlargement: true,
            })
            .toBuffer()
            .then(buffer => {
                params.Body = buffer;
                s3.upload(params, (error, file) => {console.log("S3 Uploaded File------>",file)
                    if (error) {
                        reject(error);
                    }
                    resolve(file);
                });
            })
            .catch(error => reject(error));
        }else{
                params.Body = file;
                s3.upload(params, (error, file) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(file);
                });
        }
    });
}

exports.uploadArray = (files) => {
    return new Promise((resolve, reject) => {
        var count = 0;
        let totalCount = files.length + 1;
        for(each in files)  {
            //resolve(files);
            let params = {
                Body: '',
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: files[each]["originalname"]
            };
            let FileBuffer = files[each];
            console.log(files[each]);
            // resize image and upload to S3
            Sharp(files[each])
                .webp({ quality: 20 })
                .resize(null, null, {
                    fit: Sharp.fit.inside,
                    withoutEnlargement: true,
                })
                .toBuffer()
                .then(buffer => {
                    params.Body = buffer;
                    s3.upload(params, (error, FileBuffer) => {
                        if (error) {console.log(error);
                            reject(error);
                        }
                        count = count + 1;
                        console.log(count);
                        if(count == totalCount){
                            resolve(true);
                        }
                    });
                })
                .catch(error => reject(error));
        }
    });
}