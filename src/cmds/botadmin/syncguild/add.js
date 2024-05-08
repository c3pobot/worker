'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }

  let allyCode = obj.confirm?.allyCode || opt.allycode?.value?.toString()?.trim()?.replace(/-/g, ''), usr = opt.user?.data
  if(!allyCode && !usr) return { content: 'you must provide an allyCode or user...' }

  if(!allyCode && usr){
    let dObj = (await mongo.find('discordId', { _id: usr.id }))[0]
    if(!dObj?.allyCodes) return { content: 'that user does not have allyCode linked to discordId...' }
    if(dObj.allyCodes.length == 1) allyCode = dObj.allyCodes[0].allyCode
    if(dObj.allyCodes?.length > 1){
      let usrname = usr.nick || usr.user?.username, x = 0, msg2send = {
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

  let pObj = await swgohClient.post('queryPlayer', { allyCode: allyCode?.toString() })
  if(!pObj.allyCode) return { content: `**${allyCode}** is not valid...` }
  if(!pObj.guildId) return { content: `**${pObj.name} is not in a guild...`}

  let exists = (await mongo.find('guilds', { _id: pObj.guildId }, { sync: 1}))[0]
  if(exists?.sync > 0) return { content: `${pObj.guildName} is already a synced guild...` }

  await mongo.set('guilds', { _id: pObj.guildId }, { sync: 1, guildName: pObj.guildName })
  return { content: `${pObj.guildName} was added as a synced guild...`}
}
