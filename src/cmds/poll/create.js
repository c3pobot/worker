'use strict'
const mongo = require('mongoclient')
const { v4: uuidv4 } = require('uuid')
const { checkServerAdmin } = require('src/helpers')
const { getChannel, sendMsg } = require('src/helpers/discordmsg')
module.exports = async(obj = {}, opt = {})=>{
  let auth = await checkServerAdmin(obj)
  if(!auth) return { content: 'This command is only avaliable to server Admins' }

  let question = opt.question?.value, chId = opt.channel?.value || obj.channel_id, responses = opt.responses?.value?.trim()?.split(';')?.filter(x=>x != '') || []
  if(!question) return { content: 'You must provide a poll question' }
  responses = responses?.sort((a,b)=>{return a-b})
  if(!responses || responses?.length == 0) return { content: 'You must provide poll response(s)' }
  if(responses?.length > 25) { content: 'You can only provide 25 responses' }

  let usrname = obj.member?.nick || obj.member?.user?.username
  let channel = await getChannel(chId)
  if(!channel?.id) return { content: 'Error getting channel info for the poll' }

  let pollId = await uuidv4()
  let pollMsg = { embed: { color: 15844367, timestamp: new Date(), description: 'Cast your vote by clicking on the button below\n\n'+question, author: { name: '@'+usrname+' has started a poll' } }, components: [] }
  let tempObj = { chId: chId, answers: [], status: 1, question: question, sId: obj.guild_id, votes: [], user: usrname }
  let respMsg = { color: 15844367, timestamp: new Date(), title: 'Poll started in '+(channel && channel.name ? '#'+channel.name:'<#'+poll.chId+'>'), description: '**'+question+'**\nAnswers : \n```\n' }
  let x = 0
  for(let i in responses){
    if(responses[i]){
      respMsg.description += responses[i].trim()+'\n'
      if(!pollMsg.components[x]) pollMsg.components[x] = { type: 1, components: []}
      pollMsg.components[x].components.push({
        type: 2,
        label: responses[i].trim(),
        style: 1,
        custom_id: JSON.stringify({ id: pollId, cmd: 'pollvote', respId: i, deferOnly: true })
      })
      tempObj.answers.push({ id: i, answer: responses[i].trim() })
      if(pollMsg.components[x].components.length == 5) x++;
    }
  }
  respMsg.description += '```'
  let status = await sendMsg({ chId: chId }, pollMsg)
  if(status?.id){
    await mongo.set('poll', { _id: pollId }, tempObj)
    return { content: null, embeds: [respMsg] }
  }
  return { content: 'Unable to send messages to <#'+chId+'>' }
}
