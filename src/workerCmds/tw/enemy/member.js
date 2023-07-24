'use strict'
const { mongo, DeepCopy, GetGuildId, ReplyMsg } = require('helpers')
const swgohClient = require('swgohClient')
const sorter = require('json-array-sorter')
module.exports = async(obj, opt)=>{
  try{
    let msg2send = {content: 'You do not have discordId linked to allyCode'}, enemyId, guild, eObj
    let pObj = await GetGuildId({dId: obj.member.user.id}, {}, opt)
    if(pObj?.guildId){
      msg2send.content = 'You do not have an opponent guild registered'
      let guild = (await mongo.find('twStatus', {_id: pObj.guildId}))[0]
      if(guild && guild.enemy) enemyId = guild.enemy
    }
    if(enemyId){
      msg2send.content = 'error getting opponent guild info'
      eObj = await swgohClient('fetchTwGuild', { id: enemyId, joined: [], playerProject: {name: 1, playerId:1, allyCode: 1}})
    }
    if(eObj?.member.length > 0){
      let memberSorted = sorter([{column: 'name', order: 'ascending'}], eObj.member)
      if(memberSorted.length > 0){
        msg2send.content = null
        msg2send.embeds = []
        const embedMsg = {
          color: 15844367,
          timestamp: new Date(eObj.updated),
          description: '```autohotkey\n'
        }
        let x = 0, count = 0
        for(let i in memberSorted){
          if(x == 0 && count == 0){
            embedMsg.title = eObj.name+' Members ('+memberSorted.length+')';
          }
          embedMsg.description += memberSorted[i].allyCode+' : '+memberSorted[i].name+'\n'
          count++
          if(((+i + 1) == +memberSorted.length) && count < 25) count = 25
          if(count == 25){
            x++;
            count = 0
            embedMsg.description += '```'
            msg2send.embeds.push(DeepCopy(embedMsg))
            embedMsg.title = null
            embedMsg.description = '```autohotkey\n'
          }
        }
      }
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
