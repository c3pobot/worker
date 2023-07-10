'use strict'
const raidEnum = {
  rancor: 'Rancor',
  aat: 'Tank',
  sith_raid: 'Sith',
  rancor_challenge: 'Challenge Rancor',
  start: 'Battle',
  join: 'Joining',
  hold: 'Damage Release',
  sim: 'Sim'
}
const enumRaid = {
  rancor: 'rancor',
  tank: 'aat',
  sith: 'sith_raid',
  crancor: 'rancor_challenge'
}
const formatNumber = (num)=>{
  let obj = num
  if(num < 10) obj = '0'+num
  return obj
}
const TimeTillRaidStart = (raidStart)=>{
  let string = ''
  const timeDiff = (+raidStart - +(new Date()).getTime())/1000
  let minToStart = +Math.floor(timeDiff/60)
  let hoursToStart = +Math.floor(minToStart/60)
  if(+minToStart != (+hoursToStart * 60) && minToStart > hoursToStart) minToStart -= (+hoursToStart * 60)
  if(hoursToStart > 0) string += '**'+hoursToStart+'** Hours and '
  string += '**'+minToStart+'** Mins'
  return string
}
const Cmds = {}
Cmds.GetTicketMsg = (obj, gObj)=>{
  try{
    const embedMsg = {
      color: 15844367,
      timestamp: new Date(),
      title: gObj.profile.name + " Current Raid Tickets",
      description: "```autohotkey\n"
    }
    embedMsg.description += 'Rancor    : '+numeral(gObj.inventory.currencyItem.find(x => x.currency === 20).quantity).format("0,0")+'\n'
    embedMsg.description += 'Tank      : '+numeral(gObj.inventory.currencyItem.find(x => x.currency === 21).quantity).format("0,0")+'\n'
    embedMsg.description += 'Sith      : '+numeral(gObj.inventory.currencyItem.find(x => x.currency === 22).quantity).format("0,0")+'\n'
    embedMsg.description += 'Challenge : '+numeral(gObj.inventory.currencyItem.find(x => x.currency === 23).quantity).format("0,0")+'\n'
    embedMsg.description += "```"
    return embedMsg
  }catch(e){
    console.log(e)
  }
}
Cmds.GetRaidMsg = async(schedule, guildName)=>{
  try{
    const embedMsg = {
      color: 15844367,
      timestamp: new Date(),
      title: guildName+' current raids',
      description: ''
    }
    if(schedule.length > 0){
      schedule = await sorter([{column: 'time', order: 'ascending'}], schedule)
      for(let i in schedule){
        if(raidEnum[schedule[i].raidId]){
          let shiftedTime = +schedule[i].time - 18000000
          let launch = new Date(shiftedTime)
          let phase = raidEnum[schedule[i].state] ? raidEnum[schedule[i].state] : schedule[i].state
          let formatTime = (+launch.getMonth() + 1)+'/'+launch.getDate()+' in ~ '+TimeTillRaidStart(+schedule[i].time)+' at **'+formatNumber(launch.getHours())+':'+formatNumber(launch.getMinutes())+'** EST'
          embedMsg.description += formatTime+' ***'+raidEnum[schedule[i].raidId]+'*** Raid is scheduled for ***'+phase+'***\n'
        }
      }
    }else{
      embedMsg.description = 'No raids scheduled'
    }
    return embedMsg
  }catch(e){
    console.log(e)
  }
}
module.exports = Cmds
