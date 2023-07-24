'use strict'
const { configMaps } = require('helpers/configMaps')
const { FindUnit, GetOptValue, GetAllyCodeObj, ReplyButton, ReplyMsg, ReplyTokenError, TruncateString } = require('helpers')
const swgohClient = require('swgohClient')
const sorter = require('json-array-sorter')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'You do not have your google/fb account linked to your discordId'}, guildId, gObj, twData, defAvailable = [], joined = [], memberSet = []
    if(obj.confirm) await ReplyButton(obj)
    let baseId = obj.confirm?.baseId
    if(!baseId) baseId = await FindUnit(obj, opt, 'unit')
    if(baseId === 'GETTING_CONFIRMATION') return

    let dObj = await GetAllyCodeObj(obj, opt)
    if(dObj?.uId && dObj?.type){
      msg2send.content = 'Error getting guild data'
      let tempGuild = await swgohClient('guild', {}, dObj, obj)
      if(tempGuild?.error == 'invalid_grant'){
        await ReplyTokenError(obj, dObj.allyCode)
        return;
      }
      if(tempGuild === 'GETTING_CONFIRMATION') return
      if(tempGuild?.data?.guild?.profile?.id) guildId = tempGuild.data.guild.profile.id
      if(tempGuild?.data?.guild?.territoryWarStatus[0]){
        twData = tempGuild.data.guild.territoryWarStatus[0]
      }else{
        if(tempGuild?.data?.guild) msg2send.content = 'there is not a TW in progress'
      }
    }
    if(twData){
      msg2send.content = 'Error getting tw info'
      joined = twData.optedInMember?.map(m =>m.memberId)
      gObj = await swgohClient('fetchTwGuild', { id: guildId, joined: joined, playerProject: { name: 1, playerId: 1, roster: 1 } })
    }
    if(gObj && baseId){
      msg2send.content = 'No members have set **'+configMaps?.UnitMap[baseId]?.nameKey+'** on defense'
      let twDefense = twData.homeGuild?.conflictStatus
      for(let i in twDefense){
        for(let s in twDefense[i].warSquad){
          if(twDefense[i].warSquad[s]?.squad?.cell?.filter(x=>x.unitDefId.startsWith(baseId)).length > 0) memberSet.push(twDefense[i].warSquad[s].playerId)
        }
      }
    }
    if(memberSet?.length > 0){
      msg2send.content = 'All members that have **'+configMaps?.UnitMap[baseId]?.nameKey+'** have set it on defense';
      defAvailable = gObj.member.filter(x=>!memberSet.includes(x.playerId) && x.roster && x.roster[baseId]).length > 0
    }
    if(defAvailable?.length > 0){
      defAvailable = sorter([{column: 'name', order: 'ascending'}], defAvailable)
      const embedMsg = {
        color: 15844367,
        timestamp: new Date(gObj.updated),
        description: 'Total Joined ('+gObj.member.length+')\n```autohotkey\n',
        title: 'TW Guild Defense Available for **'+configMaps?.UnitMap[baseId]?.nameKey+'**',
        footer: {
          text: "Data Updated"
        }
      }
      let count = 0
      for(let i in defAvailable){
        const tempUnit = defAvailable[i].roster[baseId]
        if(tempUnit){
          embedMsg.description += (defAvailable[i].currentRarity || 0)+' : '+tempUnit.gp?.toLocaleString()+' : '+TruncateString(defAvailable[i].name, 12)+'\n'
          count++;
        }
      }
      embedMsg.description += '```'
      embedMsg.title += ' ('+count+')'
      msg2send.content = null
      msg2send.embeds = [embedMsg]
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
