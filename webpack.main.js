
const twig_config   = require('./config/twig/webpack.config');
const three_config  = require('./config/three/webpack.config');

/**
 * The Local webpack config file that will merge with the globally generated config object.
 * Properties defined in the returned object will override the default configuration.
 * @param {string} mode - The build mode that the webpack compiler is running in.
 * @param {object} config - The config object that the returned object will be merged with.
 * @param {object} project - The project config object retrieved by from the project's root directory and parsed by phat-kitty.
 * @param {object} phat - Phat Kitty's config object.
 * @returns {object} The configuration to merge with the global webpack config object.
 */
module.exports = (mode, config, project, phat) => {

    let local = {
        entry           : {
            /*
             * Add entry js files to bundle with webpack,
             * where the object key is the output name (will create a [output].js file in the dist directory),
             * and the value is the path to entry js relative to the src directory
             */
            'main' : [project.entry, 'style.scss']
        },
        optimization    : {
            splitChunks : {
                /* Valid values are 'all', 'async', and 'initial'. */
                chunks  : 'all'
            }
        }
    };

    local = twig_config(local, project);
    local = three_config(local, mode, project);

    // Add config modifiers here
    return local;

}