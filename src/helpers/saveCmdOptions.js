'use strict'
const mongo = require('mongoclient')
module.exports = async(obj = {})=>{
  if(!obj.data?.options || !obj.id) return
  await mongo.set('cmdOptionsCache', { _id: obj.id }, { cmd: obj.cmd, subCmd: obj.subCmd, subCmdGroup: obj.subCmdGroup, options: obj.data.options || {}, updated: Date.now() })
}
