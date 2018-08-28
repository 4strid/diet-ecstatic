# diet-ecstatic
Static middleware for breezily deploying static content in Diet.js

## Why choose diet-ecstatic?

- diet-static is currently broken due to the mime 2.0 update
- friendly page URLs thanks to autoindexing and default .html extension
- caches small files in memory for maximum efficiency
- name is a cute pun

## Usage

Create the middleware by passing an options object to `ecstatic`

```javascript
const server = require('diet')
const ecstatic = require('diet-ecstatic')

const app = server()

app.listen('http://localhost:7777')

app.footer(ecstatic({path: app.path + '/static'}))
```

The only required option is `path` which specifies which directory to serve files from.

Constructs a table of all files in supplied `path` directory and watches the directory for changes. The middleware
will serve any requested file that matches a path found in the table. Note that '/static' will not necessarily be
part of the requested file path, rather, it will be relative to the root of your application.

```
localhost:7777/favicon.ico       -->  /path/to/app/static/favicon.ico
localhost:7777/assets/script.js  -->  /path/to/app/static/assets/script.js
localhost:7777                   -->  /path/to/app/static/index.html
localhost:7777/about             -->  /path/to/app/static/about.html
```
## Options

### `opts.path`

The absolute path to your static files directory

### `opts.expires`

The number of milliseconds after serving after which the file should expire and shoud be requested again.

Defaults to one day.

### `opts.maxCachedSize`

The maximum size in bytes for a file to be cached in memory.

Defaults to 50kb. Set to 0 to disable in-memory caching.

### `opts.gzip`

Whether or not to gzip files before serving. (Only text files are gzipped, images and other media are sent as-is).

Defaults to true.

### `opts.autoindex`

Whether or not to serve `*/index.html` when the root of a directory is requested.

Defaults to true.

### `opts.defaultExtension`

The default extension to append to files when no file extension is provided.

Defaults to '.html'. Set to `false` to disable this feature.

## Contact

Bug reports, feature requests, and other questions are all welcome: open a GitHub issue and I'll get back to you.
