'use strict'
const getGuild = require('./getGuild')
const { getGuildId, getOptValue, getPlayerAC } = require('src/helpers')
const sorter = require('json-array-sorter')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You do not have allyCode linked to discord'}, unit, uInfo, guildId, gObj, gLevel = 0, rLevel = 0, allyCode, pObj
  let allyObj = await getPlayerAC(obj, opt)
  if(allyObj?.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
  if(allyObj?.allyCode) allyCode = allyObj.allyCode
  if(allyCode){
    msg2send.content = '**'+allyCode+'** is not a valid allyCode'
    pObj = await getGuildId({}, {allyCode: allyCode}, opt)
  }
  if(pObj?.guildId){
    msg2send.content = 'Error getting guild Info'
    gObj = await getGuild(pObj.guildId)
  }
  if(gObj?.member){
    let memberSorted = sorter([{column: 'name', order: 'ascending'}], gObj.member)
    let embedMsg = {
      color: 15844367,
      timestamp: new Date(gObj.updated),
      title: gObj.name+' Members ('+gObj.member.length+')',
      description: '```autohotkey\n',
      footer:{
        text: "Data updated"
      }
    }
    for(let i in memberSorted){
      let dObj = (await mongo.find('discordId', {'allyCodes.allyCode': +memberSorted[i].allyCode}, {allyCodes: {allyCode: 1}}))[0]
      embedMsg.description += memberSorted[i].allyCode+' : '+(dObj?.allyCodes?.length > 0 ? 1:0)+' : '+memberSorted[i].name+'\n'
    }
    embedMsg.description += '```'
    msg2send.content = null
    msg2send.embeds = [embedMsg]
  }
  return msg2send
}
