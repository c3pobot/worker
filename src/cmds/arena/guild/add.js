'use strict'
const mongo = require('mongoclient')
const { checkBotPerms, getCmdOptions, replyComponent, getGuildId } = require('src/helpers')

module.exports = async(obj = {}, patreon = {}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }

  let usr = opt.user?.data, channel = opt.channel?.data, allyCode = +obj.confirm?.allyCode || opt.allycode?.value?.toString()?.trim()?.replace(/-/g, '-'), count = 0
  if(!allyCode && !usr) return { content: 'You did not provide the correct information' }

  if(patreon.users) count += +patreon.users.length
  if(patreon.guilds) count += +patreon.guilds.length * 50
  if(count + 50 > patreon.maxAllyCodes) return { content: 'You are only allowed to register **'+patreon.maxAllyCodes+'** and you already have **'+count+'**.\nNote a guild counts as 50'}

  if(!allyCode && usr){
    let dObj = (await mongo.find('discordId', { _id: usr.id }))[0]
    if(dObj?.allyCodes?.length === 0) return { content: 'That user does not have allyCode linked to discordId' }
    if(dObj?.allyCodes?.length === 1) allyCode = dObj.allyCodes[0].allyCode
    if(dObj?.allyCodes?.length > 1){
      let usrname = usr.nick || usr.username
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
          custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, allyCode: dObj.allyCodes[i].allyCode })
        })
        if(msg2send.components[x].components.length == 5) x++;
      }
      msg2send.components[x].components.push({
        type: 2,
        label: 'Cancel',
        style: 4,
        custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, cancel: true })
      })
      await replyComponent(obj, msg2send)
      return
    }
  }

  if(channel){
    let channelPerm = checkBotPerms('SEND_MESSAGES', opt.channel?.botPerms)
    if(!channelPerm) return { content: `I do not have permissions to send messages to <#${channel.id}>...`}
  }

  let pObj = await getGuildId({}, { allyCode: +allyCode }, {})
  if(!pObj?.guildId) return { content: `Error getting guild for ${allyCode}` }

  let guild = patreon.guilds.find(x=>x.id == pObj.guildId)
  if(guild) return { content: `${pObj.guildName} is already in your list of guilds...`}

  if(!patreon.guilds) patreon.guilds = []
  let tempGuild = { id: pObj.guildId, name: pObj.guildName }
  if(channel){
    tempGuild.chId = channel.id
    tempGuild.sId = obj.guild_id
  }
  patreon.guilds.push(tempGuild)
  await mongo.set('patreon', { _id: patreon._id }, { guilds: patreon.guilds })
  return { content: `guild **${guild.name} was addd to your list...` }
}
