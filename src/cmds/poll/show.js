'use strict'
const mongo = require('mongoclient')

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
  let auth = await checkServerAdmin(obj)
  if(!auth) return { content: 'This command is only avaliable to server Admins' }

  let chId = opt.channel?.value || obj.channel_id, poll
  let pollId = obj.confirm?.pollId

  if(obj.confirm) await replyButton(obj)

  let polls = await mongo.find('poll', { sId: obj.guild_id, status: 1})
  if(!polls || polls?.length == 0) return { content: 'there are no polls running in this server' }

  if(polls.length = 1) poll = polls[0]
  if(pollId && !poll) poll = polls.find(x=>x._id == pollId)
  if(pollId && !poll) return { content: 'Error finding Poll' }

  if(!pollId && !poll){
    let embedMsg = { content: 'There are multiple polls'+(chId ? ' running in <#'+chId+'>':'')+'. Which one do you want to end?', components: [] }
    let x = 0
    for(let i in polls){
      if(!embedMsg.components[x]) embedMsg.components[x] = { type:1, components: []}
      let buttonLabel = await TruncateString(polls[i].question, 75)
      embedMsg.components[x].components.push({
        type: 2,
        label: buttonLabel,
        style: 1,
        custom_id: JSON.stringify({ id: obj.id, pollId: polls[i]._id, dId: obj.member?.user?.id })
      })
      if(embedMsg.components[x].components.length == 5 && embedMsg.components.length < 5) x++;
    }
    await replyComponent(obj, embedMsg)
    return
  }

  if(!poll) return { content: 'Error finding Poll' }

  let pollMsg = { color: 15844367, timestamp: new Date(), description: 'Cast your vote by clicking on the button below\n\n'+poll.question, author: { name: '@'+poll.user+' has started a poll' }}
  let components = [], x = 0
  for(let i in poll.answers){
    if(!components[x]) components[x] = { type:1, components: [] }
    components[x].components.push({
      type: 2,
      label: poll.answers[i].answer,
      style: 1,
      custom_id: JSON.stringify({id: poll._id, type: 'pollvote', respId: poll.answers[i].id})
    })
    if(components[x].components.length == 5) x++;
  }
  return { content: null, embeds: [pollMsg], components: components }
}
