'use strict'
module.exports = async(obj, shard, opt)=>{
  try{
    let schedule, msg2send = {content: 'Rotation schedule not found'}
    const rots = (await mongo.find('shardRotations', {_id: shard._id}))[0]
    if(opt && opt.find(x=>x.name == 'schedule')) schedule = opt.find(x=>x.name == 'schedule').value.toUpperCase()
    if(schedule && rots && rots[schedule]){
      msg2send.content = 'There needs to be at least 2 players to advance the schedule'
      if(rots[schedule].players && rots[schedule].players.length > 1){
        const tempPlayer = rots[schedule].players.shift()
        rots[schedule].players.push(tempPlayer)
        await mongo.set('shardRotations', {_id: shard._id}, {[schedule]: rots[schedule]})
        msg2send.content = await HP.ShowRotationSchedule(obj, rots[schedule], shard, true)
        if(!rots[schedule].poOffSet && rots[schedule].poOffSet != 0) msg2send.content += '**Note: There is no poOffSet for the rotation schedule.\nYou need to provide an allyCode or mention a user that has allyCode linked to discordId**'
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
