const { mongoStatus, redis, log } = require('helpers')
const GAME_API_NEEDED = process.env.GAME_API_NEEDED

const QueWrapper = require('quewrapper')
const CmdProcessor = require('./cmdProcessor')
const localQueKey = process.env.LOCAL_QUE_KEY
const CmdQue = {}
const redisConnection = {
  host: process.env.REDIS_SERVER,
	port: +process.env.REDIS_PORT,
	password: process.env.REDIS_PASS
}
let workerTypes = ['discord', 'oauth', 'swgoh']
if(process.env.WORKER_TYPES) workerTypes = JSON.parse(process.env.WORKER_TYPES)
const PRIVATE_WORKER = process.env.PRIVATE_WORKER || false
const NUM_QUE_JOBS = +(process.env.NUM_JOBS || 3)
let gameApiReady = false, swgohClient
if(GAME_API_NEEDED){
  swgohClient = require('swgohClient')
  const CheckApiReady = async()=>{
    try{
      let status = await swgohClient('getStatus')
      if(status){
        gameApiReady = true
        return
      }
      setTimeout(CheckApiReady, 5000)
    }catch(e){
      log.error(e)
      setTimeout(CheckApiReady, 5000)
    }
  }
  CheckApiReady()
}else{
  gameApiReady = true
}

const CreateQues = async()=>{
  try{
    for(let i in workerTypes){
      const opts = { queOptions: {redis: redisConnection}, queName: workerTypes[i], cmdProcessor: CmdProcessor.process, numJobs: NUM_QUE_JOBS, logger: log }
      if(PRIVATE_WORKER) opts.queName += 'Private'
      if(redis && localQueKey){
        opts.localQue = redis
        opts.localQueKey = localQueKey
      }
      log.debug('Creating '+opts.queName+' worker que...')
      CmdQue[opts.queName] = new QueWrapper(opts)
    }
    StartQues()
  }catch(e){
    log.error(e);
    setTimeout(CreateQues, 5000)
  }
}
const StartQues = async()=>{
  try{
    let mongoReady = mongoStatus()
    let cmdCount = await CmdProcessor.checkCmdMap()
    if(cmdCount > 0 && mongoReady && gameApiReady){
      for(let i in CmdQue) CmdQue[i].start()
    }else{
      setTimeout(StartQues, 5000)
    }
  }catch(e){
    log.error(e);
    setTimeout(StartQues, 5000)
  }
}
CreateQues()
