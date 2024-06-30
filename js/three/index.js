
import media from 'phat-kitty-js/media-query';
import sync, { cancelSync } from 'framesync';

export function initThree(three, src) {

    function resize() {

        three.setSize(three.el.clientWidth, three.el.clientHeight);
        three.updateCamera();
    
    }
    
    function render() {
    
        three.render();
        three.draw();
    
    }

    // three.setQuality(.5);

    return three.load(src).then(obj => {

        media.on('0:three', resize);

        sync.render(render, true);

        three.resetCamera();
        three.compose();

        return Object.assign({ three, obj, resize }, {
            cancel : () => void cancelSync.render(render)
        });
        
    });

}