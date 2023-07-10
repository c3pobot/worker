'use strict'
module.exports = async(obj, shard, opt)=>{
  try{
    let schedule, msg2send = {content: 'You did not provide the correct information'}
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
      if(opt.find(x=>x.name == 'channel')) tempRot.chId = opt.find(x=>x.name == 'channel').value
      if(opt.find(x=>x.name == 'role')){
        if(opt.find(x=>x.name == 'role').value.startsWith('<@&')){
          tempRot.roleId = opt.find(x=>x.name == 'role').value.replace(/[<@&>]/g, '')
        }else{
          delete tempRot.roleId

        }
      }
      if(opt.find(x=>x.name == 'hours')) tempRot.startTime = opt.find(x=>x.name == 'hours').value
      if(opt.find(x=>x.name == 'notify')) tempRot.notify = opt.find(x=>x.name == 'notify').value
      if(opt.find(x=>x.name == 'order')) tempRot.order = opt.find(x=>x.name == 'order').value
      if(opt.find(x=>x.name == 'potime')){
        let allyCode, pObj
        if(opt.find(x=>x.name == 'potime').value.replace(/-/g, '') > 999999) allyCode = opt.find(x=>x.name == 'potime').value.replace(/-/g, '')
        if(!allyCode){
          let dObj = (await mongo.find('shardPlayerCache', {dId: opt.find(x=>x.name == 'potime').value.replace(/[<@!>]/g, ''), shardId: shard._id}))[0]
          if(dObj && dObj.allyCode) allyCode = dObj.allyCode
          if(!allyCode){
            dObj = await HP.GetDiscordAC(opt.find(x=>x.name == 'potime').value.replace(/[<@!>]/g, ''))
            if(dObj && dObj.allyCode) allyCode = dObj.allyCode
          }
        }
        if(allyCode) pObj = await Client.post('getArenaPlayer', {allyCode: allyCode}, null)
        if(pObj && (pObj.poOffSet || pObj.poOffSet == 0)) tempRot.poOffSet = pObj.poOffSet
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
