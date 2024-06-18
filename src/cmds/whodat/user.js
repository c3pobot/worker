'use strict'
const { getUser } = require('src/helpers/discordmsg')
module.exports = async(obj = {}, opt = {})=>{
  if(!opt.id?.value) return { content: 'no user provided'}

  let usr = await getUser(opt.id?.value)
  if(!usr?.id) return { content: 'error finding user' }

  let embedMsg = { color: 15844367, description: 'dId '+opt.id.value+' info for C3PO\n```\n' }
  embedMsg.description += 'Member        : @'+usr.username+'\n'
  embedMsg.description += 'Member Tag    : @'+usr.username+'#'+usr.discriminator+'\n'
  embedMsg.description += '```'
  return { content: null, embeds: [embedMsg] }
}
