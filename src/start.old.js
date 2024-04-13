'use strict'
const fs = require('fs')
if(!process.env.CMD_QUE_NAME) process.env.CMD_QUE_NAME = 'swgoh'
require('src/globals')
require('src/expressServer')
const QueWrapper = require('quewrapper')
const SaveSlashCmds = require('cmd2array')
process.on('unhandledRejection', error => {
  //console.log(error.name+': '+error.message)
  console.log(error)
});
const cmdQueOpts = {
  queName: process.env.CMD_QUE_NAME || 'swgoh',
  numJobs: +process.env.NUM_JOBS || 3,
  queOptions: {
    redis: {
      host: process.env.QUE_SERVER,
  		port: +process.env.QUE_PORT,
  		password: process.env.QUE_PASS
    }
  },
  localQue: localQue,
  localQueKey: process.env.LOCAL_QUE_KEY
}
if(process.env.PRIVATE_WORKER) cmdQueOpts.queName += 'Private'
const CmdQue = new QueWrapper(cmdQueOpts)
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
    console.log('Mongo connection successful on shard '+process.env.SHARD_NUM)
    if(+process.env.ALLOW_ALL_CUSTOM_REACTIONS > 0){
      gameDataReady = 1
    }else{
      StartServices()
    }
  }else{
    console.log('Mongo error on shard '+shardId+'. Will try again in 10 seconds')
    setTimeout(()=>CheckMongo(), 5000)
  }
}
const StartServices = async()=>{
  try{
    if(process.env.SHARD_NUM?.toString().endsWith("0")) await SaveSlashCmds(baseDir+'/src/cmds', 'swgoh')
    await CreateCmdMap()
    await UpdateBotSettings()
    await CheckAPIReady()
    await UpdateSyncGuilds()
    StartQue()
  }catch(e){
    console.error(e);
    setTimeout(StartServices, 5000)
  }
}
const CheckAPIReady = async()=>{
  const obj = await Client.post('metadata')
  if(obj?.latestGamedataVersion){
    console.log('API is ready ..')
    UpdateGameData()
  }else{
    console.log('API is not ready. Will try again in 5 seconds')
    setTimeout(()=>CheckAPIReady(), 5000)
  }
}
const CreateCmdMap = async()=>{
  try{
    const obj = (await mongo.find('slashCmds', {_id: 'swgoh'}))[0]
    if(obj?.cmdMap) CmdMap = obj.cmdMap
    setTimeout(CreateCmdMap, 60000)
  }catch(e){
    console.error(e);
    setTimeout(CreateCmdMap, 5000)
  }
}
const UpdateBotSettings = async()=>{
  try{
    const obj = (await mongo.find('botSettings', {_id: "1"}))[0]
    if(obj) botSettings = obj
    setTimeout(UpdateBotSettings, 60000)
  }catch(e){
    setTimeout(UpdateBotSettings, 5000)
    console.error(e)
  }
}
const UpdateGameData = async()=>{
  try{
    const obj = await redis.get('gameDataVersions')
    if(obj && obj.gameVersion !== gameVersion){
      console.log('Pulling new gameData')
      const tempData = await redis.get('gameData')
      if(tempData?.version && tempData?.data && tempData.version === obj.gameVersion){
        gameVersion = tempData.version;
        gameData = tempData.data
        HP.UpdateUnitsList()
        gameDataReady = 1
      }
    }
    setTimeout(UpdateGameData, 5000)
  }catch(e){
    console.log(e)
    setTimeout(UpdateGameData, 5000)
  }
}
const UpdateSyncGuilds = async()=>{
  try{
    let obj = await mongo.find('guilds', {sync: 1}, {_id: 1, sync: 1})
    if(obj){
       obj = obj.filter(x=>x.sync && x._id).map(x=>x._id)
       syncGuilds = obj
    }
    setTimeout(UpdateSyncGuilds, 30000)
  }catch(e){
    console.error(e);
    setTimeout(UpdateSyncGuilds, 30000)
  }
}
const StartQue = ()=>{
  try{
    if(gameDataReady && CmdMap){
      CmdQue.start()
    }else{
      setTimeout(StartQue, 5000)
    }
  }catch(e){
    console.error(e);
    setTimeout(StartQue, 5000)
  }
}
InitRedis()
