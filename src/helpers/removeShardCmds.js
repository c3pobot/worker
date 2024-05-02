'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const { deleteGuildCmds, getGuildCmds } = require('./discordmsg')

module.exports = async(sId)=>{
  try{
    if(!sId) return
    let slashCmds = (await mongo.find('slashCmds', { _id: 'swgoh' }))[0]
    let cmds = slashCmds?.cmds?.filter(x=>x.type === 'shard')?.map(x=>x?.cmd?.name)
    if(!cmds || cmds?.length == 0) return
    let cmdSet = new Set(cmds)
    let guildCmds = await getGuildCmds(sId)
    if(!guildCmds || guildCmds?.length == 0) return
    let count = 0, success = 0
    for(let i in guildCmds){
      if(cmdSet?.has(guildCmds[i]?.name)){
        count++
        let status = await deleteGuildCmds(sId, guildCmds[i].id)
        if(status) success++
      }
    }
    return { count: count, success: success }
  }catch(e){
    log.error(e)
  }
}
