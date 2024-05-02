'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = {}, patreon = {}, opt = [])=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }
  if(!patreon.users || patreon?.users?.length == 0) return { content: 'there are no users in your list...' }

  let usr = opt.user.data, allyCode = obj.confirm?.allyCode || opt.allycode?.value?.toString()?.trim()?.replace(/-/g, '-')
  if(!allyCode && usr){
    let dObj = (await mongo.find('discordId', { _id: usr.id }))[0]
    if(dObj?.allyCodes?.length === 0) return { content: 'That user does not have allyCode linked to discordId' }
    if(dObj?.allyCodes?.length === 1) allyCode = dObj.allyCodes[0].allyCode
    if(dObj?.allyCodes?.length > 1){
      let usrname = usr.nick || usr?.user?.username
      let x = 0, msg2send = {
        content: 'There are multiple allyCodes for **@'+usrname+'**. Which one do you want to remove?',
        components: [],
        flags: 64
      }
      for(let i in dObj.allyCodes){
        if(!msg2send.components[x]) msg2send.components[x] = { type:1, components: []}
        msg2send.components[x].components.push({
          type: 2,
          label: dObj.allyCodes[i].name+' ('+dObj.allyCodes[i].allyCode+')',
          style: 1,
          custom_id: JSON.stringify({allyCode: dObj.allyCodes[i].allyCode})
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
  if(patreon.users?.filter(x=>+x.allyCode == allyCode).length == 0) return { content: `${allyCode} is not in your list...`}

  await mongo.set('patreon', { _id: patreon._id }, { users: patreon.users.filter(x=>+x.allyCode !== allyCode) })
  return { content: `player with ${allyCode} has been removed from your list...` }
}
