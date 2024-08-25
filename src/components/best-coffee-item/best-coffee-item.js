// best-coffee-item.js
import "./best-coffee-item.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { storeFirebase as db } from "../../firebaseConfig"; // Import storeFirebase as db
import { doc, getDoc } from "firebase/firestore";

const BestCoffeeItem = ({ itemId }) => {
  const [itemData, setItemData] = useState(null);

  // Format Rupiah tanpa ,00
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(number)
      .replace("Rp", "Rp ");
  };

  useEffect(() => {
    const fetchItemData = async () => {
      const docRef = doc(db, "menu", itemId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setItemData(docSnap.data());
      } else {
        console.error("Dokumen tidak ditemukan!");
      }
    };

    fetchItemData();
  }, [itemId]); // Jalankan useEffect saat itemId berubah

  if (!itemData) {
    return <div>Loading...</div>; // Tampilkan loading jika data belum ada
  }

  const { name, price, imageUrl, promo, description } = itemData;

  return (
    <div className="best-item">
      {promo && <div className="promo-label">Promo</div>}
      <img src={imageUrl} alt={name} className="item-image" />
      <h2>{name}</h2>
      {promo ? (
        <p className="item-price">
          <span className="original-price">{formatRupiah(price)}</span>{" "}
          {formatRupiah(promo)}
        </p>
      ) : (
        <p className="item-price">{formatRupiah(price)}</p>
      )}
      <p>{description}</p>
      <Link to="/menu-order" className="add-button">
        Order Now
      </Link>
    </div>
  );
};

export default BestCoffeeItem;
