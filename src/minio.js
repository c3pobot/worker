const log = require('logger');
const Minio = require('minio');
let MINIO_ENDPOINT = process.env.MINIO_ENDPOINT, minioReady

const client = new Minio.Client({
  endPoint: MINIO_ENDPOINT,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINI_SECRET_KEY
})

const start = async()=>{
  try{
    let list = await client.listBuckets()
    if(list){
      minioReady = true
      return
    }
    setTimeout(start, 5000)
  }catch(e){
    log.error(e)
    setTimeout(start, 5000)
  }
}
start()
const getObject = (bucket, key)=>{
  return new Promise((resolve, reject)=>{
    try{
      let miniData
      client.getObject(bucket, key, (err, dataStream)=>{
        if(err) reject(err)
        dataStream.on('data', (chunk)=>{
          if(!miniData){
            miniData = chunk
          }else{
            miniData += chunk
          }
        })
        dataStream.on('end', ()=>{
          resolve(miniData)
        })
        dataStream.on('error', (err)=>{
          reject(err)
        })
      })
    }catch(e){
      reject(e)
    }
  })
}
module.exports.status = ()=>{
  return minioReady
}
module.exports.get = async(bucket, file)=>{
  if(!bucket || !file) return
  let res = await getObject(bucket, file)
  if(res) return JSON.parse(res)
}
