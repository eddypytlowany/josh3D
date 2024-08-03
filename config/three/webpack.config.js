
// const CopyPlugin        = require('copy-webpack-plugin');
const { DefinePlugin }  = require('webpack');
const { resolve }       = require('path');
const { merge }         = require('webpack-merge');

/**
 * The Local webpack config file that will merge with the globally generated config object.
 * Properties defined in the returned object will override the default configuration.
 * @param {string} mode - The build mode that the webpack compiler is running in.
 * @param {object} config - The config object that the returned object will be merged with.
 * @param {object} project - The project config object retrieved by from the project's root directory and parsed by phat-kitty.
 * @param {object} phat - Phat Kitty's config object.
 * @returns {object} The configuration to merge with the global webpack config object.
 */
module.exports = (local, mode, project) => {

    const THREE_DEBUG   = mode === 'd';
    // const draco_path    = resolve(project.src, 'lib/three/examples/js/libs');

    local = merge(local, {
        module          : {
            rules   : [
                {
                    test    : /\.gl(tf|b)$/,
                    loader  : 'file-loader',
                    options : {
                        name        : '[path][name].[ext]',
                        esModule    : false
                    }
                }
            ]
        },
        plugins         : [
            new DefinePlugin({ THREE_DEBUG }),
            // new CopyPlugin({
            //     patterns  : [
            //         resolve(project.src, './gltf/**/*.{jpg,jpeg,png,bin}'),
            //         {
            //             from    : resolve(draco_path, 'draco/**/*'),
            //             to      : ({ absoluteFilename }) => relative(draco_path, absoluteFilename)
            //         }
            //     ]
            // })
        ]
    });

    if(THREE_DEBUG) {

        local = merge(local, {
            resolve         : {
                alias   : {
                    'js/three$' : resolve(project.src, 'js/three/dev.js')
                }
            }
        })

    }

    // Add config modifiers here
    return local;

}
