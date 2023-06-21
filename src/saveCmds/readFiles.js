'use strict'
const fs = require('fs')
const GetSubCommands = async(dir)=>{
  try{
    return new Promise(resolve=>{
      fs.readdir(dir, async(err, filenames)=>{
        let res
        if(err) {
          console.error(err)
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
    console.error(e)
  }
}
const ReadFile = async(file)=>{
  try{
    const obj = await fs.readFileSync(file)
    if(obj) return JSON.parse(obj)
  }catch(e){
    console.error('Error reading file '+file)
  }
}
module.exports = (dir)=>{
  return new Promise(resolve=>{
    try{
      fs.readdir(dir, async(err, filenames)=>{
        const data = {}
        if(err) {
          console.error(err)
        }else{
          for(let i in filenames){
            if(filenames[i].split('.').length == 1){
              const obj = await ReadFile(dir+'/'+filenames[i]+'/cmd.json')
              if(!obj?.cmd?.name || !obj?.que) continue;
              if(!data[obj.que]) data[obj.que] = { cmdMap: {}, cmds: [] }
              if(obj?.cmd?.options?.length == 0){
                //has GetSubCommands
                const subCommands = await GetSubCommands(dir+'/'+filenames[i])
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
      console.error(e)
      resolve()
    }
  })
}
