
import { Box3, MathUtils } from 'three';

export function calcCameraOffset(camera, sceneWidth, sceneHeight) {

    return Math.max(camera.getFilmHeight()/camera.getFilmWidth() * sceneWidth, sceneHeight) / 2 / Math.tan( MathUtils.degToRad(camera.getEffectiveFOV()/2) );

}

export function getObjectBoundingBox(obj) {

    const bounds = new Box3();

    obj.traverseVisible(child => {

        if(child.isMesh) {

            child.boundingBox || child.computeBoundingBox?.();

            bounds.expandByObject(child);

        }

    });

    return bounds;

}