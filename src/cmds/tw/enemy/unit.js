'use strict'
const swgohClient = require('src/swgohClient')
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')
const numeral = require('numeral')
const { getOptValue, findUnit, getGuildId, truncateString } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You do not have allyCode linked to discord'}, gLevel = 0, rLevel = 0
  if(obj.confirm) await replyButton(obj)
  let pObj = await getGuildId({dId: obj.member.user.id}, {}, opt)
  if(!pObj?.guildId) return msg2send

  let guild = (await mongo.find('twStatus', {_id: pObj.guildId}))[0]
  if(!guild?.enemy) return { content: 'You do not have an opponent guild registered'}

  let unit = getOptValue(opt, 'unit')?.toString()?.trim()
  if(!unit) return { content: 'you did not provide a unit to look up'}

  let uInfo = await findUnit(obj, unit)
  if(uInfo === 'GETTING_CONFIRMATION') return
  if(!uInfo?.baseId) return { content: `Error finding unit **${unit}**`}

  let gObj = await swgohClient.post('fetchTWGuild', { id: guild?.enemy, projection: {playerId: 1, name: 1, rosterUnit: {definitionId: 1, relic: 1, currentTier: 1, gp: 1, currentRarity: 1}}})
  if(!gObj?.member || gObj?.member?.length === 0) return { content: 'Error getting opponent guild information...'}

  let gType = getOptValue(opt, 'option')
  let gValue = getOptValue(opt, 'value')
  if(gType && gValue){
    if(gType === 'g') gLevel = +gValue
    if(gType === 'r') rLevel = +gValue + 2
  }
  msg2send.content = 'No one in the guild has **'+uInfo.nameKey+'**'+(rLevel ? ' at **R'+(rLevel - 2)+'** or higher':'')+(gLevel ? ' at **G'+gLevel+'** or higher':'')
  let unitsUnsorted
  if(uInfo.combatType == 1){
    unitsUnsorted = gObj.member.filter(r=>r.rosterUnit.some(u=>u.definitionId.startsWith(uInfo.baseId+':') && u.currentTier >= gLevel && u.relic.currentTier >= rLevel)).map(m=>{
      return Object.assign({}, {
        member: m.name,
        rarity: m.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':') && x.currentTier >= gLevel && x.relic.currentTier >= rLevel).currentRarity,
        gp: m.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':') && x.currentTier >= gLevel && x.relic.currentTier >= rLevel).gp,
        gear: +m.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':') && x.currentTier >= gLevel && x.relic.currentTier >= rLevel).currentTier || 0,
        relic: +(m.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':') && x.currentTier >= gLevel && x.relic.currentTier >= rLevel).relic.currentTier - 2) || 0
      })
    })
  }else{
    unitsUnsorted = gObj.member.filter(r=>r.rosterUnit.some(u=>u.definitionId.startsWith(uInfo.baseId+':'))).map(m=>{
      return Object.assign({}, {
        member: m.name,
        rarity: m.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':')).currentRarity,
        gp: m.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':')).gp
      })
    })
  }
  if(unitsUnsorted && unitsUnsorted.length > 0){
    let unitsSorted = sorter([{column: 'gp', order: 'descending'}], unitsUnsorted)
    let unitsObj = {}
    for(let i in unitsSorted){
      if(!unitsObj[unitsSorted[i].rarity]){
        unitsObj[unitsSorted[i].rarity] = {
          rarity: unitsSorted[i].rarity,
          players: []
        }
      }
      if(unitsObj[unitsSorted[i].rarity] && unitsObj[unitsSorted[i].rarity].players) unitsObj[unitsSorted[i].rarity].players.push(unitsSorted[i])
    }
    let arrayUnsorted = Object.values(unitsObj)
    let arraySorted = sorter([{column: 'rarity', order: 'descending'}], arrayUnsorted)
    msg2send.content = null
    msg2send.embeds = []
    let embedMsg = {
      color: 15844367,
      title: gObj.name+' ('+gObj.member.length+')',
      timestamp: new Date(gObj.updated),
      description: uInfo.nameKey+' ('+unitsSorted.length+')'+(+rLevel > 0 && uInfo.combatType == 1 ? ' - Relic >= '+(+rLevel - 2):'')+(+gLevel > 0 && uInfo.combatType == 1 ? ' - Gear >= '+gLevel:''),
      author: {
        icon_url: "https://swgoh.gg/static/img/assets/"+uInfo.thumbnailName+".png"
      },
      thumbnail:{
        url: "https://swgoh.gg/static/img/assets/"+uInfo.thumbnailName+".png"
      },
      footer:{
        text: 'Data Updated'
      }
    }
    embedMsg.fields = []
    for(let i in arraySorted){
      let count = 0, unitCount = 0
      let tempObj = {
        name: arraySorted[i].rarity+"★ : ",
        value: "```autohotkey\n GP   : "+(uInfo.combatType === 1 ? 'G/R : ':'')+"Player\n"
      }
      for(let p in arraySorted[i].players){
        let gearText = ''
        if(uInfo.combatType === 1) gearText = (arraySorted[i].players[p].relic > 0 ? 'R'+arraySorted[i].players[p].relic.toString().padStart(2, '0'):'G'+arraySorted[i].players[p].gear.toString().padStart(2, '0'))
        tempObj.value += numeral(arraySorted[i].players[p].gp/1000).format("0.0").padStart(4, ' ')+"K : "+(uInfo.combatType === 1 ? gearText+' : ':'')+(truncateString(arraySorted[i].players[p].member, 13))+"\n"
        count++
        unitCount++
        if((+p + 1) == arraySorted[i].players.length && count < 25) count = 25
        if(count == 25){
          tempObj.value += '```'
          tempObj.name += '('+unitCount+')'
          embedMsg.fields.push(tempObj)
          if(msg2send.embeds.length < 11) msg2send.embeds.push(JSON.parse(JSON.stringify(embedMsg)))
          embedMsg.fields = []
          tempObj.name = arraySorted[i].rarity+"★ : "
          tempObj.value = "```autohotkey\n GP   : "+(uInfo.combatType === 1 ? 'G/R : ':'')+"Player\n"
          count = 0,
          unitCount = 0
        }
      }
    }
  }
  return msg2send
}
