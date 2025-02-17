'use strict'
const mongo = require('mongoclient')
module.exports = async(obj = {}, opt = {})=>{
  let id = opt.id?.value
  if(!id) return { content: 'you must provide an id for the custom reacton to remove' }

  let lCR = (await mongo.find('reactions', {_id: obj.member.user.id}))[0]
  let cr = lCR?.cr?.find(x=>x.id == id)
  if(!cr?.trigger) return { content: `ID **${id}** is not for a personal custom reaction` }

  await mongo.pull('reactions', { _id: obj.member.user.id }, { cr: { id: id } })
  return { content: `Personal custom reaction with ID **${id}** and trigger **${cr.trigger}** has been deleted` }
}
