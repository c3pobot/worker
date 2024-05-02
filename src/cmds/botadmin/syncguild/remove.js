'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }

  let guildId = obj.confirm?.guildId
  let guilds = await mongo.find('guilds', {}, { _id: 1, guildName: 1, sync: 1 })
  guilds = guilds?.filter(x=>x?.sync > 0) || []
  if(!guilds || guilds?.length == 0) return { content: 'There are no synced guilds...' }

  if(!guildId){
    let x = 0, msg2send = { content: 'Which guild do you want to remove sync status from ?\n', components: [] }
    for(let i in guilds){
      if(!msg2send.components[x]) msg2send.components[x] = { type:1, components: [] }
      msg2send.content += `<https://swgoh.gg/g/${guilds[i]._id}/>\n`
      msg2send.components[x].components.push({
        type: 2,
        label: guilds[i].guildName || guilds[i]._id,
        style: 1,
        custom_id: JSON.stringify({ dId: obj.member?.user?.id, guildId: guilds[i]._id, guildName: guilds[i].guildName || guilds[i]._id })
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

  await mongo.set('guilds', { _id: guildId }, { sync: 0 })
  return { content: `${obj.confirm?.guildName} guild sync was disabled...` }
}
