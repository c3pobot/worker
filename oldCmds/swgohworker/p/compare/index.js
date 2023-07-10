'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'You do not have allyCode linked to discordId'}, pObj, eObj, guildId, eAllyCode, gaInfo, charUnits = [], shipUnits = []
    const dObj = await HP.GetDiscordAC(obj.member.user.id, opt)
    if(dObj && dObj.allyCode){
      msg2send.content = 'You must provide @user or allyCode to compare with'
      const edObj = await HP.GetPlayerAC({}, opt)
      if(edObj && edObj.mentionError) msg2send.content = 'That user does not have allyCode linked to discordId'
      if(edObj && edObj.allyCode){
        eAllyCode = edObj.allyCode
        const gObj = await HP.GetGuildId({dId: obj.member.id}, dObj, opt)
        if(gObj && gObj.guildId) guildId = gObj.guildId
      }
    }
    if(eAllyCode){
      msg2send.content = 'Error getting player data'
      pObj = await HP.FetchPlayer({token: obj.token, allyCode: dObj.allyCode.toString()})
      gaInfo = (await mongo.find('ga', {_id: dObj.allyCode.toString()}))[0]
      if(!gaInfo) gaInfo = {}
      if(!gaInfo.units) gaInfo.units = []
    }
    if(pObj && pObj.allyCode){
      msg2send.content = '**'+eAllyCode+'** is not a valid allyCode'
      eObj = await HP.FetchPlayer({token: obj.token, allyCode: eAllyCode.toString()})
    }
    if(eObj && eObj.allyCode){
      msg2send.content = null
      msg2send.embeds = []
      const baseMsg = {
        color: 15844367,
        timestamp: new Date(eObj.updated),
        footer: {
          text: 'Data Updated'
        },
        title: pObj.name+' player comparison',
        description: '['+pObj.name+'](https://swgoh.gg/p/'+pObj.allyCode+'/gac-history/) vs ['+eObj.name+'](https://swgoh.gg/p/'+eObj.allyCode+'/gac-history/)',
        fields: []
      }
      baseMsg.fields.push(await FT.FormatGAOverview(pObj, eObj));
      baseMsg.fields.push(await FT.FormatGAMods(pObj, eObj));
      baseMsg.fields.push(await FT.FormatGARelics(pObj, eObj));
      baseMsg.fields.push(await FT.FormatGAQuality(pObj, eObj));
      msg2send.embeds.push(baseMsg)
      if(gaInfo.units.length > 0){
        if(gaInfo.units.filter(x=>x.combatType == 1).length > 0) charUnits = await sorter([{column: 'nameKey', order: 'ascending'}], gaInfo.units.filter(x=>x.combatType == 1))
        if(gaInfo.units.filter(x=>x.combatType == 2).length > 0) shipUnits = await sorter([{column: 'nameKey', order: 'ascending'}], gaInfo.units.filter(x=>x.combatType == 2))
        if(charUnits.length > 0){
          const charMsg = {
            color: 15844367,
            timestamp: new Date(eObj.updated),
            footer: {
              text: 'Data Updated'
            },
            title: 'Char units comparison',
            description: '['+pObj.name+'](https://swgoh.gg/p/'+pObj.allyCode+'/gac-history/) vs ['+eObj.name+'](https://swgoh.gg/p/'+eObj.allyCode+'/gac-history/)',
            fields: []
          }
          let count = 0
          for(let i in charUnits){
            const uInfo = (await mongo.find('units', {_id: charUnits[i].baseId}, {portrait: 0}))[0]
            if(uInfo){
              const pUnit = pObj.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':'));
              const eUnit = eObj.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':'));
              charMsg.fields.push(await FT.FormatGAUnitBasic(pUnit, eUnit, uInfo))
              count++
              if(((+i + 1) == charUnits.length) && count < 20) count = 20
              if(count == 20){
                if(msg2send.embeds.length < 10) msg2send.embeds.push(JSON.parse(JSON.stringify(charMsg)))
                charMsg.fields = []
                count = 0
              }
            }
          }
        }
        if(shipUnits.length > 0){
          const shipMsg = {
            color: 15844367,
            timestamp: new Date(eObj.updated),
            footer: {
              text: 'Data Updated'
            },
            title: 'Ship units comparison',
            description: '['+pObj.name+'](https://swgoh.gg/p/'+pObj.allyCode+'/gac-history/) vs ['+eObj.name+'](https://swgoh.gg/p/'+eObj.allyCode+'/gac-history/)',
            fields: []
          }
          let count = 0
          for(let i in shipUnits){
            const uInfo = (await mongo.find('units', {_id: shipUnits[i].baseId}, {portrait: 0}))[0]
            if(uInfo){
              const pUnit = pObj.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':'));
              const eUnit = eObj.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':'));
              shipMsg.fields.push(await FT.FormatGAUnitBasic(pUnit, eUnit, uInfo))
              count++
              if(((+i + 1) == shipUnits.length) && count < 20) count = 20
              if(count == 20){
                if(msg2send.embeds.length < 10) msg2send.embeds.push(JSON.parse(JSON.stringify(shipMsg)))
                shipMsg.fields = []
                count = 0
              }
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
