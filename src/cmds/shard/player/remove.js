'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const deleteCachedPlayer = async(pId, count)=>{
  try{
    let obj = (await mongo.find('shardRankCache', {_id: pId}))[0]
    if(obj) await mongo.del('shardRankCache', {_id: pId})
    count--
    if(count > 0) setTimeout(()=>DeleteCachedPlayer(pId, count), 10000)
  }catch(e){
    log.error(e)
    setTimeout(()=>DeleteCachedPlayer(pId, count), 10000)
  }
}
const { getOptValue, checkShardAdmin, confirmButton } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  let msg2send = {content: 'Only shard admins are able to remove players'}, userConfirm, pObj
  let auth = await checkShardAdmin(obj, shard)
  if(!auth) return msg2send
  if(obj?.confirm?.response) userConfirm = obj.confirm.response
  msg2send.content = 'You did not provide the correct information'
  let allyCode = getOptValue(opt, 'allycode')
  if(allyCode) allyCode = allyCode.replace(/-/g, '').toString().trim()
  if(allyCode && !userConfirm){
    msg2send.content = '**'+allyCode+'** is not in the shard list'
    pObj = (await mongo.find('shardPlayers', {_id: allyCode+'-'+shard._id}))[0]
  }
  if(pObj?.allyCode){
    await confirmButton(obj, 'Are you sure you want to remove **'+pObj.name+'** from the shard list?')
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
      deleteCachedPlayer(pObj._id, 10)
      msg2send.content = 'Removed **'+pObj.name+'** from the shard list'
    }
  }
  return msg2send
}
