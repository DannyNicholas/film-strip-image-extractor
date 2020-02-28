#!/usr/bin/env node

const yargs = require('yargs')
const path = require('path')
const fs = require('fs')
var sharp = require('sharp')

const options = yargs
    .usage("Usage: --filePath <filePath> --directory <absolute-path-to-files>")
    .option("f", {alias: "filePath", describe: "path to image file from current location", type: "string", demandOption: true})
    .option("c", {alias: "count", describe: "count of output images to be split from original", type: "string", demandOption: true})
    .option("s", {alias: "scale", describe: "relative scaling to be applied to each image", type: "string", demandOption: false})
    .option("i", {alias: "interpolation", describe: "interpolation kernel ('sharp' or 'smooth')", type: "string", demandOption: false})
    .argv

const imageSplitter = (filmStripImage, left, top, width, height) => {
    sharp(filmStripImage)
        .extract({ left: left, top: top, width: width, height: height })
        .toFile('output.png')
}

const metadata = async (image) => image.metadata()
// const hello = async (image) => await metdata(image)

const width = async (image) => {
    return await metadata(image).width
}
const height = async (image) => {
    return await metadata(image).height
}
const imageMetaData = async (image) => {
    return await image.metadata()
}
// const image = sharp('spr439687-32-01.752.png')

// image.metadata().then((metadata) => {
//     console.log(metadata)
// })

// const hello = async (image) => await metdata(image)

// const data =  await metdata(image)
const dimensions = async (image) => {
    // const image = sharp('spr439687-32-01.752.png')
    const metaData = await imageMetaData(image)
    // console.log(metaData)
    // console.log(metaData.width)
    // console.log(metaData.height)
    // console.log(await imageMetaData(image))
    // console.log(await width(image))
    // console.log(await height(image))
    return {width: metaData.width, height: metaData.height}
}
// console.log(width(image))
// console.log(height(image))

const processFile = async () => {
    const imageFileName  = options.filePath

    // retrieve image dimensions
    const image = sharp(imageFileName)
    const dim = await dimensions(image)
    const imageWidth = dim.width
    const imageHeight = dim.height

    // const width = 12
    const imagesCount = options.count

    // check image is completely divisible
    if (imageWidth % imagesCount !== 0) {
        console.log(`Supplied image: '${imageFileName}' has a total width of ${imageWidth} pixels that is not fully divisible by the wanted image count of ${imagesCount}.`)
        process.exit(1)
    }

    const fileExtension = path.extname(imageFileName)
    const fileName = path.basename(imageFileName, fileExtension)
    const directory = path.dirname(imageFileName)
    console.log(directory)

    const width = imageWidth / imagesCount
    console.log(`Supplied image: '${fileName}' will be split into ${imagesCount} images each having an image width of ${width} pixels.`)

    const resizeWidth = width * options.scale
    const resizeHeight = imageHeight * options.scale
    console.log(`Resize: ${resizeWidth}  ${resizeHeight}`)


    for (let i = 0; i < imagesCount; i++) {
        const outputImageFile = `${directory}/${fileName}-${i + 1}.png`
        sharp(imageFileName)
            .extract({ left: (i * width), top: 0, width: width, height: imageHeight })
    //.resize({width: 48, height: 48, kernel: sharp.kernel.nearest})
        .resize({width: resizeWidth, height: resizeHeight, kernel: sharp.kernel.lanczos3})
        .toFormat('png')
        .toFile(outputImageFile)
        console.log(outputImageFile)
    }
    console.log(`Finished`)
}

processFile()


// sharp('spr439687-32-01.752.png')
//     .extract({ left: 0, top: 0, width: 12, height: 12 })
//     //.resize({width: 48, height: 48, kernel: sharp.kernel.nearest})
//     .resize({width: 48, height: 48, kernel: sharp.kernel.lanczos3})
//     .toFile('output1.png')