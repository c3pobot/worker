'use strict'
const log = require('logger')
const mongo = require('mongoclient')

const { replyMsg } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{

  if(!opt.poll) return

  let poll = (await mongo.find('unitPortraitPoll', { _id: opt.poll }))[0]
  if(!poll.status) return

  let hasVoted = poll?.yesVotes?.filter(x=>x == obj?.member?.user?.id).length || 0, msg2send = { content: 'You vote was recorded', flags: 64 }
  if(!hasVoted) hasVoted = poll?.noVotes?.filter(x=>x == obj?.member?.user?.id).length || 0
  if(hasVoted) msg2send.content = 'You have already voted'
  if(!hasVoted){
    if(opt.value == 'yes'){
      await mongo.push('unitPortraitPoll', { _id: opt.poll }, { yesVotes: obj?.member?.user?.id })
      poll.yesVotes.push(obj?.member?.user?.id)
    }
    if(opt.value == 'no'){
      await mongo.push('unitPortraitPoll', { _id: opt.poll }, { noVotes: obj?.member?.user?.id })
      poll.noVotes.push(obj?.member?.user?.id)
    }
    //await mongo.push('unitPortraitPoll', { _id: opt.poll }, { votes: obj?.member?.user?.id })
  }
  let actionRow = [], votes = { type: 1, components : [] }, adminControl = { type: 1, components : [] }
  votes.components.push({
    type: 2,
    label: `Yes (${poll?.yesVotes?.length || 0})`,
    style: 3,
    custom_id: JSON.stringify({ y: poll.y, n: poll.n, cmd: 'unit-vote', poll: opt.poll, value: 'yes' })
  })
  votes.components.push({
    type: 2,
    label: `No (${poll?.noVotes?.length || 0})`,
    style: 4,
    custom_id: JSON.stringify({ y: poll.y, n: poll.n, cmd: 'unit-vote', poll: opt.poll, value: 'no' })
  })
  adminControl.components.push({
    type: 2,
    label: 'Approve',
    style: 3,
    custom_id: JSON.stringify({ cmd: 'unit-approve', poll: opt.poll, value: 'yes' })
  })
  adminControl.components.push({
    type: 2,
    label: 'Reject',
    style: 4,
    custom_id: JSON.stringify({ cmd: 'unit-approve', poll: opt.poll, value: 'no' })
  })
  actionRow.push(votes)
  actionRow.push(adminControl)
  await replyMsg(obj, msg2send, 'POST')
  return { components: actionRow }
}
