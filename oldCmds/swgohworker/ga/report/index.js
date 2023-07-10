'use strict'
const { GetGAHist, GetGAInfo } = require('src/cmds/ga/helpers')
module.exports = async(obj, opt = [], dObj, gaInfo)=>{
  try{
    let msg2send = {content: 'Error getting GAC info'}, eObj, charUnits = [], shipUnits = [], pObj
    if(!dObj) dObj = await HP.GetDiscordAC(obj.member.user.id, opt)
    if(dObj && dObj.allyCode){
      msg2send.content = 'Error getting GAC info'
      pObj = await Client.post('fetchGAPlayer', {id: +dObj.allyCode, opponent: dObj.allyCode}, null)
      if(!gaInfo) gaInfo = await GetGAInfo(dObj.allyCode)
    }
    if(gaInfo && gaInfo.currentEnemy){
      msg2send.content = 'Error getting GAC opponent info'
      eObj = await Client.post('fetchGAPlayer', {id: gaInfo.currentEnemy, opponent: dObj.allyCode}, null)
    }
    if(eObj && eObj.allyCode){
      msg2send.content = null
      msg2send.embeds = []
      const gaOverview = {
        color: 15844367,
        timestamp: new Date(eObj.updated),
        footer: {
          text: 'Data Updated'
        },
        title: pObj.name+' GA Overview',
        description: '['+pObj.name+'](https://swgoh.gg/p/'+pObj.allyCode+'/gac-history/) vs ['+eObj.name+'](https://swgoh.gg/p/'+eObj.allyCode+'/gac-history/)',
        fields: []
      }
      gaOverview.fields.push(await FT.FormatGAOverview(pObj, eObj));
      gaOverview.fields.push(await FT.FormatGAMods(pObj, eObj));
      gaOverview.fields.push(await FT.FormatGARelics(pObj, eObj));
      gaOverview.fields.push(await FT.FormatGAQuality(pObj, eObj));
      msg2send.embeds.push(gaOverview)
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
            title: pObj.name+' GA Char units comparison',
            description: '['+pObj.name+'](https://swgoh.gg/p/'+pObj.allyCode+'/gac-history/) vs ['+eObj.name+'](https://swgoh.gg/p/'+eObj.allyCode+'/gac-history/)',
            fields: []
          }
          let count = 0
          for(let i in charUnits){
            const uInfo = (await mongo.find('units', {_id: charUnits[i].baseId}, {thumbnail: 0, portrait: 0}))[0]
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
            title: pObj.name+' GA Ship units comparison',
            description: '['+pObj.name+'](https://swgoh.gg/p/'+pObj.allyCode+'/gac-history/) vs ['+eObj.name+'](https://swgoh.gg/p/'+eObj.allyCode+'/gac-history/)',
            fields: []
          }
          let count = 0
          for(let i in shipUnits){
            const uInfo = (await mongo.find('units', {_id: shipUnits[i].baseId}, {thumbnail: 0, portrait: 0}))[0]
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
