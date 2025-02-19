'use strict'
const mongo = require('mongoclient')
const rabbitmq = require('src/rabbitmq')
const restoreMsg = require('./restoreMsg')
const BOT_OWNER_ID = process.env.BOT_OWNER_ID
module.exports = async(obj = {}, opt = {})=>{
  if(!BOT_OWNER_ID || obj?.member?.user?.id !== BOT_OWNER_ID) return

  if(!opt.poll) return
  if(opt.confirm == 'no') return await restoreMsg(obj, opt)

  if(!opt.confirm){
    let actionRow = [{ type: 1, components: [] }]
    actionRow[0].components.push({
      type: 2,
      label: `${(opt.value == 'yes' ? 'Approve':'Reject')}`,
      style: 3,
      custom_id: JSON.stringify({ cmd: 'unit-approve', value: opt.value, poll: opt.poll, confirm: 'yes' })
    })
    actionRow[0].components.push({
      type: 2,
      label: 'Cancel',
      style: 4,
      custom_id: JSON.stringify({ cmd: 'unit-approve', value: opt.value, poll: opt.poll, confirm: 'no' })
    })
    return ({ content: `Are you sure you want to **${(opt.value == 'yes' ? 'APPROVE':'REJECT')}** this image change?`, components: actionRow })
  }

  if(opt.confirm !== 'yes') return await restoreMsg(obj, opt)

  let poll = (await mongo.find('unitPortraitPoll', { _id: opt.poll }))[0]
  if(!poll?.base64Img || !poll?.thumbnailName) return await restoreMsg(obj, opt)
  let status = await rabbitmq.add('assets', { cmd: 'save', id: `portrait-${poll.thumbnailName}`, img: poll.thumbnailName, dir: 'portrait', base64Img: poll?.base64Img })
  if(!status) return await restoreMsg(obj, opt)
  await mongo.set('unitPortraitPoll', { _id: opt.poll }, { status: false, approved: opt.value })
  return { content: `portrait change was ${(opt.value == 'yes' ? 'Approved':'Rejected')} with poll results of ${poll?.yesVotes?.length || 0} to ${poll?.noVotes?.length || 0}`, components: [] }
}
