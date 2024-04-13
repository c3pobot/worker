const log = require('logger')
const mongo = require('mongoclient')
let botSettings = {}, mongoReady = mongo.status(), notify = true
const update = async()=>{
  try{
    if(!mongoReady) mongoReady = mongo.status()
    if(mongoReady){
      let data = (await mongo.find('botSettings', {_id: 1}, {_id: 0, TTL: 0}))[0]
      if(data){
        for(let i in data) botSettings[i] = data[i]
        botSettings.ready = true
        if(notify){
          notify = false
          log.info(`updated botSettings...`)
        }
      }
    }
    setTimeout(update, 60000)
  }catch(e){
    log.error(e)
    setTimeout(update, 5000)
  }
}
update()
module.exports = { botSettings }
