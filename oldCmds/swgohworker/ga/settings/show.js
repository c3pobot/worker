'use strict'
const { GetGAHist, GetGAInfo } = require('src/cmds/ga/helpers')
module.exports = async(obj, opt = [], dObj, gaInfo)=>{
  try{
    let msg2send = {content: 'Your allyCode is not linked to your discord id'}, pObj, charUnits = [], shipUnits = []
    if(!dObj) dObj = await HP.GetDiscordAC(obj.member.user.id, opt)
    if(dObj && dObj.allyCode && (!gaInfo || !gaInfo.units)){
      msg2send.content = 'You have no units set for comparison'
      gaInfo = await GetGAInfo(dObj.allyCode)
      if(!gaInfo) gaInfo = {units: [], enemies: []}
    }
    if(gaInfo.units.length > 0){
      pObj = await Client.post('fetchPlayer', {allyCode: +dObj.allyCode}, null)
    }
    if(pObj && pObj.allyCode){
      msg2send.content = null
      msg2send.embeds = []
      if(gaInfo.units.filter(x=>x.combatType == 1).length > 0) charUnits = await sorter([{column: 'nameKey', order: 'ascending'}], gaInfo.units.filter(x=>x.combatType == 1))
      if(gaInfo.units.filter(x=>x.combatType == 2).length > 0) shipUnits = await sorter([{column: 'nameKey', order: 'ascending'}], gaInfo.units.filter(x=>x.combatType == 2))
      if(charUnits.length > 0){
        const charMsg = {
          color: 15844367,
          title: pObj.name+' Char units for GA comparison',
          description: '```\n'
        }
        for(let i in charUnits) charMsg.description += charUnits[i].nameKey+'\n';
        charMsg.description += '```'
        msg2send.embeds.push(charMsg)
      }
      if(shipUnits.length > 0){
        const shipMsg = {
          color: 15844367,
          title: pObj.name+' ship units for GA comparison',
          description: '```\n'
        }
        for(let i in shipUnits) shipMsg.description += shipUnits[i].nameKey+'\n';
        shipMsg.description += '```'
        msg2send.embeds.push(shipMsg)
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
