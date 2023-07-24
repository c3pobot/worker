'use strict'
const { mongo, ButtonPick, CheckServerAdmin, DiscordQuery, GetOptValue, ReplyButton, ReplyMsg, TruncateString } = require('helpers')
const GetPollStats = require('./getPollStats')
module.exports = async(obj = {}, opt = [] )=>{
    try{
      let msg2send = {content: 'This command is only avaliable to server Admins'}, auth = 0, polls, poll, pollId, chId
      if(await CheckServerAdmin(obj)){
        auth ++
        msg2send.content = 'Error finding poll'
        chId = await GetOptValue(opt, 'channel')
        if(obj.confirm?.pollId) pollId = obj.confirm.pollId
      }
      if(auth){
        msg2send.content = 'there are no polls running in this server'
        polls = await mongo.find('poll', {sId: obj.guild_id, status: 1})
      }
      if(polls?.length > 0){
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
                content: 'There are multiple polls'+(chId ? ' running in <#'+chId+'>':'')+'. Which one do you want to end?',
                components: []
              }
              let x = 0
              for(let i in polls){
                if(!embedMsg.components[x]) embedMsg.components[x] = { type:1, components: []}
                const buttonLabel = await TruncateString(polls[i].question, 75)
                embedMsg.components[x].components.push({
                  type: 2,
                  label: buttonLabel,
                  style: 1,
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
      if(poll){
        await ReplyButton(obj, 'Getting poll stats')
        const channel = await DiscordQuery('channels/'+poll.chId)
        msg2send.content = 'Error getting poll stats'
        if(poll?.votes && poll?.answers?.length > 0){
          await mongo.set('poll', {_id: poll._id}, {status: 0})
          const embedMsg = await GetPollStats(poll)
          if(embedMsg){
            embedMsg.title = (channel?.name ? '#'+channel.name:'<#'+poll.chId+'>')+' closed poll final stats'
            msg2send.content = null
            msg2send.embeds = [embedMsg]
          }
        }
      }
      await ReplyMsg(obj, msg2send)
    }catch(e){
      throw(e)
    }
}
