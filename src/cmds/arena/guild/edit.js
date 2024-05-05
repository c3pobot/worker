'use strict'
const mongo = require('mongoclient')
const { checkBotPerms, getGuildName, replyComponent } = require('src/helpers')

module.exports = async(obj = {}, patreon = {}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }

  if(patreon.guilds?.length == 0) return { content: 'you do not have any guilds registered..'}

  let guildId = obj.confirm?.guildId
  let channel = opt.channel?.data
  if(channel){
    let channelPerm = checkBotPerms('SEND_MESSAGES', opt.channel?.botPerms)
    if(!channelPerm) return { content: `I do not have permissions to send messages to <#${channel.id}>...`}
  }

  if(!guildId && patreon?.guilds?.length == 1) guildId = patreon?.guilds[0]?.id

  if(!guildId){
    let x = 0, dataChange = false, msg2send = {
      content: 'Which guild do you want to change?',
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
    await replayComponent(obj, msg2send)
    return
  }

  let guildIndex = patreon.guilds.findIndex(x=>x.id == guildId)
  if(!patreon.guilds[guildIndex]) return { content: 'error updating guild info...'}

  if(channel){
    patreon.guilds[guildIndex].chId = channel.id
    patreon.guilds[guildIndex].sId = obj.guild_id
  }else{
    delete patreon.guilds[guildIndex].chId
    delete patreon.guilds[guildIndex].sId
  }
  await mongo.set('patreon', { _id: patreon._id }, { guilds: patreon.guilds })
  if(channel) return { content: `guild ${patreon.guilds[guildIndex].name} was updated to use <#${channel.id}> as a log channel` }
  return { content: `guild ${patreon.guilds[guildIndex].name} was updated to remove the log channel` }
}
