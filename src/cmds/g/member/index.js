'use strict'
const mongo = require('mongoclient')
const getGuild = require('./getGuild')
const { getGuildId, getPlayerAC } = require('src/helpers')
const sorter = require('json-array-sorter')

module.exports = async(obj = {}, opt = {})=>{
  let allyObj = await getPlayerAC(obj, opt)
  if(allyObj?.mentionError) return { content: 'that user does not have allyCode linked to discordId' }

  let allyCode = allyObj?.allyCode
  if(!allyCode) return { content: 'You do not have allyCode linked to discord' }

  let pObj = await getGuildId({}, { allyCode: allyCode }, opt)
  if(!pObj?.guildId) return { content: `error getting guildId for ${allyCode}...` }

  let gObj = await getGuild(pObj.guildId)
  if(!gObj?.member) return { content: `Error getting guild info` }

  let members = sorter([{column: 'name', order: 'ascending'}], gObj.member)
  let embedMsg = {
    color: 15844367,
    timestamp: new Date(gObj.updated),
    title: gObj.name+' Members ('+members.length+')',
    description: '```autohotkey\n',
    footer:{
      text: "Data updated"
    }
  }
  for(let i in members){
    let dObj = (await mongo.find('discordId', { 'allyCodes.allyCode': +members[i].allyCode }, { allyCodes: { allyCode: 1 } }))[0]
    embedMsg.description += members[i].allyCode+' : '+(dObj?.allyCodes?.length > 0 ? 1:0)+' : '+members[i].name+'\n'
  }
  embedMsg.description += '```'
  return { content: null, embeds: [embedMsg] }
}
