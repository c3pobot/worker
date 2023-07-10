'use strict'
module.exports = {
  9: {
    name: 'Grand Arena',
    filter: (x=>x.omicronMode == 9 || x.omicronMode == 14 || x.omicronMode == 15)
  },
  7: {
    name: 'Territory Battle',
    filter: (x=>x.omicronMode == 7 || x.omicronMode == 5 || x.omicronMode == 6)
  }
}
