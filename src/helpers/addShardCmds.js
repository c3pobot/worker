'use strict'
const { botSettings } = require('src/helpers/botSettings')
const mongo = require('mongoclient')
const BOT_OWNER_ID = process.env.BOT_OWNER_ID
const { AddGuildCmd } = require('./discordmsg')
module.exports = async(sId)=>{
  if(!sId) return
  let slashCmds = (await mongo.find('slashCmds', { _id: 'swgoh' }))[0]
  let cmds = slashCmds?.cmds?.filter(x=>x.type === 'shard')?.map(x=>x?.cmd)
  if(!cmds || cmds?.length == 0) return

  let count = 0
  for(let i in cmds){
    let status = await AddGuildCmd(sId, cmds[i], 'POST')
    if(status?.id) count++
  }
  if(count > 0 && +cmds?.length == count) return true
}
