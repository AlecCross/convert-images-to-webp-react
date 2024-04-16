import { useState } from 'react';
import styles from './convert.module.css';

const TabbedImages = ({ images, resolutions }) => {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabClick = (index) => {
        setActiveTab(index);
    };

    const saveImagesSequentially = async () => {
        for (let i = 0; i < images.length; i++) {
            const link = document.createElement('a');
            link.href = images[i];
            link.download = `image-${resolutions[i]}p.webp`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Затримка між збереженням кожного зображення (1 секунда)
        }
    };

    const saveImage = () => {
        const link = document.createElement('a');
        link.href = images[activeTab];
        link.download = `image-${resolutions[activeTab]}p.webp`; // Назва файлу з роздільною здатністю
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={styles.tabbedImages}>
            <div className={styles.tabs}>
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={`${styles.tab} ${activeTab === index ? styles.active : ''}`}
                        onClick={() => handleTabClick(index)}
                    >
                        {`${resolutions[index]}p`}
                    </div>
                ))}
            </div>
            <div className={styles.imageContainer}>
                {images.length > 0 && (
                    <div className={styles.imageWrapper}>
                        <img src={images[activeTab]} alt={`Image ${activeTab}`} style={{ width: "256px" }} />
                    </div>
                )}
            </div>
            <button onClick={saveImagesSequentially}>Save Images Sequentially</button>
            <button onClick={saveImage}>Save Image</button>
        </div>
    );
};


const ConvertImage = () => {
    const [originalImageSrc, setOriginalImageSrc] = useState('');
    const [webpImages, setWebpImages] = useState([]);
    const [resolutions, setResolutions] = useState([]);

    const convertImage = async (event) => {
        if (event.target.files.length > 0) {
            const src = URL.createObjectURL(event.target.files[0]);
            setOriginalImageSrc(src);

            const image = new Image();
            image.src = src;
            image.onload = async () => {
                const availableResolutions = [256, 384, 512, 640, 750, 828, 1080, 1200, 1920, 2048, 3840]; // Add your desired resolutions here
                const resolutions = availableResolutions.filter(resolution => image.width >= resolution); // Filter resolutions that are supported by the original image
                const webpImages = await Promise.all(resolutions.map(async (resolution) => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const ratio = image.width / image.height;
                    const height = Math.round(resolution / ratio); // Calculating height based on aspect ratio
                    canvas.width = resolution;
                    canvas.height = height;
                    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                    const webpData = canvas.toDataURL('image/webp', 0.5);
                    return webpData;
                }));
                setWebpImages(webpImages);
                setResolutions(resolutions);
            };
        }
    };

    return (
        <div>
            <span>Convert image to Webp format</span>
            <div>
                <input
                    type="file"
                    accept="image/*"
                    name="convert"
                    id="userImage"
                    onChange={convertImage}
                />
            </div>
            {/* <div >
                <h2>Original Image</h2>
                {originalImageSrc && <img style={{width:256}} src={originalImageSrc} alt="Original" />}
            </div> */}
            <div>
                {webpImages.length > 0 && (
                    <TabbedImages images={webpImages} resolutions={resolutions} />
                )}
            </div>
        </div>
    );
};

export default ConvertImage;
