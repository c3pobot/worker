'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const playerCache = require('src/helpers/cache/player')
const getPlayer = async(allyCode)=>{
  try{
    if(!allyCode) return
    let pObj = await playerCache.get('playerCache', null, +allyCode, { _id: 1, allyCode: 1, name: 1, playerId: 1})
    if(!pObj) pObj = await swgohClient.post('playerArena', { allyCode: allyCode.toString() }, null)
    if(pObj?.allyCode) pObj.allyCode = +pObj.allyCode
    return pObj
  }catch(e){
    log.error(e)
  }
}
module.exports = async(obj = {}, patreon = {}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }

  let usr = opt.user.data, allyCode = obj.confirm?.allyCode || opt.allycode?.value?.toString()?.trim()?.replace(/-/g, '-'), count = 0
  if(!usr && !allyCode) return { content: 'You did not provide the correct information' }

  if(patreon.users) count += +patreon.users.length
  if(patreon.guilds) count += +patreon.guilds.length * 50
  if(count >= patreon.maxAllyCodes) return { content: 'You are only allowed to register **'+patreon.maxAllyCodes+'** and you already have **'+count+'**.\nNote a guild counts as 50' }

  if(usr && !allyCode){
    let dObj = (await mongo.find('discordId', { _id: usr.id }))[0]
    if(dObj?.allyCodes?.length === 0) return { content: 'That user does not have allyCode linked to discordId' }
    if(dObj?.allyCodes?.length === 1) allyCode = dObj.allyCodes[0].allyCode
    if(dObj?.allyCodes?.length > 1){
      let usrname = usr.nick || usr?.user?.username
      let x = 0, msg2send = {
        content: 'There are multiple allyCodes for **@'+usrname+'**. Which one do you want to add?',
        components: [],
        flags: 64
      }
      for(let i in dObj.allyCodes){
        if(!msg2send.components[x]) msg2send.components[x] = { type:1, components: []}
        msg2send.components[x].components.push({
          type: 2,
          label: dObj.allyCodes[i].name+' ('+dObj.allyCodes[i].allyCode+')',
          style: 1,
          custom_id: JSON.stringify({ dId: obj.member?.user?.id, allyCode: dObj.allyCodes[i].allyCode })
        })
        if(msg2send.components[x].components.length == 5) x++;
      }
      msg2send.components[x].components.push({
        type: 2,
        label: 'Cancel',
        style: 4,
        custom_id: JSON.stringify({ dId: obj.member?.user?.id, cancel: true })
      })
      return msg2send
    }
  }

  allyCode = +allyCode
  if(patreon?.users?.filter(x=+x.allyCode == +allyCode).length > 0) return { content: `${allyCode} is already in your list...`}

  let pObj = await getPlayer(allyCode)
  if(!pObj?.allyCode) return { content: `${allyCode} is not valid...`}

  if(!patreon.users) patreon.users = []
  patreon.users.push({ allyCode: +allyCode, name: pObj.name })
  await mongo.set('patreon', { _id: patreon._id }, { users: patreon.users })
  return { content: `${pObj.name} with allyCode ${allyCode} was added to your list` }
}
