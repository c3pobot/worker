'use strict'
const log = require('logger')
const fs = require('fs')
let workerTypes = ['discord', 'oauth', 'swgoh']
if(process.env.WORKER_TYPES) workerTypes = JSON.parse(process.env.WORKER_TYPES)
const GetSubCommands = async(dir)=>{
  try{
    return new Promise(resolve=>{
      fs.readdir(dir, async(err, filenames)=>{
        let res
        if(err) {
          log.error(err)
        }else{
          res = []
          for(let i in filenames){
            if(filenames[i].split('.').length == 1){
              const obj = await ReadFile(dir+'/'+filenames[i]+'/cmd.json')
              if(obj?.name) res.push(obj)
            }
          }
        }
        resolve(res)
      })
    })
  }catch(e){
    log.error(e)
  }
}
const ReadFile = async(file)=>{
  try{
    let obj = await fs.readFileSync(file)
    if(obj) return JSON.parse(obj)
  }catch(e){
    log.error('Error reading file '+file)
  }
}
module.exports = (dir)=>{
  return new Promise(resolve=>{
    try{
      fs.readdir(dir, async(err, filenames)=>{
        const data = {}
        if(err) {
          log.error(err)
        }else{
          for(let i in filenames){
            if(filenames[i].split('.').length == 1){
              let obj = await ReadFile(dir+'/'+filenames[i]+'/cmd.json')
              if(!obj?.cmd?.name || !obj?.que) continue;
              if(workerTypes.filter(x=>x === obj.que).length === 0) continue;
              if(!data[obj.que]) data[obj.que] = { cmdMap: {}, cmds: [] }
              if(obj?.cmd?.options?.length == 0){
                //has GetSubCommands
                let subCommands = await GetSubCommands(dir+'/'+filenames[i])
                if(subCommands?.length > 0) obj.cmd.options = subCommands
              }
              data[obj.que].cmds.push(obj)
              data[obj.que].cmdMap[obj.cmd.name] = {type: obj.type, worker: obj.que}
            }
          }
        }
        resolve(data)
      })
    }catch(e){
      log.error(e)
      resolve()
    }
  })
}
