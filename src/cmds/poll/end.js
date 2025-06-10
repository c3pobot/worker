'use strict'
const mongo = require('mongoclient')
const getPollStats = require('./getPollStats')

const { checkServerAdmin, replyButton, replyComponent } = require('src/helpers')
const { getChannel } = require('src/helpers/discordmsg')

const TruncateString = (str, num)=>{
  if(str.length > num){
    str = str.slice(0, (num - 3))
    str += '...'
  }
  return str
}

module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: "Command Canceled...", components: [] }

  let auth = await checkServerAdmin(obj)
  if(!auth) return { content: 'This command is only avaliable to server Admins' }

  let chId = opt.channel?.value || obj.channel_id, poll
  let pollId = obj.confirm?.pollId

  if(obj.confirm) await replyButton(obj)

  let polls = await mongo.find('poll', { sId: obj.guild_id, status: 1})
  if(!polls || polls?.length == 0) return { content: 'there are no polls running in this server' }

  polls = polls.filter(x=>x.chId == chId)
  if(polls.length == 1) poll = polls[0]
  if(pollId >= 0 && !poll) poll = polls[pollId]
  if(pollId >= 0 && !poll) return { content: 'Error finding Poll' }

  if(!(pollId >= 0) && !poll){
    let embedMsg = { content: 'There are multiple polls'+(chId ? ' running in <#'+chId+'>':'')+'. Which one do you want to end?', components: [] }
    let x = 0
    for(let i in polls){
      if(!embedMsg.components[x]) embedMsg.components[x] = { type:1, components: []}
      let buttonLabel = await TruncateString(polls[i].question, 75)
      embedMsg.components[x].components.push({
        type: 2,
        label: buttonLabel,
        style: 1,
        custom_id: JSON.stringify({ id: obj.id, pollId: i, dId: obj.member?.user?.id })
      })
      if(embedMsg.components[x].components.length == 5 && embedMsg.components.length < 5) x++;
    }
    embedMsg.components[x].components.push({
      type: 2,
      label: 'Cancel',
      style: 4,
      custom_id: JSON.stringify({ id: obj.id, cancel: true, dId: obj.member?.user?.id })
    })
    await replyComponent(obj, embedMsg)
    return
  }

  if(!poll) return { content: 'Error finding Poll' }

  let channel = await getChannel(poll.chId)

  let pollMsg = getPollStats(poll)
  if(!pollMsg) return { content: 'Error getting poll stats' }

  await mongo.set('poll', { _id: poll._id }, { status: 0 })
  pollMsg.title = (channel && channel.name ? '#'+channel.name:'<#'+poll.chId+'>')+' closed poll final stats'
  return { content: null, embeds: [pollMsg] }

}
