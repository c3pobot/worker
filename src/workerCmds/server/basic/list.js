'use strict'
const { mongo, GetOptValue, ReplyMsg } = require('helpers')
const { GetGuild } = require('discordapiclient')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'There are not servers with basic commands enabled'}
    const guilds = await mongo.find('discordServer', {basicStatus: 1})
    if(guilds && guilds.length > 0){
      const embedMsg = {
        color: 15844367,
        title: 'C3PO Servers with basic commands enabled',
        description: '```\n'
      }
      for(let i in guilds){
        const guild = await GetGuild(guilds[i]._id)
        embedMsg.description += guilds[i]._id+' : '+(guild ? guild.name:'UNKNOWN')+'\n'
      }
      embedMsg.description += '```'
      msg2send.embeds = [embedMsg]
      msg2send.content = null
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
