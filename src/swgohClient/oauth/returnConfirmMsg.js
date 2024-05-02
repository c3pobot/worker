'use strict'
const saveCmdOptions = require('src/helpers/saveCmdOptions')

module.exports = async(obj = {}) =>{
  await saveCmdOptions(obj)
  let msg2send = {
    content: 'Using this command will temporarly log you out of the game on your device.\n Are you sure you want to do this?',
    flags: 64,
    components: [{
      type: 1,
      components: [
        {
          type: 2,
          label: 'Yes',
          style: 3,
          custom_id: JSON.stringify({ id: obj.id, dId: obj.message?.user?.id, response: 'yes' })
        },
        {
          type: 2,
          label: 'No',
          style: 4,
          custom_id: JSON.stringify({ id: obj.id, dId: obj.message?.user?.id, response: 'no' })
        }
      ]
    }]
  }
  return { msg2send: msg2send }
}
