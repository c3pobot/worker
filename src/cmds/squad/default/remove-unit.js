'use strict'
const mongo = require('mongoclient')
const { replyComponent, getDiscordAC } = require('src/helpers')
const showUnits = require('./show-units')

module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }

  let allyObj = await getDiscordAC(obj.member?.user?.id, opt)
  if(!allyObj?.allyCode) return { content: 'You do not have allycode linked to discordId' }

  let allyCode = allyObj.allyCode

  let pObj = (await mongo.find('defaultUnits', { _id: allyCode.toString() }, { _id: 0, TTL: 0 }))[0]
  if(!pObj?.units || pObj?.units?.length === 0)  return { content: `allyCode ${allyCode} has not default units set` }

  let baseId = obj.confirm?.baseId
  if(!baseId){
    let x = 0, msg2send = {
      content: 'Which unit do you want to remove?',
      components: [],
      flags: 64
    }
    for(let i in pObj.units){
      if(!msg2send.components[x]) msg2send.components[x] = { type:1, components: [] }
      msg2send.components[x].components.push({
        type: 2,
        label: pObj.units[i].nameKey,
        style: 1,
        custom_id: JSON.stringify({ id: obj.id, dId: obj.members?.user?.id, baseId: pObj.units[i].baseId })
      })
      if(msg2send.components[x].components.length == 5) x++;
    }
    if(!msg2send.components[x]) msg2send.components[x] = { type:1, components: []}
    msg2send.components[x].components.push({
      type: 2,
      label: 'Cancel',
      style: 1,
      custom_id: JSON.stringify({ id: obj.id, dId: obj.members?.user?.id, tbDay: 'none' })
    })
    await replyComponent(obj, msg2send)
    return
  }
  if(!baseId) return { content: 'error with the command' }
  let unit = pObj.units.find(x=>x.baseId === baseId)
  if(!unit) return { content: 'that unit is not part of your default untis' }

  pObj.units = pObj.units?.filter(x=>x.baseId !== baseId) || []
  await mongo.set('defaultUnits', { _id: allyCode.toString() }, pObj)
  return await showUnits(obj, opt)
}
