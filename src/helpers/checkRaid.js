'use strict'
const mongo = require('mongoclient')
const raidInfo = {
  aat: {
    id: 'aat',
    currency: 21,
    open: 90000
  },
  rancor: {
    id: 'rancor',
    currency: 20,
    open: 60000
  },
  sith_raid: {
    id: 'sith_raid',
    currency: 22,
    open: 110000
  },
  rancor_challenge: {
    id: 'rancor_challenge',
    currency: 23,
    open: 180000
  }
}
const addRaidInProgress = async(guildId, raidStatus, raidConfigs, raids)=>{
  for(let i in raidStatus){
    if(raids.find(x=>x.id == raidStatus[i].raidId)){
      let raidConfig = raidConfigs.find(x=>x.raidId == raidStatus[i].raidId)
      let timeNow = Date.now()
      let exists = (await mongo.find('raidSchedule', {_id: raidStatus[i].raidId+'-'+guildId}))[0]
      if(!exists && raidStatus[i].joinPeriodEndTimeMs && ((+raidStatus[i].joinPeriodEndTimeMs - +timeNow) > 2700000) && raidConfig){
        await mongo.set('raidSchedule', {_id: raidStatus[i].raidId+'-'+guildId}, {
          guildId: guildId,
          raidId: raidConfig.raidId,
          time: +raidStatus[i].activateTimeMs,
          sim: raidConfig.autoSimEnabled,
          state: 'join',
          joinPeriod: +raidConfig.joinPeriodDuration * 1000
        })
      }
    }
  }
}
module.exports = async(obj)=>{
  let guildId = obj.profile.id
  let gObj = (await mongo.find('guilds',{_id: guildId,  sync: 1}, {sync:1, raids: 1}))[0]
  if(gObj && gObj.sync > 0 && gObj.raids && gObj.raids.length > 0){
    let raidConfig = obj.profile.raidLaunchConfig
    let currency = obj.inventory.currencyItem
    let raidStatus = obj.raidStatus
    let guildReset = +obj.nextChallengesRefresh * 1000
    for(let i in raidConfig){
      if(gObj.raids.find(x=>x.id == raidConfig[i].raidId) && raidInfo[raidConfig[i].raidId] && raidStatus.filter(x=>x.raidId == raidConfig[i].raidId).length == 0){
        let currentCurrency = currency.find(x=>x.currency == raidInfo[raidConfig[i].raidId].currency).quantity
        let timeNow = (new Date()).getTime()
        let launchTime = new Date()
        launchTime.setUTCHours(+raidConfig[i].autoLaunchTime/3600, '00', '0', '0')
        let raidLaunch = 0
        if(+currentCurrency >= raidInfo[raidConfig[i].raidId].open){
           raidLaunch = +launchTime.getTime()
           if(raidLaunch < +timeNow) raidLaunch += 86400000;
        }

        if(raidLaunch > 0){
          let exists = (await mongo.find('raidSchedule', {_id: raidConfig[i].raidId+'-'+guildId}))[0]
          if(exists){
            if(exists.state == 'join' && exists.time != raidLaunch){
              await mongo.set('raidSchedule', {_id: raidConfig[i].raidId+'-'+guildId}, {time: raidLaunch, sim: raidConfig[i].autoSimEnabled, state: 'join', joinPeriod: +raidConfig[i].joinPeriodDuration * 1000});
            }
          }else{
            await mongo.set('raidSchedule', {_id: raidConfig[i].raidId+'-'+guildId}, {guildId: guildId, raidId: raidConfig[i].raidId, time: raidLaunch, sim: raidConfig[i].autoSimEnabled, state: 'join', joinPeriod: +raidConfig[i].joinPeriodDuration * 1000});
          }
        }
      }
    }
    await addRaidInProgress(guildId, raidStatus, raidConfig, gObj.raids)
  }
}
