import React, { useEffect, useState } from "react";
import { storeFirebase } from "../../firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import ItemPopup from "../item-popup/item-popup";
import "./item-list.css";
import { useUserContext } from "../user-context/usercontext";
import { useNavigate } from "react-router-dom";

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

const ItemList = () => {
  const { user } = useUserContext();
  const [drinks, setDrinks] = useState([]);
  const [meals, setMeals] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [cart, setCart] = useState({});
  const [showOverlay, setShowOverlay] = useState(false);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const navigate = useNavigate(); // Tambahkan ini untuk navigasi

  useEffect(() => {
    const fetchItems = async () => {
      const drinksSnapshot = await getDocs(collection(storeFirebase, "menu"));
      const mealsSnapshot = await getDocs(collection(storeFirebase, "meal"));
      const drinksData = drinksSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      const mealsData = mealsSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setDrinks(drinksData);
      setMeals(mealsData);
    };

    fetchItems();
  }, []);

  useEffect(() => {
    let unsubscribe;

    if (user && user.uid) {
      const userCartRef = doc(storeFirebase, "carts", user.uid);
      unsubscribe = onSnapshot(userCartRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const cartData = docSnapshot.data().cart;
          setCart(cartData);
          setShowConfirmation(Object.keys(cartData).length > 0);

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
        } else {
          setCart({});
          setShowConfirmation(false);
        }
        setIsLoadingCart(false); // Data keranjang selesai dimuat
      });
    } else {
      // Handle ketika user belum login
      setIsLoadingCart(false);
      setShowConfirmation(false);
    }

    return () => unsubscribe && unsubscribe();
  }, [user, user?.uid]);

  const handleAddButtonClick = (item) => {
    setShowOverlay(true);
    setSelectedItem(item);
  };

  const handleClosePopup = () => {
    setSelectedItem(null);
    setShowOverlay(false);
  };

  const handleUpdateCart = async (updatedCart) => {
    setCart(updatedCart);
    if (user && user.uid) {
      const userCartRef = doc(storeFirebase, "carts", user.uid);
      await setDoc(userCartRef, { cart: updatedCart }, { merge: true });
    }
  };

  const getTotalQuantityForItem = (itemId) => {
    return Object.entries(cart).reduce((acc, [itemKey, cartItem]) => {
      if (itemKey.startsWith(`${itemId}_`)) {
        return acc + cartItem.quantity;
      }
      return acc;
    }, 0);
  };

  const handleGoToOrder = () => {
    navigate("/checkout");
  };

  return (
    <div className="item-list">
      <h1>Drinks</h1>
      <p>
        Segarkan harimu dengan minuman spesial pilihan dari TujuhSatuKopi.
        Temukan rasa favoritmu!
      </p>
      <div className="items">
        {drinks.map((item) => (
          <div key={item.id} className="item-card">
            {item.promo && <div className="promo-label">Promo</div>}
            <img src={item.imageUrl} alt={item.name} className="item-image" />
            <h2>{item.name}</h2>
            {item.promo ? (
              <p className="item-price">
                <span className="original-price">
                  {formatRupiah(item.price)}
                </span>{" "}
                {formatRupiah(item.promo)}
              </p>
            ) : (
              <p className="item-price">{formatRupiah(item.price)}</p>
            )}
            <p>{item.description}</p>
            <button
              className="add-button"
              onClick={() => handleAddButtonClick(item)}
            >
              {getTotalQuantityForItem(item.id) > 0
                ? `${getTotalQuantityForItem(item.id)} menu`
                : "Tambah"}
            </button>
          </div>
        ))}
      </div>

      <h1>Meals</h1>
      <p>
        Lengkapi harimu dengan kelezatan hidangan dari TujuhSatuKopi. Pilihan
        tepat untuk menemani waktu bersantai Anda.
      </p>
      <div className="items">
        {meals.map((item) => (
          <div key={item.id} className="item-card">
            {item.promo && <div className="promo-label">Promo</div>}
            <img src={item.imageUrl} alt={item.name} className="item-image" />
            <h2>{item.name}</h2>
            {item.promo ? (
              <p className="item-price">
                <span className="original-price">
                  {formatRupiah(item.price)}
                </span>{" "}
                {formatRupiah(item.promo)}
              </p>
            ) : (
              <p className="item-price">{formatRupiah(item.price)}</p>
            )}
            <p>{item.description}</p>
            <button
              className="add-button"
              onClick={() => handleAddButtonClick(item)}
            >
              {getTotalQuantityForItem(item.id) > 0
                ? `${getTotalQuantityForItem(item.id)} menu`
                : "Tambah"}
            </button>
          </div>
        ))}
      </div>

      {!isLoadingCart &&
        selectedItem && ( // Tunda render ItemPopup dengan isLoadingCart
          <ItemPopup
            item={selectedItem}
            onClose={handleClosePopup}
            cart={cart}
            setCart={setCart}
            showOverlay={showOverlay}
            setShowOverlay={setShowOverlay}
          />
        )}

      {/* Tambahkan ini untuk pop-up konfirmasi */}
      {!isLoadingCart && showConfirmation && (
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
    </div>
  );
};

export default ItemList;
