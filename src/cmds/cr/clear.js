'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = {}, opt = {})=>{
  if(opt.confirm?.value !== 'yes') return { content: 'Nothing was changed' }

  await mongo.del('reactions', { _id: obj.guild_id })
  return { content: 'All Custom Reactions for this server have been cleared' }
}
