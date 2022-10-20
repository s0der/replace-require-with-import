#!/usr/bin/env node

const FS     = require('fs')
const globby = require('globby')
const r1     = /^(let|var|const) +([\w_$]+) += +(require)\((('|")[\w-_./@]+('|"))\)/gm // const createStore = require('redux')
const r2     = /^(let|var|const) +([\w_$]+) += +(require)\((('|")[\w-_./@]+('|"))\)\.(\w+)/gm // const createStore = require('redux').createStore
const r3     = /^(let|var|const) (\{\s([\w_$]?,?\s*[\w_$]+)+\s*\}) += +(require)\((('|")[\w-_./@]+('|"))\)/gm // const { test, test2 } = require('test')

const args = process.argv.slice(2)

if (!args.length) {
  console.error('Please pass a directory glob to "replace-require-with-import"\n')
  process.exit(1)
}

const paths = globby.sync(args)

paths.forEach(function (p) {
  if (!FS.statSync(p).isDirectory()) {
    return replaceInFile(p)
  }
})

function replaceInFile(fp) {
  const result = FS.writeFileSync(fp, FS.readFileSync(fp, 'utf-8')
    .replace(r3, `import $2 from $5`)
    .replace(r2, `import { $7 as $2 } from $4`)
    .replace(r1, `import $2 from $4`), 'utf-8')
  console.log(`> ${fp}`)
  return result
}

console.info('Done!\n')
