'use strict'
const log = require('logger')
const Queue = require('bull')

const cmdProcessor = require('./cmdProcessor')
const processLocalQue = require('./processLocalQue')
const { CmdMap } = require('helpers/cmdMap')

const PRIVATE_WORKER = process.env.PRIVATE_WORKER || false
const NUM_JOBS = +(process.env.NUM_JOBS || 1)
let workerTypes = ['discord', 'oauth', 'swgoh']
if(process.env.WORKER_TYPES) workerTypes = JSON.parse(process.env.WORKER_TYPES)

const CmdQue = {}

const queOpts = {
  redis: {
    host: process.env.REDIS_SERVER,
    port: +process.env.REDIS_PORT,
    password: process.env.REDIS_PASS
  },
  settings: {
    maxStalledCount: 0
  }
}
const CreateQues = async()=>{
  try{
    for(let i in workerTypes){
      let queName = workerTypes[i]
      if(PRIVATE_WORKER) queName += 'Private'
      log.info(`Creating ${queName} worker que...`)
      CmdQue[queName] = new Queue(queName, queOpts)
    }
  }catch(e){
    log.error(e);
    setTimeout(CreateQues, 5000)
  }
}
CreateQues()
const StartQues = async()=>{
  try{
    if(CmdMap?.map?.cmdCount > 0 && Object.values(CmdQue)?.length > 0){
      await processLocalQue()
      for(let i in CmdQue){
        if(CmdQue[i]){
          log.info(`starting ${i} processing with ${NUM_JOBS} workers...`)
          CmdQue[i].process('*', +NUM_JOBS, cmdProcessor)
        }
      }
      return
    }
    setTimeout(StartQues, 5000)
  }catch(e){
    log.error(e)
    setTimeout(StartQues, 5000)
  }
}
module.exports.start = StartQues
module.exports.removeJob = async(jobId, queName)=>{
  try{
    if(!CmdQue[queName]) return
    let job = await CmdQue[queName].getJob(jobId)
    if(job){
      await job.moveToCompleted(null, true, true)
      await job.remove()
    }
  }catch(e){
    return
  }
}
