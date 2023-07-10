'use strict'
module.exports = async(obj, shard, opt)=>{
  try{
    let rank, msg2send = {content: 'You did not provide a rank to watch'}
    if(opt && opt.find(x=>x.name == 'rank')) rank = opt.find(x=>x.name == 'rank').value
    if(rank){
      msg2send.content = 'You are not part of the shard list'
      let pObj = (await mongo.find('shardPlayers', {dId: obj.member.user.id, shardId: shard._id}))[0]
      if(!pObj){
        const dObj = await HP.GetDiscordAC(obj.member.user.id)
        if(dObj && dObj.allyCode) pObj = (await mongo.find('shardPlayers', {_id: dObj.allyCode+'-'+shard._id}))[0]
      }
      if(pObj && pObj.allyCode){
        const tempId = +Date.now() + +pObj.allyCode
        const tempObj = {
          allyCode: +pObj.allyCode,
          dId: obj.member.user.id,
          shardId: shard._id,
          pId: pObj.allyCode+'-'+shard._id,
          rank: +rank,
          sId: obj.sId,
          catId: obj.catId,
          method: pObj.notify.method,
          logChannel: shard.logChannel,
          type: shard.type
        }
        await mongo.set('shardWatch', {_id: tempId.toString()}, tempObj)
        msg2send.content = 'You have been set to be notified when player at rank **'+rank+'** moves'
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
