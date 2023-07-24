'use strict'
const path = require('path')
const CLIENT_ID = process.env.DISCORD_CLIENT_ID
const IS_TEST_BOT = process.env.IS_TEST_BOT
const { log, mongo, ReplyMsg, DiscordQuery } = require('helpers')
module.exports = async(obj = {})=>{
  try{
    let msg2send = {content: "Error getting SlashCmds from DB"}, globalCmds = [], payload = {}
    if(!CLIENT_ID){
      ReplyMsg(obj, { content: 'Discord client id is not provided.'})
      return
    }
    if(process.env.IS_TEST_BOT){
      let status = await DiscordQuery(path.join('applications', CLIENT_ID, 'commands'), 'PUT', JSON.stringify([]))
      if(status) log.debug(JSON.stringify(status))
      ReplyMsg(obj, { content: 'No global commands for the test bot'})
      return
    }
    let slashCmds = await mongo.find('slashCmds', payload)
    if(slashCmds.length == 0) msg2send.content = 'There are no slashCmds saved in the database'
    if(slashCmds.length > 0){
      msg2send.content = "Error parsing SlashCmds"
      for(let i in slashCmds){
        let tempCmds = slashCmds[i].cmds.filter(x=>x.type && x.type.includes('public')).map(c=>c.cmd)
        if(tempCmds.length > 0) globalCmds = globalCmds.concat(tempCmds)
      }
    }
    if(globalCmds?.length > 0){
      let status = await DiscordQuery(path.join('applications', CLIENT_ID, 'commands'), 'PUT', JSON.stringify(globalCmds))
      msg2send.content = '**'+(status?.length >= 0 ? status.length:0)+'** of **'+globalCmds.length+'** global commands where updated'
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
