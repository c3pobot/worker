'use strict'
const log = require('logger')
const RedisWrapper = require('rediswrapper')
const redis = new RedisWrapper({
  host: process.env.QUE_SERVER,
  port: process.env.QUE_PORT,
  passwd: process.env.QUE_PASS,
  logger: log,
  type: 'localQue'
})
let redisReady = false
const initRedis = async()=>{
  try{
    await redis.init()
    let status = await redis.ping()
    if(status === 'PONG'){
      redisReady = true
      log.info('redis connection successful...')
    }else{
      log.error('redis connection error. Will try again in 5 seconds...')
      setTimeout(initRedis, 5000)
    }
  }catch(e){
    log.error(e);
    setTimeout(initRedis, 5000)
  }
}
initRedis()
module.exports.localQue = redis
module.exports.localQueStatus = ()=>{
  return redisReady
}
