'use strict'
const mongo = require('mongoclient')
const { getGuildName, replyComponent } = require('src/helpers')

module.exports = async(obj = {}, patreon = {}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }

  if(patreon.guilds?.length == 0) return { content: 'you do not have any guilds registered..' }
  let guildId = obj.confirm?.guildId, guildName = obj.confirm?.guildName

  if(!guildId && patreon?.guilds?.length == 1){
    guildId = patreon.guilds[0]?.id
    guildName = patreon.guilds[0]?.name
    if(!guildName) guildName = await getGuildName(guildId)
  }

  if(!guildId){
    let x = 0, dataChange = false, msg2send = {
      content: 'Which guild do you want to remove?',
      components: [],
      flags: 64
    }
    for(let i in patreon.guilds){
      if(!patreon.guilds[i].name){
        patreon.guilds[i].name = await getGuildName(patreon.guilds[i].id)
        if(patreon.guilds[i].name) dataChange = true
      }
      if(!msg2send.components[x]) msg2send.components[x] = { type:1, components: [] }
      msg2send.components[x].components.push({
        type: 2,
        label: patreon.guilds[i].name,
        style: 1,
        custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, guildId: patreon.guilds[i].id })
      })
      if(msg2send.components[x].components.length == 5) x++;
    }
    msg2send.components[x].components.push({
      type: 2,
      label: 'Cancel',
      style: 4,
      custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, cancel: true })
    })
    if(dataChange) await mongo.set('patreon', { _id: patreon._id }, { guild: patreon.guilds })
    await replyComponent(obj, msg2send)
    return
  }

  let guild = patreon.guilds.find(x=>x.id === guildId)
  if(!guild){
    let guildName = await getGuildName(guildId)
    return { content: `${guildName || 'that guild'} is not in your list` }
  }
  if(!guild.name) guild.name = await getGuildName(guildId)
  await mongo.set('patreon', { _id: patreon?._id}, { guilds: patreon.guilds.filter(x=>x.id !== guildId) })
  return { content: `${guild.name || 'that guild'} was removed from your list...` }
}
