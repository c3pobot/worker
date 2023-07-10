'use strict'
const MapUnit = async(obj)=>{
  try{
    const nameKey = await HP.GetUnitName(obj.definitionId.split(':')[0])
    return Object.assign({}, {
      baseId: obj.definitionId.split(':')[0],
      nameKey: (nameKey ? nameKey:obj.definitionId.split(':')[0]),
      gear: obj.currentTier || 0,
      relic: obj.relic.currentTier || 0,
      gp: obj.gp || 0
    })
  }catch(e){
    console.log(e)
  }
}
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'You do not have allycode linked to discordId'}, gLevel = 13, rLevel = 0, allyCode, pObj, sort = 'nameKey', order = 'ascending'
    if(opt.find(x=>x.name == 'option') && opt.find(x=>x.name == 'value')){
      if(opt.find(x=>x.name == 'option').value == 'g') gLevel = +opt.find(x=>x.name == 'value').value
      if(opt.find(x=>x.name == 'option').value == 'r') rLevel = +opt.find(x=>x.name == 'value').value + 2
    }
    if(opt.find(x=>x.name == 'sort')) sort = opt.find(x=>x.name == 'sort').value
    if(sort == 'gp') order = 'descending'
    const allyObj = await HP.GetPlayerAC(obj, opt)
    if(allyObj && allyObj.allyCode) allyCode = allyObj.allyCode
    if(allyObj && allyObj.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
    if(allyCode){
      msg2send.content = 'Error getting player information'
      pObj = await HP.FetchPlayer({token: obj.token, allyCode: allyCode.toString()})
    }
    if(pObj && pObj.rosterUnit && pObj.rosterUnit.length > 0){
      msg2send.content = 'Player has no units that meet the requested criteria'
      let units = await Promise.all(pObj.rosterUnit.filter(x=>x.relic && x.relic.currentTier >= rLevel && x.currentTier >= gLevel).map(async(u)=>{
        return await MapUnit(u)
        /*
        return Object.assign({}, {
          baseId: u.definitionId.split(':')[0],
          gear: u.currentTier || 0,
          relic: u.relic.currentTier || 0,
          gp: u.gp || 0
        })
        */
      }))
      if(units.length > 0){
        units = await sorter([{column: sort, order: order}], units)
        msg2send.content = null,
        msg2send.embeds = []
        const embedMsg = {
          color: 15844367,
          timestamp: new Date(pObj.updated),
          title: pObj.name+' ('+units.length+')',
          description: 'Units '+(rLevel ? ' Relic >='+(rLevel - 2):'')+(!rLevel && gLevel ? 'Gear >='+gLevel:'')+' (<UNITCOUNT>)\n```\nG/R : Unit\n'
        }
        let count = 0, unitCount = 0
        for(let i in units){
          if(units[i].baseId){
            const nameKey = await HP.GetUnitName(units[i].baseId)
            const gearText = (rLevel ? 'R'+(units[i].relic - 2).toString().padStart(2, '0'):'G'+units[i].gear.toString().padStart(2, '0'))
            embedMsg.description += gearText+' : '+(nameKey ? HP.TruncateString(nameKey, 25):units[i].baseId)+'\n'
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
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
