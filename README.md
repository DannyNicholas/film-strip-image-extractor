# film-strip-image-extractor

Node script that extracts a film-strip of equally sized images (such as the image below) into separate PNG image files.

![Image description](./image-filmstrip/example-1.png)

This can be useful for some animation packages that export animated images as a film-strip of sprites.

### Install with Node Package Manager

```
npm install
```

### Run with Node

The script supports the following parameters:

`filePath` - **mandatory** relative path to film-strip image file containing your images to be split.

`count` - **mandatory** number of images contained in this film-strip (images must all be of equal size).

`scale` - **optional** re-size scaling factor to apply to the split images (omit to keep the existing image size)

`interpolation` - **optional** determines the algorithm used if image is being re-sized ('sharp' or 'smooth'). Defaults to 'smooth' if not provided. This parameter has no effect if no `scale` has been supplied.

Example use:

```
node extractor.js
    --filePath .\image-filmstrip\example-1.png
    --count 6
    --scale 4
    --interpolation smooth
```

The above command will process the image file `example-1.png`. This file will be split into 6 images. Each image will be scaled by a factor of 4 using the 'smooth' algorithm.


### Run from command line

```
./extractor.js --filePath .\image-filmstrip\example-1.png --count 6
```

### Image Processing

The image processing algorithms in this script use the [Sharp](https://sharp.pixelplumbing.com/) image processing library.

