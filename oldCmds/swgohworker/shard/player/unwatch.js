'use strict'
module.exports = async(obj, shard, opt)=>{
  try{
    let rank, msg2send = {content: 'You are not part of the shard list'}
    if(opt && opt.find(x=>x.name == 'rank')) rank = opt.find(x=>x.name == 'rank').value
    let pObj = (await mongo.find('shardPlayers', {dId: obj.member.user.id, shardId: shard._id}))[0]
    if(!pObj){
      const dObj = await HP.GetDiscordAC(obj.member.user.id)
      if(dObj && dObj.allyCode) pObj = (await mongo.find('shardPlayers', {_id: dObj.allyCode+'-'+shard._id}))[0]
    }
    if(pObj){
      if(rank){
        await mongo.delMany('shardWatch', {pId: pObj.allyCode+'-'+shard._id, rank: rank})
        msg2send.content = 'Rank watch for rank **'+rank+'** has been removed'
      }else{
        await mongo.delMany('shardWatch', {pId: pObj.allyCode+'-'+shard._id})
        msg2send.content = 'You have removed any active rank watche'
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
