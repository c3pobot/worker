'use strict'
const { GetRaidMsg } = require('./helper')
module.exports = async(obj, opt, guild)=>{
  try{
    let msg2send = {content: 'Error getting info'}
    const schedule = await mongo.find('raidSchedule', {guildId: guild._id})
    if(schedule){
      const embedMsg = await GetRaidMsg(schedule, guild.guildName)
      if(embedMsg){
        msg2send.content = null
        msg2send.embeds = [embedMsg]
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
  }
}
