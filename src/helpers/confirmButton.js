'use strict'
const saveCmdOptions = require('./saveCmdOptions')
const replyMsg = require('./replyMsg')

module.exports = async(obj = {}, msg, method = 'PATCH')=>{
  await saveCmdOptions(obj)
  await replyMsg(obj, {
    content: msg,
    flags: 64,
    components: [{
      type: 1,
      components: [
        {
          type: 2,
          label: 'Yes',
          style: 3,
          custom_id: JSON.stringify({id: obj.id, dId: obj.member?.user?.id, response: 'yes'})
        },
        {
          type: 2,
          label: 'No',
          style: 4,
          custom_id: JSON.stringify({id: obj.id, dId: obj.member?.user?.id, response: 'no'})
        }
      ]
    }]
  }, method)
}
