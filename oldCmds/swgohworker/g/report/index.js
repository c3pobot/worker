'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'You do not have allyCode linked to discordId'}, guildId, gObj, charUnits = [], shipUnits = [], glUnits = [], includeUnits = false
    if(opt.find(x=>x.name == 'units')) includeUnits = opt.find(x=>x.name == 'units').value
    const pObj = await HP.GetGuildId({dId: obj.member.user.id}, {}, opt)
    if(pObj && pObj.guildId) guildId = pObj.guildId
    if(guildId){
      msg2send.content = 'Error getting guild info'
      gObj = await HP.FetchGuild({token: obj.token, id: guildId, projection: HP.dbProjection.guildReport})
    }
    if(gObj){
      const tempGl = (await mongo.find('factions', {_id: 'galactic_legend'}))[0]
      if(tempGl?.units) glUnits = tempGl.units
      let guild = (await mongo.find('guilds', {_id: guildId}))[0]
      if(!guild) guild = {units: []}
      if(guild.units && guild.units.filter(x=>x.combatType == 1).length > 0) charUnits = await sorter([{column: 'nameKey', order: 'ascending'}], guild.units.filter(x=>x.combatType == 1))
      if(guild.units && guild.units.filter(x=>x.combatType == 2).length > 0) shipUnits = await sorter([{column: 'nameKey', order: 'ascending'}], guild.units.filter(x=>x.combatType == 2))
      msg2send.content = null
      msg2send.embeds = []
      const baseMsg = {
        color: 15844367,
        timestamp: new Date(gObj.updated),
        title: 'Guild Report for '+gObj.name+' ('+gObj.member.length+')',
        fields: [],
        footer: {
          text: "Data Updated"
        }
      }
      baseMsg.fields.push(await FT.FormatReportGP(gObj, null));
      baseMsg.fields.push(await FT.FormatReportGuild(glUnits, gObj, null));
      baseMsg.fields.push(await FT.FormatTWRecord(gObj.recentTerritoryWarResult, null));
      msg2send.embeds.push(baseMsg)
      if(includeUnits){
        if(glUnits.length > 0){
          const glMsg = {
            color: 15844367,
            timestamp: new Date(gObj.updated),
            title: gObj.name+' Char units',
            fields: [],
            footer: {
              text: "Data Updated"
            }
          }
          let count = 0
          for(let i in glUnits){
            const uInfo = (await mongo.find('units', {_id: glUnits[i]}, {thumbnail: 0, portrait: 0}))[0]
            if(uInfo){
              const gUnits = gObj.member.filter(x => x.rosterUnit.some(u =>u.definitionId.startsWith(uInfo.baseId+':'))).map(unit => {
                return Object.assign({}, unit.rosterUnit.filter(x => x.definitionId.startsWith(uInfo.baseId+':'))[0])
              })
              glMsg.fields.push(await FT.FormatReportUnit(uInfo, gUnits, null))
              count++
            }
            if((+i + 1) == glUnits.length && count < 20) count = 20
            if(count == 20){
              if(msg2send.embeds.length < 10) msg2send.embeds.push(JSON.parse(JSON.stringify(glMsg)))
              glMsg.fields = []
              count = 0
            }
          }
        }
        if(charUnits.length > 0){
          const charMsg = {
            color: 15844367,
            timestamp: new Date(gObj.updated),
            title: gObj.name+' Char units',
            fields: [],
            footer: {
              text: "Data Updated"
            }
          }
          let count = 0
          for(let i in charUnits){
            if(glUnits.filter(x=>x == charUnits[i].baseId).length == 0){
              const uInfo = (await mongo.find('units', {_id: charUnits[i].baseId}, {thumbnail: 0, portrait: 0}))[0]
              if(uInfo){
                const gUnits = gObj.member.filter(x => x.rosterUnit.some(u =>u.definitionId.startsWith(uInfo.baseId+':'))).map(unit => {
                  return Object.assign({}, unit.rosterUnit.filter(x => x.definitionId.startsWith(uInfo.baseId+':'))[0])
                })
                charMsg.fields.push(await FT.FormatReportUnit(uInfo, gUnits, null))
                count++
              }
            }
            if((+i + 1) == charUnits.length && count < 20) count = 20
            if(count == 20){
              if(msg2send.embeds.length < 10) msg2send.embeds.push(JSON.parse(JSON.stringify(charMsg)))
              charMsg.fields = []
              count = 0
            }
          }
        }
        if(shipUnits.length > 0){
          const shipMsg = {
            color: 15844367,
            timestamp: new Date(gObj.updated),
            title: gObj.name+' Ship units',
            fields: [],
            footer: {
              text: "Data Updated"
            }
          }
          let count = 0
          for(let i in shipUnits){
            if(glUnits.filter(x=>x == shipUnits[i].baseId).length == 0){
              const uInfo = (await mongo.find('units', {_id: shipUnits[i].baseId}, {thumbnail: 0, portrait: 0}))[0]
              if(uInfo){
                const gUnits = gObj.member.filter(x => x.rosterUnit.some(u =>u.definitionId.startsWith(uInfo.baseId+':'))).map(unit => {
                  return Object.assign({}, unit.rosterUnit.filter(x => x.definitionId.startsWith(uInfo.baseId+':'))[0])
                })
                shipMsg.fields.push(await FT.FormatReportUnit(uInfo, gUnits, null))
                count++
              }
            }
            if((+i + 1) == shipUnits.length && count < 20) count = 20
            if(count == 20){
              if(msg2send.embeds.length < 10) msg2send.embeds.push(JSON.parse(JSON.stringify(shipMsg)))
              shipMsg.fields = []
              count = 0
            }
          }
        }
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
