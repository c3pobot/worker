'use strict'
const json2xls = require('json2xls');
module.exports = async( obj = {} )=>{
  try{
    let guildId, gObj, msg2send = {content: 'Your discord id is not linked to allyCode'}, opt = obj?.data?.options || []
    const allyObj = await HP.GetPlayerAC(obj, opt)
    if(allyObj?.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
    if(allyObj?.allyCode){
      msg2send.content = 'Error finding player'
      const pObj = await Client.post('queryPlayer', {allyCode: allyObj.allyCode.toString()})
      if(pObj?.guildId) guildId = pObj.guildId
    }
    if(guildId){
      msg2send.content = 'error finding guild'
      gObj = await Client.post('fetchGuild', {guildId: guildId})
    }
    if(gObj?.member){
      let members = []
      let glFaction = await HP.GetFaction('galactic_legend', false)
      if(glFaction?.units) glFaction = glFaction.units
      members = gObj.member.map(x=>{
        const tempObj = {
          'Name': x.name,
          'allyCode': x.allyCode,
          'swgohgg': 'https://swgoh.gg/p/'+x.allyCode+'/',
          'GP': x.gp,
          'Char GP': x.gpChar,
          'Ship GP': x.gpShip,
          'Num Zetas': x.zetaCount,
          'Num 6 pip Mods': x.sixModCount,
          'Num Omi': x.omniCount,
          'Num GL': x.rosterUnit?.filter(u=>glFaction.includes(u.definitionId.split(':')[0])).length || 0,
          'Has Exec': 'no'
        }
        if(x.rosterUnit?.filter(u=>u.baseId.startsWith('CAPITALEXECUTOR')).length > 0) tempObj['Has Exec'] = 'yes'
        return tempObj
      })
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
      if(guildData){
        msg2send.content = null
        msg2send.file = guildData
        msg2send.fileName = gObj.name+'.xlsx'
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
