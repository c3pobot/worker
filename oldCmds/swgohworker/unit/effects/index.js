'use strict'
const enumSkill = (id)=>{
  if(id.startsWith('basic')) return 'B'
  if(id.startsWith('lead')) return 'L'
  if(id.startsWith('special')) return 'S'
  if(id.startsWith('unique')) return 'U'
  if(id.startsWith('hardware')) return 'R'
}
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'error getting data'}, effects, units
    let effect = HP.GetOptValue(opt, 'effect')
    let show = HP.GetOptValue(opt, 'show')
    if(!show) show = 'chars'
    if(show) show = show.trim()
    if(effect) effect = effect.trim()
    if(effect){
      msg2send.content = 'Error finding effect **'+effect+'**'
      effects = (await mongo.find('effects', {_id: effect}))[0]
      if(!effects) effects = (await mongo.find('effects', {nameKey: effect}))[0]
    }
    if(effects){
      msg2send.content = 'There are no units for **'+effects.nameKey+'**'
      if(effects.units?.length > 0) units = effects.units
      units = units.filter(x=>x.skill?.descKey.toLowerCase().includes(effects.nameKey.toLowerCase()))
      if(units) units = await sorter([{column: 'nameKey', order: 'ascending'}], units)
    }
    if(units?.length > 0){
      let ships = units.filter(x=>x.combatType === 2)
      let chars = units.filter(x=>x.combatType === 1)
      msg2send.embeds = []
      const embedMsg = {
        color: 15844367,
        timestamp: new Date()
      }
      if(show !== 'ships' && chars?.length > 0){
        embedMsg.title = 'Characters : '+effects.nameKey+' ('+chars.length+')'
        embedMsg.description = effects.descKey+'\n```'
        for(let i in chars) embedMsg.description += chars[i].nameKey+' : '+enumSkill(chars[i]?.skill?.id)+' : '+chars[i].skill?.nameKey+'\n'
        embedMsg.description += '```'
        msg2send.embeds.push(JSON.parse(JSON.stringify(embedMsg)))
      }
      if(show !== 'chars' && ships?.length > 0){
        embedMsg.title = 'Ships : '+effects.nameKey+' ('+ships.length+')'
        embedMsg.description = effects.descKey+'\n```'
        for(let i in ships) embedMsg.description += ships[i].nameKey+' : '+enumSkill(ships[i]?.skill?.id)+' : '+ships[i].skill?.nameKey+'\n'
        embedMsg.description += '```'
        msg2send.embeds.push(JSON.parse(JSON.stringify(embedMsg)))
      }
      if(msg2send.embeds.length > 0) msg2send.content = null

    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
