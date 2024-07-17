'use strict'
module.exports = (raid = {})=>{
  if(!raid.raidId) return

  let res = { guildRewardScore: +(raid.guildRewardScore || 0), scores: {}, endTime: +raid.endTime  }
  for(let i in raid.raidMember){
    if(res.scores[raid.raidMember[i].playerId]) continue
    res.scores[raid.raidMember[i].playerId] = { playerId: raid.raidMember[i].playerId, score: +(raid.raidMember[i].memberProgress || 0), rank: raid.raidMember[i].rank }
  }
  return res
}
