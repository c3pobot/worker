'use strict'
const swgohClient = require('swgohClient')
const { GetAllyCodeObj, GetOptValue, ReplyMsg } = require('helpers')
const guildProject = { id:1, name: 1, summary: 1, member: 1, profile: 1 }
const playerProject = { allyCode: 1, playerId: 1, name: 1, memberContribution: 1, gp: 1, gpChar:1, gpShip: 1, summary: 1 }
module.exports = async(obj = {}, opt = [])=>{
  try{
    let allyCode, pObj, msg2send = {content: 'You do not have allycode linked to discordId'}, guild
    let dObj = await GetAllyCodeObj(obj, opt)
    if(dObj?.allyCode) allyCode = dObj.allyCode
    if(dObj?.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
    if(allyCode && !dObj.mentionError){
      msg2send.content = 'error getting guild for '+allyCode+'...'
      guild = await swgohClient('fetchGuild', { id: +allyCode, excludePlayers: false, guildProject: guildProject, playerProject: playerProject })
    }
    if(guild){
      msg2send.content = guild.name
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
