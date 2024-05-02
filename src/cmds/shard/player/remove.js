'use strict'
const log = require('logger')
const mongo = require('mongoclient')

const { checkShardAdmin, confirmButton } = require('src/helpers')

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

module.exports = async(obj = {}, shard = {}, opt = [])=>{
  if(obj.confirm?.response == 'no') return { content: 'command canceled...' }
  let auth = await checkShardAdmin(obj, shard)
  if(!auth) return { content: 'Only shard admins are able to remove players' }

  msg2send.content = 'You did not provide the correct information'
  let allyCode = opt.allycode?.value?.toString().trim()?.replace(/-/g, '')
  if(!allyCode) return { content: 'you did not provide an allyCode' }

  let pObj = (await mongo.find('shardPlayers', { _id: allyCode+'-'+shard._id }))[0]
  if(!pObj?.allyCode) return { content: '**'+allyCode+'** is not in the shard list' }

  if(!obj.confirm){
    await confirmButton(obj, 'Are you sure you want to remove **'+pObj.name+'** from the shard list?')
    return;
  }
  if(obj.confirm?.response == 'yes'){
    await mongo.del('shardRankCache', {_id: pObj._id})
    await mongo.del('shardPlayers', {_id: pObj._id})
    deleteCachedPlayer(pObj._id, 10)
    return { content: 'Removed **'+pObj.name+'** from the shard list' }
  }
  return { content: 'command canceled' }
}
