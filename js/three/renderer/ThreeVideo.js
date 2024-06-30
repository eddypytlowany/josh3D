
import { VideoTexture, LinearFilter, Sprite, SpriteMaterial } from "three";
import Three2D from "./Three2D";

export class ThreeVideo extends Three2D {

    load(video) {

        return new Promise(resolve => {

            const map = new VideoTexture(video);
    
            map.minFilter = LinearFilter;
            map.magFilter = LinearFilter;
            
            video.addEventListener('timeupdate', () => {
                
                const sprite = new Sprite( new SpriteMaterial({ map }) );

                sprite.name = 'video';

                this.scene.add(sprite);
                
                resolve(video);

            }, {
                once    : true,
                passive : true
            });

        });

    }

}

export default ThreeVideo;