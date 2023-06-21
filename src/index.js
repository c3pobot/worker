'use strict'
const MongoWrapper = require('mongowrapper')
const RedisWrapper = require('rediswrapper')
const SocketWrapper = require('socketclient')
global.BotSocket = new SocketWrapper({  url: process.env.SOCKET_SVC_URI })
global.mongo = new MongoWrapper({
  url: 'mongodb://'+process.env.MONGO_USER+':'+process.env.MONGO_PASS+'@'+process.env.MONGO_HOST+'/',
  authDb: process.env.MONGO_AUTH_DB,
  appDb: process.env.MONGO_DB,
  repSet: process.env.MONGO_REPSET
})
global.redis = new RedisWrapper({
  host: process.env.REDIS_SERVER,
  port: process.env.REDIS_PORT,
  passwd: process.env.REDIS_PASS
})
global.localQue = new RedisWrapper({
  host: process.env.QUE_SERVER,
  port: process.env.QUE_PORT,
  passwd: process.env.QUE_PASS,
  type: "localQue"
})
global.HP = require('./helpers')
global.MSG = require('discordapiwrapper')
const InitRedis = async()=>{
  try{
    await redis.init()
    const redisStatus = await redis.ping()
    if(redisStatus == 'PONG'){
      console.log('redis connection successful...')
      InitLocalQue()
    }else{
      console.log('redis connection error. Will try again in 5 seconds...')
      setTimeout(InitRedis, 5000)
    }
  }catch(e){
    console.error('redis connection error. Will try again in 5 seconds...')
    setTimeout(InitRedis, 5000)
  }
}
const InitLocalQue = async()=>{
  try{
    await localQue.init()
    const queStatus = await localQue.ping()
    if(queStatus == 'PONG'){
      console.log('localQue connection successful...')
      CheckMongo()
    }else{
      console.log('localQue connection error. Will try again in 5 seconds...')
      setTimeout(InitLocalQue, 5000)
    }
  }catch(e){
    console.error('localQue connection error. Will try again in 5 seconds...')
    setTimeout(InitLocalQue, 5000)
  }
}
const CheckMongo = async()=>{
  const status = await mongo.init();
  if(status > 0){
    mongoReady = 1
    console.log('Mongo connection successful...')
    StartServices()
  }else{
    console.error('Mongo connection error. Will try again in 10 seconds')
    setTimeout(()=>CheckMongo(), 5000)
  }
}
const StartServices = async()=>{
  try{
    require('./cmdQue')
  }catch(e){
    console.error(e);
    setTimeout(StartServices, 5000)
  }
}
InitRedis()
