'use strict'
const { getPlayerAC, getFaction, getGuildId, replyError, fetchGuild } = require('src/helpers')
const json2xls = require('json2xls');

module.exports = async( obj = {} )=>{
  try{

    let dObj = await getPlayerAC(obj, obj.data?.options)
    let allyCode = dObj?.allyCode
    if(dObj?.mentionError) return { content: 'that user does not have allyCode linked to discordId' }
    if(!allyCode) return { content: 'Your discord id is not linked to allyCode'}

    let pObj = await getGuildId({}, { allyCode: +allyCode })
    if(!pObj?.guildId) return { content: 'error findig guildId' }

    let gObj = await fetchGuild({ guildId: pObj.guildId })
    if(!gObj?.member || gObj?.member?.length == 0) return { content: 'Error getting guild info' }

    let members = []
    let glFaction = await getFaction('galactic_legend', false)
    if(glFaction?.units) glFaction = glFaction.units
    members = gObj.member.map(x=>{
      return {
        'Name': x.name,
        'allyCode': x.allyCode,
        'swgohgg': 'https://swgoh.gg/p/'+x.allyCode+'/',
        'GP': x.gp,
        'Char GP': x.gpChar,
        'Ship GP': x.gpShip,
        'Num Zetas': x.zetaCount,
        'Num 6 pip Mods': x.sixModCount,
        'Num Omi': x.omniCount,
        'Num GL': x.rosterUnit?.filter(u=>glFaction.includes(u.definitionId.split(':')[0])).length || 0
      }
    }) || []
    let guildData = await json2xls(members, {
      'Name': 'string',
      'allyCode': 'string',
      'swgohgg': 'string',
      'GP': 'number',
      'Char GP': 'number',
      'Ship GP': 'number',
      'Num Zetas': 'number',
      'Num 6 pip Mods': 'number',
      'Num Omi': 'number',
      'Num GL': 'number',
      'Has Exec': 'string'
    })
    if(guildData) guildData = Buffer.from(guildData, 'binary')
    if(!guildData) return { content: 'error getting excel file...' }

    return { content: null, file: guildData, fileName: gObj.name+'.xlsx' }
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
