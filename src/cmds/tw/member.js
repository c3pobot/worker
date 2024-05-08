'use strict'
const swgohClient = require('src/swgohClient')
const { getDiscordAC, replyButton, replyTokenError } = require('src/helpers')
const sorter = require('json-array-sorter')

module.exports = async(obj = {}, opt = [])=>{
  if(obj.confirm?.response == 'no') return { content: 'command canceled...' }

  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(!dObj?.uId || !dObj?.type) return { content: 'You do not have your google account linked to your discordId' }

  let gObj = await swgohClient.oauth(obj, 'guild', dObj, {})
  if(gObj === 'GETTING_CONFIRMATION') return
  if(gObj?.error == 'invalid_grant'){
    await replyTokenError(obj, dObj.allyCode)
    return;
  }
  if(gObj?.msg2send) return { content: gObj.msg2send }
  if(!gObj?.data?.guild?.profile) return { content: 'Error getting guild data'}
  if(!gObj?.data?.guild?.territoryWarStatus || gObj?.data?.guild?.territoryWarStatus?.length === 0) return { content: 'There is not a TW in progress' }

  let member = gObj?.data?.guild?.member.filter(x=>x.memberLevel !== 1).map(x=>{
    return {
      playerId: x.playerId,
      name: x.playerName
    }
  })
  if(!member || member?.length === 0) return { content: 'Error getting guild members' }

  let joined = gObj?.data?.guild?.territoryWarStatus[0]?.optedInMember?.map(x=>x.memberId)
  if(!joined || joined?.length === 0) return { content: 'No one has joined TW yet'}
  if(joined.length === member.length) return { content: 'All members have joined' }

  member = sorter([{column: 'name', order: 'ascending'}], member)
  let memberJoined = member.filter(x=>joined.includes(x.playerId))
  let memberNotJoined = member.filter(x=>!joined.includes(x.playerId))
  if(!memberJoined || !memberNotJoined) return { content: 'error figuring it out' }
  if(memberJoined.length == 0 && memberNotJoined.length == 0) return { content: 'error figuring it out' }

  let msg2send = { content: null, embeds: [] }
  if(memberJoined?.length > 0){
    let joinEmbed = {
      color: 15844367,
      title: gObj.data.guild.profile?.name+' players joined ('+memberJoined.length+')',
      description: '```\n'
    }
    for(let i in memberJoined){
      if(memberJoined[i]) joinEmbed.description += memberJoined[i].name+'\n'
    }
    joinEmbed.description += '```'
    msg2send.embeds.push(joinEmbed)
  }
  if(memberNotJoined?.length > 0){
    let notJoinEmbed = {
      color: 15844367,
      title: gObj.data.guild.profile?.name+' players not joined ('+memberNotJoined.length+')',
      description: '```\n'
    }
    for(let i in memberNotJoined) notJoinEmbed.description += memberNotJoined[i].name+'\n'
    notJoinEmbed.description += '```'
    msg2send.embeds.push(notJoinEmbed)
  }
  return msg2send
}
