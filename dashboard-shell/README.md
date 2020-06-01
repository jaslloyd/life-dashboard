# Dashboard Shell

This is the application shell, this application will pull in all the other applications. This will be the homepage for the application, the idea will be each dashboard application will be its own separate application that at run-time dashboard will fetch all the remote applications and serve them up.

Module Federation allows us to accomplish the above!

## Next Steps

Webpack Dev server / Way CRA does it
Webpack build like CRA

## Webpack Notes

webpack.config.js - devServer
webpack-dev-server doesn't write any output files after compiling. Instead, it keeps bundle files in memory and serves them as if they were real files mounted at the server's root path. If your page expects to find the bundle files on a different path, you can change this with the publicPath option in the dev server's configuration.
