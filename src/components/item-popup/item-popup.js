import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../user-context/usercontext";
import { storeFirebase } from "../../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import "./item-popup.css";
import LocalDrinkOutlinedIcon from "@mui/icons-material/LocalDrinkOutlined";
import LocalDrinkTwoToneIcon from "@mui/icons-material/LocalDrinkTwoTone";

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

const ItemPopup = ({
  item,
  onClose,
  cart,
  setCart,
  showOverlay,
  setShowOverlay,
  showConfirmation, // Tambahkan ini
}) => {
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [cupSize, setCupSize] = useState("Regular");
  const navigate = useNavigate();
  const { user } = useUserContext();

  useEffect(() => {
    const fetchCart = async () => {
      if (user && user.uid) {
        const userCartRef = doc(storeFirebase, "carts", user.uid);
        const cartSnapshot = await getDoc(userCartRef);
        if (cartSnapshot.exists()) {
          const cartData = cartSnapshot.data().cart;
          const itemsCount = Object.values(cartData).reduce(
            (acc, curr) => acc + curr.quantity,
            0
          );
          const priceCount = Object.values(cartData).reduce(
            (acc, curr) => acc + curr.total,
            0
          );
          setTotalItems(itemsCount);
          setTotalPrice(priceCount);
          setShowOverlay(true); // Tampilkan pop-up konfirmasi
        }
      }
    };

    fetchCart();
  }, [user, setShowOverlay]);

  useEffect(() => {
    setQuantity(1);
  }, [item]);

  if (!item) return null;

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleUpdateCart = async () => {
    if (user && user.uid) {
      const userCartRef = doc(storeFirebase, "carts", user.uid);
      const cartSnapshot = await getDoc(userCartRef);
      let currentCart = cartSnapshot.exists() ? cartSnapshot.data().cart : {};

      const itemKey = `${item.id}_${cupSize}_${
        instructions || "No Instructions"
      }`;

      const price = item.promo || item.price;
      const adjustedPrice =
        cupSize === "Large" ? Number(price) + 3000 : Number(price);

      if (currentCart[itemKey]) {
        currentCart[itemKey].quantity += quantity;
        currentCart[itemKey].total =
          (currentCart[itemKey].total || 0) + adjustedPrice * quantity;
      } else {
        currentCart[itemKey] = {
          quantity,
          total: adjustedPrice * quantity,
          instructions: instructions || "No Instructions",
          cupSize: cupSize,
          imageUrl: item.imageUrl, // Tambahkan field imageUrl
          name: item.name, // Tambahkan field name
        };
      }

      const newTotalPrice = Object.values(currentCart).reduce(
        (total, cartItem) => total + (cartItem.total || 0),
        0
      );

      // Update keranjang di Firestore
      await setDoc(
        userCartRef,
        { cart: currentCart, totalPrice: newTotalPrice },
        { merge: true }
      );

      setTotalPrice(newTotalPrice);
      setTotalItems(
        Object.values(currentCart).reduce((acc, curr) => acc + curr.quantity, 0)
      );

      setCart(currentCart);

      // Tutup overlay popup setelah update selesai
      setShowOverlay(false);
    }
  };

  const handleGoToOrder = () => {
    navigate("/checkout");
  };

  return (
    <>
      {/* Overlay popup item */}
      {showOverlay && item && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-button" onClick={onClose}>
              ×
            </button>
            <img src={item.imageUrl} alt={item.name} className="popup-image" />
            <h2 className="popup-title">{item.name}</h2>
            <p className="popup-description">{item.description}</p>
            <hr className="popup-divider" />

            <div className="cup-size-container">
              <div className="cup-size-selector">
                <label
                  className={`cup-size-option ${
                    cupSize === "Regular" ? "selected" : ""
                  }`}
                  onClick={() => setCupSize("Regular")}
                >
                  <LocalDrinkOutlinedIcon fontSize="large" />
                  Regular
                </label>
                <label
                  className={`cup-size-option ${
                    cupSize === "Large" ? "selected" : ""
                  }`}
                  onClick={() => setCupSize("Large")}
                >
                  <LocalDrinkTwoToneIcon fontSize="large" />
                  Large
                </label>
              </div>
            </div>

            <label
              htmlFor="special-instructions"
              className="instructions-label"
            >
              Instruksi Khusus (Nggak wajib diisi)
            </label>
            <input
              type="text"
              id="special-instructions"
              className="instructions-input"
              placeholder="Contoh: banyakin porsinya, ya"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />

            <div className="quantity-selector">
              <button className="quantity-button" onClick={handleDecrease}>
                -
              </button>
              <span className="quantity-display">{quantity}</span>
              <button className="quantity-button" onClick={handleIncrease}>
                +
              </button>
            </div>

            <button className="update-button" onClick={handleUpdateCart}>
              Update Keranjang -{" "}
              {formatRupiah(
                (item.promo || item.price) * quantity +
                  (cupSize === "Large" ? 3000 * quantity : 0)
              )}
            </button>
          </div>
        </div>
      )}

      {/* Popup Konfirmasi (di luar popup-overlay) */}
      {totalItems > 0 && (
        <div className="confirmation-popup" onClick={handleGoToOrder}>
          <div className="confirmation-content">
            <span className="confirmation-text">
              {totalItems} item{totalItems > 1 ? "s" : ""} - TujuhSatuKopi,
              Gondrong
            </span>
            <span className="confirmation-price">
              {formatRupiah(totalPrice)}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default ItemPopup;
