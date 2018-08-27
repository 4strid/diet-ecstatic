const src = `const YellowSquare = () => (
	<fill-rect color="yellow"/>
)

Cute.attach(
	<YellowSquare w={75} h={75} x={25} y={25}/>,
	document.querySelector('.cute-app'),
	400,
	300
)
`

const editor = document.querySelector('.src pre code')
editor.innerText = src
editor.addEventListener('input', compile)
editor.addEventListener('keydown', insertTab)
editor.contentEditable = true

let app = null

compile({target: { innerText: src }})

function insertTab (evt) {
	console.log(evt)
	if (evt.key === 'Tab') {
		evt.preventDefault()
		document.execCommand('insertHTML', false, '&#009')
	}
	return false
}

function compile (evt) {
	const src = evt.target.innerText

	const compiled = Babel.transform(src, {
		presets: ['es2015'],
		plugins: [[
			'transform-react-jsx', {
				'pragma': 'Cute.createElement',
			},
		],
		'transform-object-rest-spread',
		],
	}).code

	document.querySelector('.cute-app').innerHTML = ''

	app = eval(compiled)
}
