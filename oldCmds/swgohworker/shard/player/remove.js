'use strict'
const DeleteCachedPlayer = async(pId, count)=>{
  const obj = (await mongo.find('shardRankCache', {_id: pId}))[0]
  if(obj){
    if(debugMsg) console.log(pId+' exists')
    await mongo.del('shardRankCache', {_id: pId})
  }else{
    if(debugMsg) console.log(pId+' is deleted')
  }
  count--
  if(count > 0) setTimeout(()=>DeleteCachedPlayer(pId, count), 10000)
}
module.exports = async(obj, shard, opt)=>{
  try{
    let allyCode, msg2send = {content: 'Only shard admins are able to remove players'}, userConfirm, pObj
    if(obj?.confirm?.response) userConfirm = obj.confirm.response
    const auth = await HP.CheckShardAdmin(obj, shard)
    if(auth){
      msg2send.content = 'You did not provide the correct information'
      allyCode = await HP.GetOptValue(opt, 'allycode')
      if(allyCode) allyCode = allyCode.replace(/-/g, '').toString().trim()
    }
    if(allyCode && !userConfirm){
      msg2send.content = '**'+allyCode+'** is not in the shard list'
      pObj = (await mongo.find('shardPlayers', {_id: allyCode+'-'+shard._id}))[0]
    }
    if(pObj?.allyCode){
      await HP.ConfirmButton(obj, 'Are you sure you want to remove **'+pObj.name+'** from the shard list?')
      return;
    }
    if(userConfirm == 'no') msg2send.content = 'Command Canceled'
    if(userConfirm == 'yes'){
      if(allyCode){
        msg2send.content = 'Error removing player'
        pObj = (await mongo.find('shardPlayers', {_id: allyCode+'-'+shard._id}))[0]
      }
      if(pObj){
        await mongo.del('shardRankCache', {_id: pObj._id})
        await mongo.del('shardPlayers', {_id: pObj._id})
        DeleteCachedPlayer(pObj._id, 10)
        msg2send.content = 'Removed **'+pObj.name+'** from the shard list'
      }
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
