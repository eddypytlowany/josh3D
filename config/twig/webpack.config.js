
const HTMLWebpackPlugin     = require('html-webpack-plugin');
const YAML                  = require('yaml');
const TWIG                  = require('twig');
const { merge }             = require('webpack-merge');
const { globSync }          = require('glob');
const { readFileSync }      = require('fs');
const { resolve, dirname }  = require('path');

module.exports = (local, project) => {

    const twigIndex = resolve(project.src, project.entry.replace(/\.js$/, '.twig'));

    TWIG.cache(false);

    return merge(local, {
        module          : {
            rules   : [
                {
                    resource    : twigIndex, 
                    loader      : 'html-loader',
                    options     : {
                        preprocessor(data, loader) {

                            const { resource : path } = loader;
                            const contextPath = resolve(project.src, 'data.yml');

                            globSync('**/*.twig', {
                                cwd         : project.src,
                                nodir       : true,
                                ignore      : twigIndex,
                                absolute    : true
                            }).forEach( file => void loader.addDependency(file) );

                            loader.addDependency(contextPath);

                            return TWIG.twig({ data, path }).render( YAML.parse( readFileSync(contextPath, 'utf8') ) );

                        }
                    }
                },
                {
                    test    : /\.ya?ml$/,
                    loader  : 'yaml-loader'
                },
                {
                    test    : /\.twig$/,
                    loader  : ['twig-loader', 'extract-loader', 'html-loader'],
                    exclude : twigIndex
                }
            ]
        },
        plugins         : [
            new HTMLWebpackPlugin({
                minify          : false,
                favicon         : '',
                template        : twigIndex,
                filename        : resolve(dirname(project.dist), 'index.html'),
                scriptLoading   : 'defer',
            })
        ]
    });

}