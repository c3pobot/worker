'use strict'
const mongo = require('mongoclient')

module.exports = async(obj = {}, opt = [])=>{
  let usr = opt.user?.value || opt.id?.value
  if(!usr) return { content: 'you did not provide the correct information...' }

  await mongo.del('patreon', { _id: usr })[0]
  return { content: 'patreon removed...' }
}
