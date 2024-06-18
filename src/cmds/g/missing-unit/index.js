'use strict'
const sorter = require('json-array-sorter')
const numeral = require('numeral')
const { getPlayerAC, getGuildId, findUnit, fetchGuild, truncateString, getRelicLevel } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let allyObj = await getPlayerAC(obj, opt)
  if(allyObj?.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
  let allyCode = allyObj?.allyCode
  if(!allyCode) return { content: 'You do not have allyCode linked to discord' }

  let unit = opt.unit?.value?.toString()?.trim()
  if(!unit) return { content: 'You did not provide a unit'}

  let uInfo = await findUnit(obj, unit)
  if(uInfo === 'GETTING_CONFIRMATION') return
  if(uInfo?.msg2send) return uInfo.msg2send
  if(!uInfo?.baseId) return { content: `Error finding unit **${unit}**` }

  let pObj = await getGuildId({}, { allyCode: allyCode })
  if(!pObj?.guildId) return { content: 'error finding guildId...' }

  let gObj = await fetchGuild({ guildId: pObj.guildId, projection: { playerId: 1, name: 1, roster: { [uInfo.baseId]: 1 } } })
  if(!gObj?.member || gObj?.member?.length == 0) return { content: `error finding guild...` }

  let members = gObj.member.filter(x=> !x.roster[uInfo.baseId])
  if(!members || members?.length === 0) return { content: `all guild members have ${uInfo.nameKey}` }

  let embedMsg = {
    color: 15844367,
    description: `[${gObj.name}](https://swgoh.gg/g/${gObj.id}) members missing ${uInfo.nameKey} (${members.length}/${gObj.member.length})\n`,
    timestamp: new Date(gObj.updated),
    author: {
      icon_url: "https://swgoh.gg/static/img/assets/"+uInfo.thumbnailName+".png"
    },
    thumbnail:{
      url: "https://swgoh.gg/static/img/assets/"+uInfo.thumbnailName+".png"
    },
    footer:{
      text: 'Data Updated'
    }
  }
  embedMsg.description += '```\n'
  for(let i in members) embedMsg.description += `${members[i].name}\n`
  embedMsg.description += '```'
  return { content: null, embeds: [embedMsg], components: [] }
}
