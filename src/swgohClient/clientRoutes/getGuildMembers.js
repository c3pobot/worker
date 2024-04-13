'use strict'
const getPlayer = require('./getPlayer');
const cache = require('../cache/player');

const getMember = async(playerId, projection)=>{
  try{
    let data = await cache.get('playerCache', playerId, null, projection)
    if(!data) data = await getPlayer({ playerId: playerId }, { collection: 'playerCache', projection: projection }, false)
    return data
  }catch(e){
    throw(e)
  }
}

module.exports = async(members = [], projection)=>{
  try{
    let array = [], res = [], i = members.length
    const fetchMember = async(playerId, projection)=>{
      let data = await getMember(playerId, projection)
      if(data?.playerId) res.push(data)
    }
    while(i--) array.push(fetchMember(members[i].playerId, projection))
    await Promise.all(array)
    return res

  }catch(e){
    throw(e)
  }
}
