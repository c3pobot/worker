'use strict'
const ModCount = (obj)=>{
  let count = 0
  for(let i in obj) count += (+obj[i].equippedStatMod.length || 0)
  return count;
}
module.exports = async(obj = {})=>{
  try{
    let opt = obj?.data?.options || [], pObj, msg2send = {content: 'You do not have your allyCode linked to discordId'}, allyCode
    const allyObj = await HP.GetPlayerAC(obj, opt)
    if(allyObj && allyObj.allyCode) allyCode = allyObj.allyCode
    if(allyObj && allyObj.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
    if(allyCode){
      msg2send.content = 'Error getting player data'
      pObj = await HP.FetchPlayer({allyCode: allyCode.toString()})
    }
    if(pObj?.allyCode){
      const embedMsg = {
        color: 3447003,
        timestamp: new Date(pObj.updated),
        description: '[' + pObj.name + '](https://swgoh.gg/p/' + pObj.allyCode + '/)',
        fields: [],
        footer: {
          text: "Data updated"
        }
      }
      const tempOver = {
        name: 'Overview',
        value: '```autohotkey\n'
      }
      tempOver.value += pObj.rosterUnit.filter(x => x.combatType == 1).length + ' units\n'
      tempOver.value += numeral(await ModCount(pObj.rosterUnit)).format('0,0')+' equipped mods\n'
      tempOver.value += '```'
      embedMsg.fields.push(tempOver)
      embedMsg.fields.push(await FT.GetNoMods(pObj.rosterUnit))
      embedMsg.fields.push(await FT.GetMissingMods(pObj.rosterUnit))
      embedMsg.fields.push(await FT.GetIncModsets(pObj.rosterUnit))
      embedMsg.fields.push(await FT.GetMissingModLevel(pObj.rosterUnit))
      embedMsg.fields.push(await FT.GetLowModPips(pObj.rosterUnit))
      msg2send.content = null
      msg2send.embeds = [embedMsg]
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
