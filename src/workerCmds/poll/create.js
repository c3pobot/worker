'use strict'
const { mongo, CheckServerAdmin, DiscordQuery, GetOptValue, ReplyMsg, SendMsg } = require('helpers')
const { v4: uuidv4 } = require('uuid')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'This command is only avaliable to server Admins'}, responses = [], question, chId, auth = 0
    if(await CheckServerAdmin(obj)){
      msg2send.content = 'You must provide a poll question'
      question = await GetOptValue(opt, 'question')
      chId = await GetOptValue(opt, 'channel', obj.channel_id)
    }
    if(question){
      msg2send.content = 'You must provide poll response(s)'
      let tempResp = await GetOptValue(opt, 'responses')
      if(tempResp) tempResp = tempResp.toString()?.trim().split(';')
      if(tempResp?.filter(x=>x != '').length > 0){
        msg2send.content = 'You can only provide 25 responses'
        if(tempResp.length < 26) responses = tempResp.filter(x=>x != '')
      }
    }
    if(responses.length > 0){
      const channel = await DiscordQuery('channels/'+chId)
      let usrname = obj.member.user.username
      if(obj.member.nick) usrname = obj.member.nick
      msg2send.content = 'Unable to send messages to <#'+chId+'>'
      const sortedArray = await responses.sort((a,b)=>{return a-b})
      const pollId = await uuidv4()
      const pollMsg = {
        embed: {
          color: 15844367,
          timestamp: new Date(),
          description: 'Cast your vote by clicking on the button below\n\n'+question,
          author: {
            name: '@'+usrname+' has started a poll'
          }
        },
        components: []
      }
      const tempObj = {
        chId: chId,
        answers: [],
        status: 1,
        question: question,
        sId: obj.guild_id,
        votes: []
      }
      const respMsg = {
        color: 15844367,
        timestamp: new Date(),
        title: 'Poll started in '+(channel && channel.name ? '#'+channel.name:'<#'+poll.chId+'>'),
        description: '**'+question+'**\nAnswers : \n```\n'
      }
      let x = 0
      for(let i in sortedArray){
        if(sortedArray[i]){
          respMsg.description += sortedArray[i].trim()+'\n'
          if(!pollMsg.components[x]) pollMsg.components[x] = { type:1, components: []}
          pollMsg.components[x].components.push({
            type: 2,
            label: sortedArray[i].trim(),
            style: 1,
            custom_id: JSON.stringify({id: pollId, type: 'pollvote', respId: i})
          })
          tempObj.answers.push({id: i, answer: sortedArray[i].trim()})
          if(pollMsg.components[x].components.length == 5) x++;
        }
      }
      respMsg.description += '```'
      const status = await SendMsg({sId: obj.guild_id, chId: chId}, pollMsg)
      if(status?.status === 'ok'){
        msg2send.content = null
        msg2send.embeds = [respMsg]
        await mongo.set('poll', {_id: pollId}, tempObj)
      }else{
        msg2send.content = 'Error creating poll in <#'+chId+'>'
        if(status?.msg) msg2send.content = status.msg
      }
    }
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
