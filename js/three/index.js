
import { addPassiveEventListener } from 'phat-kitty-js/functions';
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

    return three.load(src).then(obj => {

        const cancelResize = addPassiveEventListener(window, 'resize', resize);

        sync.render(render, true);

        resize();

        three.resetCamera();
        three.compose();

        return Object.assign({ three, obj, resize }, {
            cancel : () => ( cancelSync.render(render), cancelResize() )
        });
        
    });

}