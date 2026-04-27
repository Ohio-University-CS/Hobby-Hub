// For cropping the image to handle resizing the user's upload.
export default async function getCroppedImage(imageSrc: string, pixelCrop: any): Promise<Blob> {
    const image = new Image();
    image.src = imageSrc;

    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const targetSize = 128;
    canvas.width = targetSize;
    canvas.height = targetSize;

    if(!ctx) throw new Error("No Context");

    ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y,
        pixelCrop.width, pixelCrop.height,
        0,0, 
        targetSize, targetSize
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            if(blob) resolve(blob);
        }, "image/jpeg", 0.8);
    });
};