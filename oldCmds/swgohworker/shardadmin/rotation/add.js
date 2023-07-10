'use strict'
const { GetPlayers } = require('./helper')
module.exports = async(obj, shard, opt)=>{
  try{
    let schedule, players = [], chId, roleId, msg2send = {content: 'You did not provide the correct information'}
    if(opt && opt.find(x=>x.name == 'schedule')) schedule = opt.find(x=>x.name == 'schedule').value.toUpperCase()
    if(schedule){
      let tempRot = {
        id: schedule,
        chId: obj.channel_id,
        sId: shard.sId,
        shardId: shard._id,
        type: shard.type,
        startTime: 2,
        order: 'normal',
        notify: 'off',
        notifyStart: 0,
        players: []
      }
      const rots = (await mongo.find('shardRotations', {_id: shard._id}))[0]
      if(rots && rots[schedule]) tempRot = rots[schedule]
      if(opt.find(x=>x.name == 'players')){
        players = opt.find(x=>x.name == 'players').value.split(',')
        if(players.length > 0){
          const pArray = await GetPlayers(shard, players)
          if(pArray && pArray.players.length > 0){
            for(let i in pArray.players){
              if(tempRot.players.filter(x=>x.name == pArray.players[i].name).length == 0) tempRot.players.push(pArray.players[i])
            }
          }
          if(pArray && (pArray.poOffSet || pArray.poOffSet == 0)) tempRot.poOffSet = pArray.poOffSet
        }
      }
      await mongo.set('shardRotations', {_id: shard._id}, {[schedule]: tempRot})
      msg2send.content = await HP.ShowRotationSchedule(obj, tempRot, shard, true)
      if(!tempRot.poOffSet && tempRot.poOffSet != 0) msg2send.content += '**Note: There is no poOffSet for the rotation schedule.\nYou need to provide an allyCode or mention a user that has allyCode linked to discordId**'
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
