'use strict'
module.exports = [
  {
    $project: {
      date: 1,
      mode: 1,
      matchResult: {
        $map: {
          input: '$matchResult',
          as: 'match',
          in: {
            matchId: '$$match.matchId',
            home: '$$match.home',
            away: '$$match.away',

            attackResult: {
              $reduce: {
                input: '$$match.attackResult',
                initialValue: [],
                in: {
                  $concatArrays: [ '$$value', '$$this.duelResult']
                }
              }
            },
            defenseResult: {
              $reduce: {
                input: '$$match.defenseResult',
                initialValue: [],
                in: {
                  $concatArrays: [ '$$value', '$$this.duelResult']
                }
              }
            }
          }
        }
      }
    }
  }
]
