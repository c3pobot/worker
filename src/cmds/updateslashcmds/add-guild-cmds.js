'use strict'
const log = require('logger')
const { AddGuildCmd } = require('src/helpers/discordmsg')

module.exports = async(obj = {})=>{
  try{
    if(!obj.guild_id || !obj.cmds || obj.cmds?.length == 0) return
    await AddGuildCmd(obj.guild_id, obj.cmds, 'PUT')
  }catch(e){
    log.error(e)
  }
}
