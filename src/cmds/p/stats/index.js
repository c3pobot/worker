'use strict'
const { getPlayerAC, fetchPlayer } = require('src/helpers')
const { formatPlayerStats } = require('src/format')

const modStatObj = {
  'speed': { statId: 5, name: "Speed", ln: 9 },
  's': { statId: 5, name: "Speed", ln: 9 },
  "potency": { statId: 17, name: "Potency", pct: true, ln: 15 },
  "tenacity": { statId: 18, name: "Tenacity", pct: true, ln: 15 },
  'offense': { statId: 6, name: 'Offense', ln: 13, pri: { id: 6, name: 'P' }, sec: { id: 7, name: 'S' } },
  'o': { statId: 6, name: 'Offense', ln: 13, pri: { id: 6, name: 'P' }, sec: { id: 7, name: 'S' } },
  'health': { statId: 1, name: "Health", ln: 16 },
  "h": { statId: 1, name: "Health", ln: 16 },
  "protection": { statId: 28, name: "Protection", ln: 16 },
  'p': { statId: 28, name: "Protection", ln: 16 },
  'defense': { statId: 0, name: 'Defense', ln: 12, pri: { id: 8, name: 'A' }, sec: { id: 9, name: 'R' } },
  'd': { statId: 0, name: 'Defense', ln: 12, pri: { id: 8, name: 'A' }, sec: { id: 9, name: 'R' } }
}

module.exports = async(obj = {}, opt = {})=>{
  let allyObj = await getPlayerAC(obj, opt)
  if(allyObj?.mentionError) return { content: 'that user does not have allyCode linked to discordId' }
  let allyCode = allyObj?.allyCode
  if(!allyCode) return { content: 'You do not have allycode linked to discordId' }

  let statId = opt.stat?.value, numStats = +(opt.limit?.value || 20), sort = opt.sort?.value || 'stat', statInfo
  if(modStatObj[statId]) statInfo = JSON.parse(JSON.stringify(modStatObj[statId]))
  if(!statInfo?.name) return { content: '**'+statId+'** is not a valid stat to look up' }

  let pObj = await fetchPlayer({ allyCode: allyCode.toString() })
  if(!pObj?.rosterUnit) return { content: '**'+allyCode+'** is an invalid allyCode' }

  let units = await formatPlayerStats(pObj.rosterUnit.filter(x=>x.combatType == 1), statInfo, sort)
  if(!units || units?.length == 0) return { content: 'error calculating stats' }

  let msg2send = { content: null, embeds: [] }
  if (units.length < numStats) {
    numStats = units.length
  }
  let embedMsg = {
    color: 15844367,
    title: pObj.name + ' ' + statInfo.name + ' Stats - Top '+numStats+' Units',
    description: 'sorted by '+(sort === 'stat' ? 'Stat':'ModStat')+' (<UNITCOUNT>/'+numStats+')\n```autohotkey\n',
    timestamp: new Date(pObj.updated),
    footer: {
      text: 'Data updated:'
    }
  }
  let count = 0, unitCount = 0
  for(let i = 0;i<numStats;i++){
    embedMsg.description += units[i].value+'\n'
    count++, unitCount++;
    if((+i + 1) == numStats && count != 20) count = 20
    if(count === 20){
      embedMsg.description += '```'
      embedMsg.description = embedMsg.description.replace('<UNITCOUNT>', unitCount)
      if(msg2send.embeds.length < 10) msg2send.embeds.push(JSON.parse(JSON.stringify(embedMsg)))
      embedMsg.description = 'sorted by Stat (<UNITCOUNT>/'+numStats+')\n```autohotkey\n'
      count = 0
      unitCount = 0
    }
  }
  return msg2send
}
