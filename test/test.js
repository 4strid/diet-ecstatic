// this is not real unit testing, but I made some static websites and tested them
// in google chrome
//
// TODO: write real unit tests


const server = require('diet')
const Static = require('..')
const compatible = require('diet-connect')
const logger = require('morgan')

const app = server()

app.listen('http://localhost:7789')

const _static = Static({ path: app.path + '/static' })

const cuteDocsStatic = Static({ path: app.path + '/cutedocs' })

const statics = {
	simple: _static,
	cutedocs: cuteDocsStatic,
}

app.get('/DEBUG/:id', $ => {
	$.end(JSON.stringify(statics[$.params.id].dump()))
})


app.get('/MEM/:id', $ => {
	$.end('' + statics[$.params.id].memUsage())
})

app.footer(_static)
app.footer(cuteDocsStatic)
app.footer(compatible(logger('dev')))

