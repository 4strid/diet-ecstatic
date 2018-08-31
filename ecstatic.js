const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const readFile = promisify(fs.readFile)

const chokidar = require('chokidar')
const mime = require('mime')
const gzip = promisify(require('zlib').gzip)
const gzipStream = require('zlib').createGzip

function Static (opts) {
	const staticRoot = opts.path
	const fileTable = {}
	const maxCachedSize = opts.maxCachedSize || 1024 * 100
	//const expirationOffset = opts.expires || 1000 * 60 * 60 * 24 * 7
	const expirationOffset = opts.expires || 10
	
	const watcher = chokidar.watch(staticRoot)

	watcher.on('add', addFile)
	watcher.on('change', addFile)
	watcher.on('unlink', rmFile)

	const gzipTypes = {
		'text/plain': true,
		'text/html': true,
		'text/xml': true,
		'text/css': true,
		'application/xml': true,
		'application/xhtml+xml': true,
		'application/rss+xml': true,
		'application/javascript': true,
		'application/x-javascript': true,
	}

	async function addFile (filepath, stats) {
		const _path = getStaticPath(staticRoot, filepath)
		const mimeType = mime.getType(filepath)
		const extension = path.extname(filepath)
		const basename = path.basename(filepath)

		const shouldGzip = opts.gzip !== false && stats.size > 1400 && gzipTypes[mimeType]

		const file = {
			file: filepath,
			modified: stats.mtime,
			mimeType,
			gzip: shouldGzip,
		}

		if (stats.size <= maxCachedSize) {
			try {
				file.cached = await getFile(file.file, file.gzip)
			} catch (err) {
				console.error(err)
			}
		}

		if (basename === 'index.html') {
			const dirname = path.dirname(filepath)
			const _path = getStaticPath(staticRoot, dirname)
			fileTable[_path] = file
		}

		if (extension === '.html') {
			const dirname = path.dirname(filepath)
			const basename = path.basename(filepath, '.html')
			const _path = getStaticPath(staticRoot, dirname) + basename
			fileTable[_path] = file
		}

		fileTable[_path] = file
	}

	function rmFile (filepath) {
		const _path = getStaticPath(staticRoot, filepath)
		fileTable[_path] = undefined
	}

	const middleware = function serve ($) {
		const requested = $.url.pathname
		const file = fileTable[requested]

		if (file !== undefined) {
			$.header('Content-Type', file.mimeType)
			$.header('Last-Modified', file.modified.toUTCString())
			$.header('Expires', new Date(new Date().getTime() + expirationOffset).toUTCString())
			$.header('Cache-Control', 'public')

			const modifiedSince = $.headers['if-modified-since']
			// add 1 second to account for rounding
			if (modifiedSince === undefined || getTime(modifiedSince) + 1000 < getTime(file.modified)) {
				const shouldGzip = $.headers['accept-encoding'] && $.headers['accept-encoding']
					.split(',')
					.some(x => ['*', 'gzip'].includes(x.trim()))
					&& file.gzip
				if (shouldGzip) {
					$.header('Content-Encoding', 'gzip')
					$.header('Vary', 'Content-Encoding')
				}
				if (file.cached && (!!shouldGzip === !!file.gzip)) {
					$.response.end(file.cached)
					$.responded = true
					$.return()
				} else {
					const stream = fs.createReadStream(file.file)
					if (shouldGzip) {
						stream.pipe(gzipStream()).pipe($.response)
					} else {
						stream.pipe($.response)
					}
					stream.on('error', err => {
						throw err
					})
				}
			} else {
				$.status(304)
				$.end()
				$.return
			}
		} else {
			$.return()
		}
	}

	middleware.dump = () => fileTable
	middleware.memUsage = () => Object.values(fileTable).reduce((sum, file) => sum + (file.cached ? file.cached.length : 0), 0)

	return middleware
}

function getStaticPath (root, _path) {
	return '/' + path.relative(root, _path).replace(/\\/g, '/')
}

// throws if it encounters an error
async function getFile (filepath, shouldGzip) {
	let data = await readFile(filepath)
	if (shouldGzip) {
		data = await gzip(data)
	}
	return data
}

function getTime (date) {
	return new Date(date).getTime()
}

module.exports = Static
