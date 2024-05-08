'use strict'
const log = require('logger')
const { addGuildCmd } = require('src/helpers/discordmsg')

module.exports = async(obj = {})=>{
  try{
    if(!obj.guild_id || !obj.cmds || obj.cmds?.length == 0) return
    let status = await addGuildCmd(obj.guild_id, obj.cmds, 'PUT')
  }catch(e){
    log.error(e)
  }
}
