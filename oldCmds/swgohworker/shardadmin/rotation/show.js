'use strict'
module.exports = async(obj, shard, opt)=>{
  try{
    let schedule, msg2send = {content: "There are not shard rotation schedules"}
    const rots = (await mongo.find('shardRotations', {_id: shard._id}))[0]
    if(rots){
      delete rots._id
      delete rots.TTL
      if(opt && opt.find(x=>x.name == 'schedule')) schedule = opt.find(x=>x.name == 'schedule').value.toUpperCase()
      if(schedule){
        if(rots[schedule]){
          msg2send.content = await HP.ShowRotationSchedule(obj, rots[schedule], shard, true)
          if(!rots[schedule].poOffSet && rots[schedule].poOffSet != 0) msg2send.content += '**Note: There is no poOffSet for the rotation schedule.\nYou need to provide an allyCode or mention a user that has allyCode linked to discordId**'
        }
      }else{
        const guild = await MSG.GetGuild(shard.sId)
        msg2send.content = '>>> '+(guild ? guild.name+' ':'')+'Shard rotation schedules\n```\n'
        for(let i in rots) msg2send.content += rots[i].id+' ('+(rots[i].players ? rots[i].players.length:0)+')\n'
        msg2send.content += '```'
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
