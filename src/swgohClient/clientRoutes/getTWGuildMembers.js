'use strict'
const getPlayer = require('./getPlayer');
const cache = require('src/helpers/cache/player');
const maxRetry = 6

const filterMembers = (all = [], found = [])=>{
  if(found?.length === 0) return all
  let foundIds = found?.map(x=>x.playerId);
  return all.filter(x=>!foundIds.includes(x.playerId));
}

const getMember = async(playerId, projection)=>{
  let data = await cache.get('twPlayerCache', playerId, null, projection)
  if(!data){
    data = await cache.get('playerCache', playerId, null)
    if(data?.allyCode) cache.set('twPlayerCache', playerId, JSON.stringify(data))
  }
  if(!data) data = await getPlayer({ playerId: playerId }, { collection: 'twPlayerCache', projection: projection }, false)
  return data
}

const getMembers = async(members = [], projection)=>{
  let array = [], i = members.length
  while(i--) array.push(getMember(members[i].playerId, projection))
  let res = await Promise.allSettled(array)
  return res?.filter(x=>x?.value?.playerId)?.map(x=>x.value)
}

module.exports = async(members = [], projection)=>{
  let count = 0, res = []
  while(count < maxRetry){
    let tempMembers = filterMembers(members, res)
    let tempRes = await getMembers(tempMembers, projection)
    if(tempRes?.length === members?.length) return tempRes
    if(tempRes?.length > 0) res = res.concat(tempRes)
    if(res?.length === members?.length) break;
    count++
  }
  return res
}
