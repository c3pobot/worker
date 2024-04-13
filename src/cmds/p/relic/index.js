'use strict'
const sorter = require('json-array-sorter')
const { getUnitName, getOptValue, getPlayerAC, fetchPlayer, truncateString } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You do not have allycode linked to discordId'}, gLevel = 13, rLevel = 0, pObj, order = 'ascending', units
  let gOption = getOptValue(opt, 'option')
  let gValue = getOptValue(opt, 'value')
  if(gOption && gValue >= 0){
    if(gOption === 'g') gLevel = +gValue
    if(gOption === 'r') rLevel = +gValue + 2
  }
  let sort = getOptValue(opt, 'sort', 'nameKey')
  if(sort == 'gp') order = 'descending'
  let allyObj = await getPlayerAC(obj, opt)
  if(allyObj?.mentionError) return { content: 'that user does not have allyCode linked to discordId' }
  let allyCode = allyObj?.allyCode
  if(!allyCode) return msg2send
  if(allyCode){
    msg2send.content = 'Error getting player information'
    pObj = await fetchPlayer({token: obj.token, allyCode: allyCode.toString()})
  }
  if(pObj?.rosterUnit?.length > 0){
    msg2send.content = 'Player has no units that meet the requested criteria'
    units = pObj?.rosterUnit?.filter(x=>x.relic?.currentTier >= rLevel && x.currentTier >= gLevel)?.map((u)=>{
      let baseId = u?.definitionId?.split(':')[0]
      let nameKey = getUnitName(baseId)
      return Object.assign({}, {
        baseId: u?.definitionId?.split(':')[0],
        nameKey: (nameKey || baseId),
        gear: u.currentTier || 0,
        relic: u.relic?.currentTier || 0,
        gp: u.gp || 0
      })
    })
  }
  if(units?.length > 0){
    units = sorter([{column: sort, order: order}], units)
    msg2send.content = null,
    msg2send.embeds = []
    let embedMsg = {
      color: 15844367,
      timestamp: new Date(pObj.updated),
      title: pObj.name+' ('+units.length+')',
      description: 'Units '+(rLevel ? ' Relic >='+(rLevel - 2):'')+(!rLevel && gLevel ? 'Gear >='+gLevel:'')+' (<UNITCOUNT>)\n```\nG/R : Unit\n'
    }
    let count = 0, unitCount = 0
    for(let i in units){
      if(units[i].baseId){
        let nameKey = units[i].nameKey
        let gearText = (rLevel ? 'R'+(units[i].relic - 2).toString().padStart(2, '0'):'G'+units[i].gear.toString().padStart(2, '0'))
        embedMsg.description += gearText+' : '+(nameKey ? truncateString(nameKey, 25):units[i].baseId)+'\n'
        count++;
        unitCount++
      }
      if(((+i + 1) == units.length) && count < 25) count = 25
      if(count == 25){
        embedMsg.description += '```'
        embedMsg.description = embedMsg.description.replace('<UNITCOUNT>', unitCount)
        if(msg2send.embeds.length < 10){
          msg2send.embeds.push(JSON.parse(JSON.stringify(embedMsg)))
        }else{
          msg2send.content = 'There are more than 250 units that meet the criteria. I can only show 250'
        }
        embedMsg.description = 'Units '+(rLevel ? ' Relic >='+(rLevel - 2):'')+(!rLevel && gLevel ? 'Gear >='+gLevel:'')+' (<UNITCOUNT>)\n```\nG/R : Unit\n'
        count = 0
        unitCount = 0
      }
    }
  }
  return msg2send
}
