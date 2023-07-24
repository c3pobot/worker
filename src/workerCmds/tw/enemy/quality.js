'use strict'
const { mongo, DeepCopy, GetGuildId, ReplyMsg } = require('helpers')
const swgohClient = require('swgohClient')
const sorter = require('json-array-sorter')
const numeral = require('numeral')
module.exports = async(obj, opt)=>{
  try{
    let msg2send = {content: 'You do not have discordId linked to allyCode'}, enemyId, guild, gObj
    const pObj = await GetGuildId({dId: obj.member.user.id}, {}, opt)
    if(pObj?.guildId){
      msg2send.content = 'You do not have an opponent guild registered'
      const guild = (await mongo.find('twStatus', {_id: pObj.guildId}))[0]
      if(guild && guild.enemy) enemyId = guild.enemy
    }
    if(enemyId){
      msg2send.content = 'error getting opponent guild info'
      gObj = await swgohClient('fetchTwGuild', { id: enemyId, joined: [], playerProject: {name: 1, playerId:1, summary: 1}})
    }
    if(gObj?.member?.length > 0){
      let members = gObj?.member.map(x=>{
        return Object.assign({}, {
          name: x.name,
          mods: x.summary?.quality?.mods,
          top: x.summary?.quality?.top,
          gear: x.summary?.quality?.gear,
          total: x.summary?.quality?.total
        })
      })
      members = sorter([{column: 'mods', order: 'descending'}], members)
      if(members.length > 0){
        msg2send.content = null
        msg2send.embeds = []
        const embedMsg = {
          color: 15844367,
          timestamp: new Date(gObj.updated),
          description: '```autohotkey\n'+' Mod : Gear : Tot  : Top 80 Mod : Name\n'
        }
        embedMsg.description += numeral(gObj.summary?.quality?.mods / +gObj.member.length).format('0.00')+' : '+numeral(gObj.summary?.quality?.gear / +gObj.member.length).format('0.00')+' : '+numeral(gObj.summary?.quality?.total / +gObj.member.length).format('0.00')+' : '+numeral(gObj.summary?.quality?.top / +gObj.member.length).format('0.00')+' : Guild Average\n'
        let x = 0, count = 0
        for(let m in members){
          if(x == 0 && count == 0){
            embedMsg.title = gObj.name+' Roster Quality ('+gObj.member.length+')';
          }
          let modQuality = numeral(members[m]?.mods).format('0.00')
          let gearQuality = numeral(members[m]?.gear).format('0.00')
          let totalQuality = numeral(members[m]?.total).format('0.00')
          let top80Quality = numeral(members[m]?.top).format('0.00')
          embedMsg.description += (modQuality.length > 4 ? modQuality.substring(0,4):modQuality)+' : '+(gearQuality.length > 4 ? gearQuality.substring(0,4):gearQuality)+' : '+(totalQuality.length > 4 ? totalQuality.substring(0,4):totalQuality)+' : '+(top80Quality.length > 4 ? top80Quality.substring(0,4):top80Quality)+' : '+(members[m].name.length > 10 ? members[m].name.substring(0, 10):members[m].name)+'\n'
          count++
          if(((+m + 1) == +members.length) && count < 25) count = 25
          if(count == 25){
            x++;
            count = 0
            embedMsg.description += '```'
            msg2send.embeds.push(DeepCopy(embedMsg))
            embedMsg.title = null
            embedMsg.description = '```autohotkey\n'+' Mod : Gear : Tot  : Top 80 Mod : Name\n'
            embedMsg.description += numeral(gObj.summary?.quality?.mods / +gObj.member.length).format('0.00')+' : '+numeral(gObj.summary?.quality?.gear / +gObj.member.length).format('0.00')+' : '+numeral(gObj.summary?.quality?.total / +gObj.member.length).format('0.00')+' : '+numeral(gObj.summary?.quality?.top / +gObj.member.length).format('0.00')+' : Guild Average\n'
          }
        }
      }
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
