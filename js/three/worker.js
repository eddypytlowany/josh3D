
function applyAlphaMatte(image) {

    let pixel;

    for(let i = 0; i < image.data.length; i += 4) {

        pixel = image.data[i] + image.data[i + 1] + image.data[i + 2];

        if(pixel < 255) {

            image.data[i + 3] = pixel;

        }

    }

    return image;

}

onmessage = function({data}) {

    this.postMessage(data);

}