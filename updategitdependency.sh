#!/bin/bash
echo updating webimg
npm i --package-lock-only github:c3pobot/webimg
echo updating statcalc
npm i --package-lock-only github:/c3pobot/statcalc
echo updating logger
npm i --package-lock-only github:/c3pobot/logger
echo updating mongoclient
npm i --package-lock-only github:/c3pobot/mongoclient
