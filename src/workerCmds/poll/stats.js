'use strict'
const { mongo, ButtonPick, CheckServerAdmin, GetChannel, GetOptValue, ReplyButton, ReplyMsg, TruncateString } = require('helpers')
const GetPollStats = require('./getPollStats')
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'This command is only avaliable to server Admins'}, chId, auth = 0, polls, poll, pollId
    if(await CheckServerAdmin(obj)){
      auth ++
      msg2send.content = 'Error finding poll'
      if(opt.find(x=>x.name == 'channel')) chId = opt.find(x=>x.name == 'channel').value
      if(obj.confirm && obj.confirm.pollId) pollId = obj.confirm.pollId
    }
    if(auth){
      msg2send.content = 'there are no polls running in this server'
      polls = await mongo.find('poll', {sId: obj.guild_id})
    }
    if(polls && polls.length > 0){
      msg2send.content = 'Error finding poll'
      if(pollId){
        if(polls.filter(x=>x._id == pollId)) poll = polls.find(x=>x._id == pollId)
      }else{
        if(polls.length == 1){
          poll = polls[0]
        }else{
          if(polls.filter(x=>x.status).length == 1){
            poll = polls.filter(x=>x.status)[0]
          }else{
            const embedMsg = {
              content: 'There are multiple polls'+(chId ? ' running in <#'+chId+'>':'')+'. Which one do you want to see the stats for?\nNote: Green is active Red is inactive',
              components: []
            }
            let x = 0
            for(let i in polls){
              if(!embedMsg.components[x]) embedMsg.components[x] = { type:1, components: []}
              const buttonLabel = await TruncateString(polls[i].question, 75)
              embedMsg.components[x].components.push({
                type: 2,
                label: buttonLabel,
                style: (polls[i].status ? 3:4),
                custom_id: JSON.stringify({id: obj.id, pollId: polls[i]._id})
              })
              if(embedMsg.components[x].components.length == 5 && embedMsg.components.length < 5) x++;
            }
            await ButtonPick(obj, embedMsg)
            return
          }
        }
      }
    }
    if(poll && poll.question){
      await ReplyButton(obj, 'Getting poll stats')
      const channel = await GetChannel(poll.chId)
      msg2send.content = 'Error getting poll stats'
      if(poll && poll.votes && poll.answers && poll.answers.length > 0){
        const embedMsg = await GetPollStats(poll)
        if(embedMsg){
          embedMsg.title = (channel && channel.name ? '#'+channel.name:'<#'+poll.chId+'>')+' '+(poll.status ? 'open':'closed')+' poll stats'
          msg2send.content = null
          msg2send.embeds = [embedMsg]
        }
      }
    }
    ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
