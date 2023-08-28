'use strict'
const path = require('path')
const log = require('logger')
const mongo = require('mongoclient')
const { v4: uuidv4 } = require('uuid')

const sendMsg = require('./sendMsg')
const discordQuery = require('./discordQuery')
const CLIENT_ID = process.env.DISCORD_CLIENT_ID

const checkCmds = async()=>{
  try{
    let count = 0, shard = 0, guild = 0
    let obj = await mongo.find('commandUpdates', {})
    if(!obj || obj?.length === 0) return
    log.debug('found '+obj.length+' commands to update...')
    for(let i in obj){
      if(!obj[i].data) continue
      let status = await addCommands(obj[i])
      if(status){
        ++count
        if(obj[i].type === 'shard') ++shard
        if(obj[i].type === 'guild') ++guild
      }
    }
    if(count === +obj.length && obj[0].sId && obj[0].chId && obj[0].dId){
      let msg2send = '<@'+obj[0].dId+'> added '+guild+' guild commands and '+shard+' shard commands...'
      await mongo.set('adminMessages', {_id: uuidv4()}, {sId: obj[0].sId, chId: obj[0].chId, content: {content: msg2send} })
    }
  }catch(e){
    throw(e)
  }
}
const addCommands = async(obj = {})=>{
  try{
    let status = await discordQuery(path.join('applications', CLIENT_ID, 'guilds', obj._id, 'commands'), 'PUT', JSON.stringify(obj.data))
    if(status?.length === obj.data.length && status[0]?.guild_id === obj._id){
      await mongo.del('commandUpdates', {_id: obj._id})
      return true
    }else{
      log.error('error updating guild '+obj._id)
      log.error(JSON.stringify(status))
    }
  }catch(e){
    throw(e)
  }
}
const syncUpdates = async()=>{
  try{
    await checkCmds()
    await syncMessages()
    setTimeout(syncUpdates, 30000)
  }catch(e){
    log.error(e)
    setTimeout(syncUpdates, 5000)
  }
}
const syncMessages = async()=>{
  try{
    let obj = await mongo.find('adminMessages', {})
    if(!obj || obj?.length === 0) return
    log.debug('found '+obj.length+' messages to send...')
    for(let i in obj){
      let status = await sendMsg(obj[i])
      if(status?.id) await mongo.del('adminMessages', {_id: obj[i]._id})
    }
  }catch(e){
    throw(e)
  }
}
const checkMongo = ()=>{
  try{
    if(!CLIENT_ID) throw('discord client id not provided...')
    let status = mongo.status()
    if(status){
      syncUpdates()
      return
    }
    setTimeout(checkMongo, 5000)
  }catch(e){
    log.error(e)
    setTimeout(checkMongo, 5000)
  }
}
checkMongo()
