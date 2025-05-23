'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = {}, opt = {})=>{
  let id = opt.id?.value
  if(!id) return { content: 'You did not provide an id of a custom reaction to remove...' }

  let lcr = (await mongo.find('reactions', { _id: 'global' }))[0]
  if(!lcr?.cr || lcr?.cr?.length === 0) return { content: 'There are no global reactions ...'}
  let tempObj = lcr.cr.find(x=>x.id === id)
  if(!tempObj) return { content: `**${id}** is not a valid custom reaction...`}

  await mongo.pull('reactions', { _id: 'global' }, { cr: { id: id } })
  return { content: `custom reaction for trigger **${tempObj.trigger}** has been removed...`}
}
