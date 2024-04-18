'use strict'
const numeral = require('numeral')
const { getPlayerAC, fetchPlayer, replyError } = require('src/helpers')
const { getNoMods, getMissingMods, getIncModsets, getLowModPips } = require('src/format')
const modCount = (obj)=>{
  let count = 0
  for(let i in obj) count += (+obj[i].equippedStatMod.length || 0)
  return count;
}
module.exports = async(obj = {})=>{
  try{
    let opt = obj?.data?.options || [], pObj, msg2send = {content: 'You do not have your allyCode linked to discordId'}, allyCode
    let allyObj = await getPlayerAC(obj, opt)
    if(allyObj && allyObj.allyCode) allyCode = allyObj.allyCode
    if(allyObj && allyObj.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
    if(allyCode){
      msg2send.content = 'Error getting player data'
      pObj = await fetchPlayer({allyCode: allyCode.toString()})
    }
    if(pObj?.allyCode){
      let embedMsg = {
        color: 3447003,
        timestamp: new Date(pObj.updated),
        description: '[' + pObj.name + '](https://swgoh.gg/p/' + pObj.allyCode + '/)',
        fields: [],
        footer: {
          text: "Data updated"
        }
      }
      let tempOver = {
        name: 'Overview',
        value: '```autohotkey\n'
      }
      tempOver.value += pObj.rosterUnit.filter(x => x.combatType == 1).length + ' units\n'
      tempOver.value += numeral(await modCount(pObj.rosterUnit)).format('0,0')+' equipped mods\n'
      tempOver.value += '```'
      embedMsg.fields.push(tempOver)
      embedMsg.fields.push(await getNoMods(pObj.rosterUnit))
      embedMsg.fields.push(await getMissingMods(pObj.rosterUnit))
      embedMsg.fields.push(await getIncModsets(pObj.rosterUnit))
      embedMsg.fields.push(await getMissingModLevel(pObj.rosterUnit))
      embedMsg.fields.push(await getLowModPips(pObj.rosterUnit))
      msg2send.content = null
      msg2send.embeds = [embedMsg]
    }
    return msg2send
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
