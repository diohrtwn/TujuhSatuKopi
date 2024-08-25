import React, { useState, useEffect } from "react";
import "./gallery-coffee.css";

const GalleryCoffee = () => {
    const images = [
      "gallery_1.jpg",
      "gallery_2.jpg",
      "gallery_3.jpg",
      "gallery_4.jpg",
      "gallery_5.jpg",
      "gallery_6.jpg",
      "gallery_7.jpg",
      "gallery_8.jpg",
      "gallery_9.jpg",
      "gallery_10.jpg",
      "gallery_11.jpg",
      "gallery_12.jpg",
    ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex(
      (currentImageIndex + 1) % Math.ceil(images.length / 3)
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (currentImageIndex - 1 + Math.ceil(images.length / 3)) %
        Math.ceil(images.length / 3)
    );
  };

  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    const startIndex = currentImageIndex * 3;
    const endIndex = startIndex + 3;
    setGalleryImages(images.slice(startIndex, endIndex));
  }, [currentImageIndex]);

  return (
    <section className="gallery">
      <span className="gallery-leadingtext">Gallery</span>
      <div className="gallery-container">
        <div className="gallery-images">
          {galleryImages.map((image, index) => (
            <div className="gallery-image-card" key={index}>
              <img
                src={`/img/${image}`}
                alt={`Coffee Gallery ${index + 1}`}
              />
            </div>
          ))}
        </div>
        <div className="gallery-controls">
          <button className="gallery-control prev" onClick={prevImage}>
            ‹
          </button>
          <button className="gallery-control next" onClick={nextImage}>
            ›
          </button>
        </div>
      </div>
    </section>
  );
};

export default GalleryCoffee;
