'use strict'
const log = require('logger')
const { getGuildName } = require('src/helpers')

module.exports = async(obj = {}, patreon = {}, opt = {})=>{
  if(!patreon.guilds || patreon.guilds?.length == 0) return { content: `you don't have any guilds set...` }

  let dataChange = false, embedMsg = {
    color: 15844367,
    title: 'Arena Synced Guilds ('+patreon.guilds.length+')',
    description: '```\n'
  }
  for(let i in patreon.guilds){
    if(!patreon.guilds[i].name){
      patreon.guilds[i].name = await getGuildName(patreon.guilds[i].id)
      if(patreon.guilds[i].name) dataChange = true
    }
    embedMsg.description += `${patreon.guilds[i].name} : ${patreon.guilds[i].chId ? `<#${patreon.guilds[i].chId}>`:``}\n`
  }
  embedMsg.description += '```'
  if(dataChange) await mongo.set('patreon', { _id: patreon._id }, { guild: patreon.guilds })
  return { content: null, embeds: [embedMsg] }
}
