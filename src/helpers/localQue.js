'use strict'
const RedisWrapper = require('rediswrapper')
const redis = new RedisWrapper({
  host: process.env.QUE_SERVER,
  port: process.env.QUE_PORT,
  passwd: process.env.QUE_PASS,
  type: 'localQue'
})
let redisReady = false
const initRedis = async()=>{
  try{
    await redis.init()
    let status = await redis.ping()
    if(status === 'PONG'){
      redisReady = true
      console.log('redis connection successful...')
    }else{
      console.error('redis connection error. Will try again in 5 seconds...')
      setTimeout(initRedis, 5000)
    }
  }catch(e){
    console.error(e);
    setTimeout(initRedis, 5000)
  }
}
initRedis()
module.exports.localQue = redis
module.exports.localQueStatus = ()=>{
  return redisReady
}
