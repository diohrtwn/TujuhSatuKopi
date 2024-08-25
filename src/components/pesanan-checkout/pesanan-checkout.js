import React, { useEffect, useState, useRef } from "react";
import { useUserContext } from "../user-context/usercontext";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  collection,
  addDoc,
} from "firebase/firestore";
import { storeFirebase } from "../../firebaseConfig";
import "./pesanan-checkout.css";
import AppFooter from "../app-footer/app-footer";
import { useNavigate, useLocation } from "react-router-dom";
import AppHeader from "../app-header/app-header";
import FreeBreakfastIcon from "@mui/icons-material/FreeBreakfast";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faTag } from "@fortawesome/free-solid-svg-icons";

export default function PesananCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserContext();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedOption, setSelectedOption] = useState("pickup");
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeliveryProviderPopup, setShowDeliveryProviderPopup] =
    useState(false);
  const [showVoucherPopup, setShowVoucherPopup] = useState(false);

  const [selectedDeliveryProvider, setSelectedDeliveryProvider] =
    useState(null);
  const [tempSelectedProvider, setTempSelectedProvider] = useState(null);
  const [isVoucherApplied, setIsVoucherApplied] = useState(false);
  const [voucherDiscount, setVoucherDiscount] = useState(0);

  const [deliveryAddress, setDeliveryAddress] = useState({
    address: "",
    detailAddress: "",
    phoneNumber: "",
    recipientName: "",
  });

  const [isAddressSaved, setIsAddressSaved] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [originalAddress, setOriginalAddress] = useState(null);

  const [deliveryData, setDeliveryData] = useState(null);

  const [deliveryFee, setDeliveryFee] = useState(null);

  // State untuk melacak penggunaan voucher
  const [isVoucherUsed, setIsVoucherUsed] = useState(false);

  const mapsImageRef = useRef(null);
  const [mapsImageHeight, setMapsImageHeight] = useState(0);

  useEffect(() => {
    const fetchCartItems = async () => {
      if (user && user.uid) {
        const userCartRef = doc(storeFirebase, "carts", user.uid);
        const cartSnapshot = await getDoc(userCartRef);
        if (cartSnapshot.exists()) {
          const cartData = cartSnapshot.data().cart;
          const items = Object.values(cartData).map((item, index) => ({
            id: Object.keys(cartData)[index],
            ...item,
          }));
          const price = cartSnapshot.data().totalPrice;
          setCartItems(items);
          setTotalPrice(price);
        }
      }
    };

    const fetchDeliveryData = async () => {
      if (user && user.uid) {
        const deliveryRef = doc(storeFirebase, "pengiriman", user.uid);
        const deliverySnapshot = await getDoc(deliveryRef);

        if (deliverySnapshot.exists()) {
          setDeliveryData(deliverySnapshot.data());
          setIsAddressSaved(true);

          setDeliveryAddress({
            address: deliverySnapshot.data().alamat,
            detailAddress: deliverySnapshot.data().detailAlamat,
            phoneNumber: deliverySnapshot.data().nomorTelepon,
            recipientName: deliverySnapshot.data().namaPenerima,
          });
          setOriginalAddress({
            address: deliverySnapshot.data().alamat,
            detailAddress: deliverySnapshot.data().detailAlamat,
            phoneNumber: deliverySnapshot.data().nomorTelepon,
            recipientName: deliverySnapshot.data().namaPenerima,
          });
        }
      }
    };

    const fetchUserData = async () => {
      if (user && user.uid) {
        const userRef = doc(storeFirebase, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          setIsVoucherUsed(userSnapshot.data().voucherUsed || false);
        }
      }
    };

    fetchCartItems();
    fetchDeliveryData();
    fetchUserData();

    if (mapsImageRef.current) {
      setMapsImageHeight(mapsImageRef.current.clientHeight);
    }

    // Scrolling di useEffect
    if (location.pathname === "/checkout") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [user, location.pathname]);

  // useEffect untuk mengupdate deliveryFee
  useEffect(() => {
    const calculateDeliveryFee = (provider) => {
      if (provider === "GrabExpress" || provider === "Gosend") {
        return 13000;
      }
      return null;
    };

    setDeliveryFee(calculateDeliveryFee(selectedDeliveryProvider));
  }, [selectedDeliveryProvider]);

  const updateItemQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await deleteItem(itemId);
      return;
    }

    const updatedCartItems = cartItems.map((item) =>
      item.id === itemId
        ? {
            ...item,
            quantity: newQuantity,
            total: (item.total / item.quantity) * newQuantity,
          }
        : item
    );

    const updatedTotalPrice = updatedCartItems.reduce(
      (acc, item) => acc + item.total,
      0
    );

    if (user && user.uid) {
      const userCartRef = doc(storeFirebase, "carts", user.uid);

      const updatedCartData = updatedCartItems.reduce((acc, item) => {
        acc[item.id] = {
          ...item,
          total: item.total,
        };
        return acc;
      }, {});

      try {
        await updateDoc(userCartRef, {
          cart: updatedCartData,
          totalPrice: updatedTotalPrice,
        });

        setCartItems(updatedCartItems);
        setTotalPrice(updatedTotalPrice);

        console.log("Firestore updated successfully!");
      } catch (error) {
        console.error("Error updating Firestore:", error);
      }
    }
  };

  const deleteItem = async (itemId) => {
    const updatedCartItems = cartItems.filter((item) => item.id !== itemId);

    const updatedTotalPrice = updatedCartItems.reduce(
      (acc, item) => acc + item.total,
      0
    );

    if (user && user.uid) {
      const userCartRef = doc(storeFirebase, "carts", user.uid);

      try {
        await updateDoc(userCartRef, {
          cart: updatedCartItems.reduce((acc, item) => {
            acc[item.id] = item;
            return acc;
          }, {}),
          totalPrice: updatedTotalPrice,
        });

        setCartItems(updatedCartItems);
        setTotalPrice(updatedTotalPrice);

        console.log("Firestore updated successfully (deleteItem)!");
      } catch (error) {
        console.error("Error updating Firestore (deleteItem):", error);
      }
    }
  };

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

  const handleDeliveryClick = () => {
    setShowPopup(true);
  };

  const handleSwitch = () => {
    setSelectedOption("delivery");
    setShowPopup(false);
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    // Update state phoneNumber langsung dengan input user
    setDeliveryAddress({
      ...deliveryAddress,
      [name]: value,
    });
  };

  const handleSaveAddress = async () => {
    if (
      !deliveryAddress.address ||
      !deliveryAddress.detailAddress ||
      !deliveryAddress.phoneNumber ||
      !deliveryAddress.recipientName
    ) {
      alert("Mohon isi semua field alamat terlebih dahulu");
      return;
    }

    if (user && user.uid) {
      try {
        await setDoc(
          doc(storeFirebase, "pengiriman", user.uid),
          {
            alamat: deliveryAddress.address,
            detailAlamat: deliveryAddress.detailAddress,
            nomorTelepon: deliveryAddress.phoneNumber,
            namaPenerima: deliveryAddress.recipientName,
          },
          { merge: true }
        );

        console.log("Alamat pengiriman berhasil disimpan!");

        setIsAddressSaved(true);
        setIsEditingAddress(false);

        setDeliveryData({
          alamat: deliveryAddress.address,
          detailAlamat: deliveryAddress.detailAddress,
          nomorTelepon: deliveryAddress.phoneNumber,
          namaPenerima: deliveryAddress.recipientName,
        });

        setOriginalAddress({
          address: deliveryAddress.address,
          detailAddress: deliveryAddress.detailAddress,
          phoneNumber: deliveryAddress.phoneNumber,
          recipientName: deliveryAddress.recipientName,
        });
      } catch (error) {
        console.error("Error menyimpan alamat pengiriman:", error);
      }
    } else {
      console.error("User belum login!");
    }
  };

  const handleEditAddress = () => {
    setIsEditingAddress(true);
    setIsAddressSaved(false);

    setOriginalAddress({
      address: deliveryData.alamat,
      detailAddress: deliveryData.detailAlamat,
      phoneNumber: deliveryData.nomorTelepon,
      recipientName: deliveryData.namaPenerima,
    });
  };

  const handleCancelEdit = () => {
    setIsEditingAddress(false);
    setIsAddressSaved(true);

    if (originalAddress) {
      setDeliveryAddress(originalAddress);
      setOriginalAddress(null);
    }
  };

  const handleDeliveryProviderClick = () => {
    setShowDeliveryProviderPopup(true);
  };

  const handleVoucherClick = () => {
    setShowVoucherPopup(true);
  };

  const handleApplyVoucher = () => {
    // Cek apakah voucher sudah pernah digunakan
    if (isVoucherUsed) {
      alert("Voucher sudah pernah digunakan.");
      return;
    }

    setIsVoucherApplied(true);
    setVoucherDiscount(10000);
  };

  const handlePayment = async () => {
    const itemDetails = cartItems.map((item) => ({
      id: item.id,
      price: item.total / item.quantity,
      quantity: item.quantity,
      name: item.name,
      total: item.total,
      cupSize: item.cupSize,
      imageUrl: item.imageUrl,
      instructions: item.instructions,
    }));

    let totalAmount = totalPrice;

    if (selectedOption === "delivery") {
      totalAmount += (deliveryFee || 0) + 5000;

      if (deliveryFee) {
        itemDetails.push({
          id: "delivery-fee",
          price: deliveryFee,
          quantity: 1,
          name: "Delivery Fee",
          total: deliveryFee,
        });
      }

      itemDetails.push({
        id: "packaging-fee",
        price: 5000,
        quantity: 1,
        name: "Packaging Fee",
        total: 5000,
      });
    }

    let finalAmount = totalAmount;
    if (selectedOption === "pickup" && isVoucherApplied) {
      finalAmount -= voucherDiscount;

      itemDetails.push({
        id: "voucher-discount",
        price: -voucherDiscount,
        quantity: 1,
        name: "Voucher Discount",
        total: -voucherDiscount,
      });
    }

    const transactionDetails = {
      gross_amount: finalAmount,
    };

    try {
      const response = await fetch("http://localhost:5000/create-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionDetails,
          itemDetails,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const transactionToken = data.transactionToken;

        window.snap.pay(transactionToken, {
          onSuccess: async function (result) {
            console.log("Transaksi berhasil:", result);
            setIsLoading(true);

            try {
              const orderData = {
                userId: user.uid,
                orderId: result.order_id,
                totalPrice: finalAmount,
                items: itemDetails,
                timestamp: new Date(),
                orderStatus: "pending",
                paymentType: result.payment_type,
                deliveryAddress:
                  selectedOption === "delivery" ? deliveryAddress : null,
              };

              const orderRef = await addDoc(
                collection(storeFirebase, "orders"),
                orderData
              );

              console.log("Order saved with ID: ", orderRef.id);
              await updateDoc(orderRef, { orderStatus: "success" });

              if (isVoucherApplied) {
                const userRef = doc(storeFirebase, "users", user.uid);
                try {
                  await updateDoc(userRef, { voucherUsed: true });
                  console.log("Voucher status updated successfully!");
                  setIsVoucherUsed(true);
                } catch (error) {
                  console.error("Error updating voucher status:", error);
                }
              }

              if (user && user.uid) {
                const userCartRef = doc(storeFirebase, "carts", user.uid);
                try {
                  await deleteDoc(userCartRef);
                  console.log("Cart items deleted successfully!");
                } catch (error) {
                  console.error("Error deleting cart items:", error);
                }
              }

               // Simpan data transaksi ke Firestore
               try {
                await addDoc(collection(storeFirebase, "transactions"), {
                  transaction_id: result.transaction_id,
                  order_id: result.order_id,
                  gross_amount: result.gross_amount,
                  payment_type: result.payment_type,
                  transaction_time: result.transaction_time,
                  status: result.transaction_status, // Pastikan Anda menerima status transaksi dari Midtrans
                });
                console.log("Data transaksi berhasil disimpan!");
              } catch (error) {
                console.error("Error menyimpan transaksi ke Firestore:", error);
              }

            } catch (error) {
              console.error("Error saving order: ", error);
            } finally {
              setIsLoading(false);
              navigate("/history");
            }
          },
          onPending: function (result) {
            console.log("Transaksi pending:", result);
            setIsLoading(false);
          },
          onError: function (result) {
            console.log("Terjadi kesalahan pada transaksi:", result);
            setIsLoading(false);
          },
          onClose: function () {
            console.log("Pop-up Midtrans ditutup");
            setIsLoading(false);
          },
        });
      } else {
        console.error("Gagal membuat transaksi:", data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <AppHeader password={"goodPage"} />

      <div className="pesanan-main-content">
        <div className="checkout-container">
          <h1>Checkout</h1>

          <div className="pickup-delivery-options">
            <div className="option" onClick={() => setSelectedOption("pickup")}>
              <FreeBreakfastIcon fontSize="large" /> Pickup
            </div>
            <div
              className={`option ${
                selectedOption === "delivery" ? "disabled-option" : ""
              }`}
              onClick={selectedOption === "pickup" ? handleDeliveryClick : null}
            >
              <DeliveryDiningIcon fontSize="large" /> Delivery
            </div>
          </div>

          {selectedOption === "pickup" && (
            <div>
              <div className="location-section">
                <div className="location-header">
                  <div className="title-container">
                    <h2 className="location-title">TujuhSatuKopi</h2>
                    <a
                      href="https://maps.app.goo.gl/dVpfTWwrYZTWJgJr5"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="maps-link"
                    >
                      <img
                        src="/img/maps.jpg"
                        alt="Lokasi Google Maps"
                        className="maps-icon"
                        ref={mapsImageRef}
                      />
                    </a>
                  </div>
                </div>
                <p className="address">
                  Jl. Kihajar Dewantoro No.119, Gondrong, Kec. Cipondoh, Kota
                  Tangerang, Banten 15146
                </p>
              </div>

              <div
                className="order-section"
                style={{ marginTop: mapsImageHeight }}
              >
                <hr></hr>
                <div className="voucher-section" onClick={handleVoucherClick}>
                  <FontAwesomeIcon icon={faTag} className="voucher-icon" />
                  Voucher TujuhSatuKopi
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className="chevron-icon"
                  />
                </div>

                {/* Tampilan voucher terpasang */}
                {isVoucherApplied && (
                  <div className="voucher-applied-text">
                    1 Voucher Terpasang
                  </div>
                )}

                <h2 className="order-header">Order</h2>
                {cartItems.map((item) => (
                  <div className="order-item" key={item.id}>
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="item-image"
                    />
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                      <span>{item.cupSize}</span>
                      <p>{item.instructions}</p>
                      <div className="quantity-control">
                        <button
                          onClick={() =>
                            updateItemQuantity(item.id, item.quantity - 1)
                          }
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateItemQuantity(item.id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                      <p>
                        {item.quantity} x{" "}
                        {formatRupiah(item.total / item.quantity)}
                      </p>
                    </div>
                    <p className="item-total">{formatRupiah(item.total)}</p>
                  </div>
                ))}
              </div>

              <div className="order-summary-section">
                <div className="order-summary-details">
                  <div className="order-summary-item">
                    <span>Subtotal</span>
                    <span>{formatRupiah(totalPrice)}</span>
                  </div>

                  {isVoucherApplied && (
                    <div className="order-summary-item">
                      <span>Voucher Discount</span>
                      <span className="order-summary-discount">
                        - {formatRupiah(voucherDiscount)}
                      </span>
                    </div>
                  )}
                </div>
                <hr />

                <div className="order-summary-total">
                  <h2>Total</h2>
                  <p>{formatRupiah(totalPrice - voucherDiscount)}</p>
                </div>
              </div>

              <button
                className="select-payment-button"
                disabled={cartItems.length === 0}
                onClick={handlePayment}
              >
                Payment
              </button>
            </div>
          )}

          {selectedOption === "delivery" && (
            <div>
              {!isAddressSaved && (
                <div className="delivery-address-section">
                  <h2 className="delivery-title">Alamat Pengiriman</h2>
                  <div className="address-input-group">
                    <label htmlFor="address">Alamat:</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={deliveryAddress.address}
                      onChange={handleAddressChange}
                      placeholder="Jl. Contoh Jalan No. 123"
                      required
                    />
                  </div>

                  <div className="address-input-group">
                    <label htmlFor="detailAddress">Detail Alamat:</label>
                    <input
                      type="text"
                      id="detailAddress"
                      name="detailAddress"
                      value={deliveryAddress.detailAddress}
                      onChange={handleAddressChange}
                      placeholder="e.g. block / Unit No., Landmarks ..."
                      required
                    />
                  </div>

                  <div className="address-input-group">
                    <label htmlFor="phoneNumber">Nomor Telepon:</label>
                    <div className="phone-number-input">
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={deliveryAddress.phoneNumber} // Tampilkan input user secara langsung
                        onChange={handleAddressChange}
                        placeholder="Masukkan Nomor Telepon"
                        required
                      />
                    </div>
                  </div>

                  <div className="address-input-group">
                    <label htmlFor="recipientName">Nama Penerima:</label>
                    <input
                      type="text"
                      id="recipientName"
                      name="recipientName"
                      value={deliveryAddress.recipientName}
                      onChange={handleAddressChange}
                      placeholder="Nama Lengkap"
                      required
                    />
                  </div>
                  <button
                    className="save-address-button"
                    onClick={handleSaveAddress}
                    disabled={
                      !deliveryAddress.address ||
                      !deliveryAddress.detailAddress ||
                      !deliveryAddress.phoneNumber ||
                      !deliveryAddress.recipientName
                    }
                  >
                    Save Address
                  </button>

                  {isEditingAddress && (
                    <button
                      className="cancel-edit-button"
                      onClick={handleCancelEdit}
                    >
                      Batalkan Pergantian Alamat
                    </button>
                  )}
                </div>
              )}

              {isAddressSaved && deliveryData && (
                <div>
                  <div className="delivery-info">
                    <div className="delivery-header">
                      <h3 className="delivery-to">Delivery Info</h3>
                      <div className="chevron-container">
                        <FontAwesomeIcon
                          icon={faChevronRight}
                          className="chevron-icon"
                          onClick={handleEditAddress}
                        />
                      </div>
                    </div>
                    <div className="recipient-info-wrapper">
                      <p className="recipient-info">
                        <span className="recipient-name">
                          {deliveryData.namaPenerima}
                        </span>
                        :{" "}
                        <span className="phone-number">
                          {deliveryData.nomorTelepon}
                        </span>
                      </p>
                    </div>
                    <p className="address">
                      <span className="street-address">
                        {deliveryData.alamat}
                      </span>
                      ,{" "}
                      <span className="detail-address">
                        {deliveryData.detailAlamat}
                      </span>
                    </p>
                    <hr></hr>

                    {/* Tampilkan logo dan teks penyedia pengiriman secara kondisional */}
                    <div
                      className="delivery-provider"
                      onClick={handleDeliveryProviderClick}
                    >
                      {selectedDeliveryProvider ? (
                        <>
                          <img
                            src={
                              selectedDeliveryProvider === "GrabExpress"
                                ? "/img/logo_grab.png"
                                : "/img/logo_gosend.jpg"
                            }
                            alt={`${selectedDeliveryProvider} Logo`}
                            className="provider-logo"
                          />
                          <span className="provider-name">
                            Delivery by {selectedDeliveryProvider}
                          </span>
                        </>
                      ) : (
                        <>
                          <img
                            src="/img/logo_grab.png"
                            alt="GrabExpress Logo"
                            className="provider-logo"
                          />
                          <span className="provider-name">Delivery by</span>
                        </>
                      )}
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="chevron-icon"
                      />
                    </div>
                  </div>

                  <div
                    className="order-delivery"
                    style={{ marginTop: mapsImageHeight }}
                  >
                    <h2 className="order-header">Order</h2>
                    {cartItems.map((item) => (
                      <div className="order-item" key={item.id}>
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="item-image"
                        />
                        <div className="item-details">
                          <h3>{item.name}</h3>
                          <p>{item.description}</p>
                          <span>{item.cupSize}</span>
                          <p>{item.instructions}</p>
                          <div className="quantity-control">
                            <button
                              onClick={() =>
                                updateItemQuantity(item.id, item.quantity - 1)
                              }
                            >
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateItemQuantity(item.id, item.quantity + 1)
                              }
                            >
                              +
                            </button>
                          </div>
                          <p>
                            {item.quantity} x{" "}
                            {formatRupiah(item.total / item.quantity)}
                          </p>
                        </div>
                        <p className="item-total">{formatRupiah(item.total)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="billing-details">
                    <div className="billing-item">
                      <span>Subtotal</span>
                      <span>{formatRupiah(totalPrice)}</span>
                    </div>
                    <div className="billing-item">
                      <span>Delivery Fee</span>
                      <span>
                        {deliveryFee !== null ? formatRupiah(deliveryFee) : "-"}
                      </span>
                    </div>
                    <div className="billing-item">
                      <span>Packaging Fee</span>
                      <span>Rp 5.000</span>
                    </div>
                  </div>
                  <hr />
                  <div className="total-price">
                    <span>Total</span>
                    <span>
                      {formatRupiah(totalPrice + (deliveryFee || 0) + 5000)}
                    </span>
                  </div>

                  <button
                    className="select-payment-button"
                    disabled={
                      cartItems.length === 0 || !selectedDeliveryProvider
                    }
                    onClick={handlePayment}
                  >
                    Payment
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AppFooter />

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <div className="popup-header">
              <h2>Switch to Delivery?</h2>
              <button
                className="close-button"
                onClick={() => setShowPopup(false)}
              >
                X
              </button>
            </div>
            <p>
              Please double check as your order items might change after
              switching
            </p>
            <div className="popup-buttons">
              <button onClick={() => setShowPopup(false)}>Cancel</button>
              <button onClick={handleSwitch}>Switch</button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Provider Popup */}
      {showDeliveryProviderPopup && (
        <div className="popup">
          <div className="popup-content delivery-provider-popup">
            <div className="popup-header">
              <h2>Select Courier</h2>
              <button
                className="close-button"
                onClick={() => setShowDeliveryProviderPopup(false)}
              >
                X
              </button>
            </div>
            <div
              className={`delivery-provider-option ${
                tempSelectedProvider === "GrabExpress" ? "selected" : ""
              }`}
              onClick={() => setTempSelectedProvider("GrabExpress")}
            >
              <img
                src="/img/logo_grab.png"
                alt="GrabExpress Logo"
                className="provider-logo"
              />
              <span className="provider-name">Grab Express</span>
              <span className="provider-price">Rp 13.000</span>
            </div>
            <div
              className={`delivery-provider-option ${
                tempSelectedProvider === "Gosend" ? "selected" : ""
              }`}
              onClick={() => setTempSelectedProvider("Gosend")}
            >
              <img
                src="/img/logo_gosend.jpg"
                alt="GoSend Logo"
                className="provider-logo"
              />
              <span className="provider-name">Gosend</span>
              <span className="provider-price">Rp 13.000</span>
            </div>
            <button
              className="select-provider-button"
              onClick={() => {
                setSelectedDeliveryProvider(tempSelectedProvider);
                setShowDeliveryProviderPopup(false);
                setTempSelectedProvider(null);
              }}
            >
              Select
            </button>
          </div>
        </div>
      )}

      {/* Voucher Popup */}
      {showVoucherPopup && (
        <div className="voucher-popup">
          <div className="voucher-popup-content">
            <div className="voucher-popup-header">
              <h2>Select Voucher</h2>
              <button
                className="voucher-close-button"
                onClick={() => setShowVoucherPopup(false)}
              >
                X
              </button>
            </div>
            <div className="voucher-option">
              {/* Tampilkan teks voucher berdasarkan status isVoucherUsed */}
              <span className="voucher-description">
                {isVoucherUsed
                  ? "Voucher Discount Kosong"
                  : "PENGGUNA BARU | PEMBELIAN PERTAMA DISCOUNT 10K"}
              </span>
              {/* Tombol "Pasang" hanya ditampilkan jika voucher belum digunakan */}
              {!isVoucherUsed && (
                <button
                  className={`apply-voucher-button ${
                    isVoucherApplied ? "voucher-applied" : ""
                  }`}
                  onClick={handleApplyVoucher}
                  disabled={isVoucherApplied}
                >
                  {isVoucherApplied ? "Terpasang" : "Pasang"}
                </button>
              )}
            </div>
            <button
              className="ok-voucher-button"
              onClick={() => setShowVoucherPopup(false)}
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </>
  );
}
