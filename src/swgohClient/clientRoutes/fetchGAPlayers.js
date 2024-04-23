'use strict'
const getPlayer = require('./getPlayer');
const cache = require('src/helpers/cache/player');
const maxRetry = 6

const filterMembers = (all = [], found = [])=>{
  if(found?.length === 0) return all
  let foundIds = found?.map(x=>x.playerId);
  return all.filter(x=>!foundIds.includes(x));
}

const getGAPlayer = async(playerId, opponent)=>{
  let data = await cache.get('gaCache', `${playerId}-${opponent}`)
  if(!data) data = await getPlayer({ playerId: playerId })
  if(data && !data?.opponent){
    data.opponent = +opponent
    cache.set('gaCache', `${playerId}-${opponent}`, JSON.stringify(data), false)
  }
  return data
}

const getPlayers = async(players = [], opponent)=>{
  let array = [], i = players.length
  while(i--) array.push(getGAPlayer(players[i], opponent))
  let res = await Promise.allSettled(array)
  return res?.filter(x=>x?.value?.playerId)?.map(x=>x.value)
}
module.exports = async({ players = [], opponent })=>{
  if(players?.length == 0 || !opponent) return
  let count = 0, res = []
  while(count < maxRetry) {
    let tempMembers = filterMembers(players, res)
    let tempRes = await getPlayers(tempMembers, opponent)
    if(tempRes?.length === players?.length) return tempRes
    if(tempRes?.length > 0) res = res.concat(tempRes)
    if(res?.length === players?.length) break;
    count++
  }
  return res
}
