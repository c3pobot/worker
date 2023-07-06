'use strict'
const { mongo, GetAllyCodeObj, ReplyButton, ReplyMsg } = require('helpers')
const swgohClient = require('swgohClient')
module.exports.getMapStats = async(obj = {}, dObj = {}, statDef = {}, instanceId)=>{
  try{
    let getMapStats = await swgohClient('getMapStats', { territoryMapId: instanceId }, dObj, obj)
    let currentStat = getMapStats?.data?.currentStat
    if(!currentStat) return
    let res = {}, i = currentStat.length
    while(i--){
      res[currentStat[i].mapStatId] = { mapStatId: currentStat[i].mapStatId, total: 0, nameKey: statDef[currentStat[i].mapStatId] || currentStat[i].mapStatId, playerStat: {} }
      let s = currentStat[i].playerStat.length
      while(s--){
        let score = currentStat[i].playerStat[s].score || 0
        res[currentStat[i].mapStatId].total += +score
        res[currentStat[i].mapStatId].playerStat[currentStat[i].playerStat[s].memberId] = { memberId: currentStat[i].playerStat[s].memberId, score: +score }
      }
    }
    return res
  }catch(e){
    throw(e)
  }
}
module.exports.getGp = (mapStats = {}, member = [], currentRound)=>{
  try{
    let res = { showTotalGp: false, guild: {3: 0, 2: 0, 1: 0}, deployed: 0, player: {} }
    let stat = mapStats['power_round_'+currentRound]
    if(!stat) return
    res.deployed = +stat.total
    let i = member.length
    while(i--){
      if(!res.player[member[i].playerId]) res.player[member[i].playerId] = { playerId: member[i].playerId, name: member[i].playerName, deployed: 0, gp: { 3: +member[i].galacticPower, 2: +member[i].shipGalacticPower, 1: +member[i].characterGalacticPower } }
      res.guild[3] += +member[i].galacticPower || 0, res.guild[2] += +member[i].shipGalacticPower || 0, res.guild[1] += +member[i].characterGalacticPower
      let score = +(stat.playerStat[member[i].playerId]?.score || 0)
      res.player[member[i].playerId].deployed += +score
    }
    return res
  }catch(e){
    throw(e)
  }
}
module.exports.getMissingGp = (player = {})=>{
  try{
    let res = { char: { gp: 0, players: []}, low: { gp: 0, players: []}, total: { gp: 0, players: []} }
    for(let i in player){
      if(player[i].gp[3] - player[i].deployed > 100000){
        res.total.players.push(player[i])
        res.total.gp += player[i].gp[3] - player[i].deployed
        if(player[i].gp[1] > player[i].deployed && player[i].gp[1] - player[i].deployed > 100000){
          res.char.gp += player[i].gp[1] - player[i].deployed
          res.char.players.push(player[i])
        }
        if(player[i].deployed < 2000000){
          res.low.players.push(player[i])
          res.low.gp += player[i].gp[3] - player[i].deployed
        }
      }
    }
    return res
  }catch(e){
    throw(e)
  }
}
module.exports.getTimeTillEnd = (timestamp)=>{
  try{
    let timeNow = Date.now()
    if(+timeNow < +timestamp){
      let delta = Math.abs(+timestamp - +timeNow) / 1000
      let hours = Math.floor(delta / 3600)
      delta -= hours * 3600
      let minutes = Math.floor(delta / 60)
      delta -= minutes * 60
      let seconds = Math.floor(delta)
      return({
        h: hours.toString().padStart(2, '0'),
        m: minutes.toString().padStart(2, '0'),
        s: seconds.toString().padStart(2, '0')
      })
    }else{
      return({
        h: '00',
        m: '00',
        s: '00'
      })
    }
  }catch(e){
    throw(e)
  }
}
