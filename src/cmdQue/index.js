const QueWrapper = require('quewrapper')
const CmdProcessor = require('./cmdProcessor')
const CmdQue = {}
const redisConnection = {
  host: process.env.QUE_SERVER,
	port: +process.env.QUE_PORT,
	password: process.env.QUE_PASS
}
let workerTypes = ['discord']
if(process.env.WORKER_TYPES) workerTypes = JSON.parse(process.env.WORKER_TYPES)
const PRIVATE_WORKER = +(process.env.PRIVATE_WORKER || 0)
const NUM_QUE_JOBS = +(process.env.NUM_JOBS || 3)
const CreateQues = async()=>{
  try{
    for(let i in workerTypes){
      const opts = { queOptions: {redis: redisConnection}, queName: workerTypes[i], cmdProcessor: CmdProcessor.process, numJobs: NUM_QUE_JOBS }
      if(PRIVATE_WORKER) opts.queName += 'Private'
      if(localQue && localQueKey){
        opts.localQue = localQue
        opts.localQueKey = localQueKey
      }
      console.log('Creating '+opts.queName+' worker que...')
      CmdQue[queName] = new QueWrapper(opts)
    }
    StartQues()
  }catch(e){
    console.error(e);
    setTimeout(CreateQues, 5000)
  }
}
const StartQues = async()=>{
  try{
    let cmdCount = await CmdProcessor.checkCmdMap()
    if(cmdCount > 0){
      for(let i in CmdQue) CmdQue[i].start()
    }else{
      setTimeout(StartQues, 5000)
    }
  }catch(e){
    console.error(e);
    setTimeout(StartQues, 5000)
  }
}
CreateQues()
