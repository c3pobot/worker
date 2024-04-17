'use strict'
const { calcGuildStats } = require('src/helpers')
module.exports = (obj, members = [])=>{
  obj.updated = Date.now()
  obj.id = obj.profile.id
  obj.name = obj.profile.name
  calcGuildStats(obj, members)
}
