'use strict'
const numeral = require('numeral')

const { getPlayerAC, fetchPlayer, replyError } = require('src/helpers')
const { getNoMods, getMissingMods, getIncModsets, getMissingModLevel, getLowModPips } = require('src/format')

const modCount = (obj)=>{
  let count = 0
  for(let i in obj) count += (+obj[i].equippedStatMod.length || 0)
  return count;
}
module.exports = async(obj = {})=>{
  try{
    let opt = obj?.data?.options || {}
    let allyObj = await getPlayerAC(obj, opt)
    let allyCode = allyObj?.allyCode
    if(allyObj?.mentionError) return { content: 'that user does not have allyCode linked to discordId' }
    if(!allyCode) return { content: 'You do not have your allyCode linked to discordId' }

    let pObj = await fetchPlayer({ allyCode: allyCode.toString() })
    if(!pObj?.allyCode) return { content: 'error getting player data' }

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
    tempOver.value += numeral(modCount(pObj.rosterUnit)).format('0,0')+' equipped mods\n'
    tempOver.value += '```'
    embedMsg.fields.push(tempOver)
    embedMsg.fields.push(getNoMods(pObj.rosterUnit))
    embedMsg.fields.push(getMissingMods(pObj.rosterUnit))
    embedMsg.fields.push(getIncModsets(pObj.rosterUnit))
    embedMsg.fields.push(getMissingModLevel(pObj.rosterUnit))
    embedMsg.fields.push(getLowModPips(pObj.rosterUnit))
    return { content: null, embeds: [embedMsg] }
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
