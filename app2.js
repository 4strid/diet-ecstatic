const path = require('path')

const server = require('diet')
const Static = require('diet-static')
const compatible = require('diet-connect')
const logger = require('morgan')

const app = server()

app.listen('http://localhost:7791')

const _static = Static({ path: path.resolve(__dirname, 'test/static') })

const cuteDocsStatic = Static({ path: path.resolve(__dirname, 'test/cutedocs') })

app.footer(_static)
app.footer(cuteDocsStatic)
app.footer(compatible(logger('dev')))

