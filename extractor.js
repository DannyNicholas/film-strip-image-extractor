#!/usr/bin/env node

const yargs = require('yargs')
const path = require('path')
const sharp = require('sharp')

const options = yargs
    .usage("Usage: --filePath <filePath> --directory <absolute-path-to-files>")
    .option("f", {alias: "filePath", describe: "path to image file from current location", type: "string", demandOption: true})
    .option("c", {alias: "count", describe: "count of output images to be split from original", type: "number", demandOption: true})
    .option("s", {alias: "scale", describe: "scaling factor to be applied to each image", type: "number", demandOption: false})
    .option("i", {alias: "interpolation", describe: "interpolation ('sharp' or 'smooth') when scaling", type: "string", demandOption: false})
    .argv

const dimensions = async (image) => {
    const metaData = await image.metadata()
    return {imageWidth: metaData.width, imageHeight: metaData.height}
}

const processFile = async () => {
    // retrieve file image details
    const imageFileName  = options.filePath
    const fileExtension = path.extname(imageFileName)
    const fileName = path.basename(imageFileName, fileExtension)
    const directory = path.dirname(imageFileName)

    // retrieve image dimensions
    const image = sharp(imageFileName)
    const {imageWidth, imageHeight} = await dimensions(image)
    console.log(`Supplied image: '${fileName}' has an original size of ${imageWidth} x ${imageHeight} pixels.`)

    // check image is completely divisible
    const imagesCount = options.count
    if (imageWidth % imagesCount !== 0) {
        console.log(`Supplied image: '${imageFileName}' has a total width of ${imageWidth} pixels that is not fully divisible by the wanted image count of ${imagesCount}.`)
        process.exit(1)
    }
    const width = imageWidth / imagesCount
    console.log(`Supplied image: '${fileName}' will be split into ${imagesCount} images each having an image size of ${width} x ${imageHeight} pixels.`)

    // check for a valid interpolation argument when scaling
    const {interpolation = 'smooth'} = options
    if (options.scale && interpolation !== 'smooth' && interpolation !== 'sharp') {
        console.log(`Supplied interpolation argument: '${interpolation}' is not supported when scaling. Valid values are 'smooth' (default) or 'sharp'`)
        process.exit(1)
    }
    let resizeWidth
    let resizeHeight
    let kernel
    if (options.scale) {
        resizeWidth = width * options.scale
        resizeHeight = imageHeight * options.scale
        kernel = interpolation === 'sharp' ? sharp.kernel.nearest : sharp.kernel.lanczos3
        console.log(`Each split image will be resized: ${resizeWidth} x ${resizeHeight} pixels using a scaling factor of ${options.scale} and interpolation of '${interpolation}'`)
    }
    
    // split images
    for (let i = 0; i < imagesCount; i++) {
        const outputImageFile = `${directory}/${fileName}-${i + 1}.png`
        let processedImage = sharp(imageFileName)
            .extract({ left: (i * width), top: 0, width: width, height: imageHeight })
        if (options.scale) {
            processedImage = processedImage
                .resize({width: resizeWidth, height: resizeHeight, kernel: kernel})
        }
        processedImage  
            .toFormat('png')
            .toFile(outputImageFile)
        console.log(`Created: ${outputImageFile}`)
    }
    console.log(`Finished`)
}

processFile()