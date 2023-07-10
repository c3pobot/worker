'use strict'
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'You do not have allyCode linked to discord'}, allyCode, pObj, gObj, array = []
    const allyObj = await HP.GetPlayerAC(obj, opt)
    const sortOrder = HP.GetOptValue(opt, 'sort') || 'mods'
    if(allyObj && allyObj.allyCode) allyCode = allyObj.allyCode
    if(allyObj && allyObj.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
    const guildTotal = {
      mods: 0,
      gear: 0,
      total: 0,
      top: 0
    }
    if(allyCode){
      msg2send.content = '**'+allyCode+'** is not a valid allyCode'
      pObj = await HP.GetGuildId({}, {allyCode: allyCode}, [])
    }
    if(pObj && pObj.guildId){
      msg2send.content = 'Error getting guild Info'
      gObj = await HP.FetchGuild({token: obj.token, id: pObj.guildId, projection: {playerId: 1, name: 1, quality: 1}})
    }
    if(gObj){
      msg2send.content = 'Error getting quality info'
      array = gObj.member.map(m=>{
        guildTotal.mods += (m.quality.mods || 0)
        guildTotal.gear += (m.quality.gear || 0)
        guildTotal.total += ((m.quality.mods || 0) + (m.quality.gear || 0))
        guildTotal.top += (m.quality.top || 0)
        return Object.assign({}, {
          name: m.name,
          mods: (m.quality.mods || 0),
          gear: (m.quality.gear || 0),
          total: ((m.quality.mods || 0) + (m.quality.gear || 0)),
          top: (m.quality.top || 0)
        })
      });
      array = await sorter([{column: sortOrder, order: 'descending'}], array)
    }
    if(array?.length > 0){
      const embedMsg = {
        color: 3447003,
        timestamp:new Date(),
        title: gObj.name+' Roster Quality ('+gObj.member.length+') sorted by '+sortOrder,
        description: '```autohotkey\n'+' Mod : Gear : Tot  : Top 80 Mod : Name\n'
      }
      embedMsg.description += numeral(guildTotal.mods / +gObj.member.length).format('0.00')+' : '+numeral(guildTotal.gear / +gObj.member.length).format('0.00')+' : '+numeral(guildTotal.total / +gObj.member.length).format('0.00')+' : '+numeral(guildTotal.top / +gObj.member.length).format('0.00')+' : Guild Average\n'
      for(let m in array){
        const modQuality = numeral(array[m].mods).format('0.00')
        const gearQuality = numeral(array[m].gear).format('0.00')
        const totalQuality = numeral(array[m].total).format('0.00')
        const top80Quality = numeral(array[m].top).format('0.00')
        embedMsg.description += (modQuality.length > 4 ? modQuality.substring(0,4):modQuality)+' : '+(gearQuality.length > 4 ? gearQuality.substring(0,4):gearQuality)+' : '+(totalQuality.length > 4 ? totalQuality.substring(0,4):totalQuality)+' : '+(top80Quality.length > 4 ? top80Quality.substring(0,4):top80Quality)+' : '+(array[m].name.length > 10 ? array[m].name.substring(0, 10):array[m].name)+'\n'
      }
      embedMsg.description += '```'
      msg2send.content = null
      msg2send.embeds = [embedMsg]
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
