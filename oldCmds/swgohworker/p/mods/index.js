'use strict'
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
module.exports = async(obj, opt = [])=>{
  try{
    let allyCode, pObj, msg2send = {content: 'You do not have allycode linked to discordId'}, statInfo = {}, units
    const allyObj = await HP.GetPlayerAC(obj, opt)
    let statId = HP.GetOptValue(opt, 'stat')
    let numStats = HP.GetOptValue(opt, 'limit') || 20
    if(opt.find(x=>x.name == 'stat')) statId = opt.find(x=>x.name == 'stat').value
    if(opt.find(x=>x.name == 'limit')) numStats = opt.find(x=>x.name == 'limit').value
    if(allyObj && allyObj.allyCode) allyCode = allyObj.allyCode
    if(allyObj && allyObj.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
    if(allyCode && !allyObj.mentionError){
      msg2send.content = '**'+statId+'** is not a valid stat to look up'
      if(modStatObj[statId]) statInfo = modStatObj[statId]
    }
    if(statInfo.name){
      msg2send.content = '**'+allyCode+'** is an invalid allyCode'
      pObj = await HP.FetchPlayer({allyCode: allyCode.toString()})
    }
    if(pObj && pObj.rosterUnit && pObj.rosterUnit.length > 0){
      msg2send.content = 'Error calculating stats'
      units = await FT.FormatPlayerStats(pObj.rosterUnit.filter(x=>x.combatType == 1), statInfo, 'mod')
    }
    if(units.length > 0){
      msg2send.content = null
      msg2send.embeds = []
      if (units.length < numStats) {
        numStats = +units.length
      }
      const embedMsg = {
        color: 15844367,
        title: pObj.name + ' ' + statInfo.name + ' Mods - Top '+numStats+' Units',
        description: 'sorted by ModStat (<UNITCOUNT>/'+numStats+')\n```autohotkey\n',
        timestamp: new Date(pObj.updated),
        footer: {
          text: 'Data updated:'
        }
      }
      let count = 0, unitCount = 0
      for(let i = 0;i<numStats;i++){
        embedMsg.description += units[i].value+'\n'
        count++, unitCount++
        if((+i + 1) == numStats && count != 20) count = 20
        if(count == 20){
          embedMsg.description += '```'
          embedMsg.description = embedMsg.description.replace('<UNITCOUNT>', unitCount)
          if(msg2send.embeds.length < 10) msg2send.embeds.push(JSON.parse(JSON.stringify(embedMsg)))
          embedMsg.description = 'sorted by ModStat (<UNITCOUNT>/'+numStats+')\n```autohotkey\n'
          count = 0
          unitCount = 0
        }
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
  }
}
