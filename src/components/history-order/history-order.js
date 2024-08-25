import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./history-order.css";
import AppFooter from "../app-footer/app-footer";
import AppHeader from "../app-header/app-header";
import { useUserContext } from "../user-context/usercontext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { storeFirebase } from "../../firebaseConfig";

const HistoryOrder = () => {
  const location = useLocation();
  const { user } = useUserContext();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let unsubscribe;

    // Fungsi untuk mengambil data order
    const fetchOrders = async () => {
      if (user && user.uid) {
        try {
          const q = query(
            collection(storeFirebase, "orders"),
            where("userId", "==", user.uid)
          );

          unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const ordersData = await Promise.all(
              querySnapshot.docs.map(async (doc) => {
                const orderData = doc.data();
                let addressInfo = "";

                if (orderData.deliveryAddress) {
                  addressInfo = `
                    <div>
                      <h3>Delivery Info</h3>
                      <p>
                        <span>${orderData.deliveryAddress.recipientName}</span> : <span>${orderData.deliveryAddress.phoneNumber}</span>
                      </p>
                      <p>${orderData.deliveryAddress.address}, ${orderData.deliveryAddress.detailAddress}</p>
                    </div>
                  `;
                } else {
                  addressInfo = `
                    <div>
                      <h3>Pickup TujuhSatuKopi</h3>
                      <p>Jl. Kihajar Dewantoro No.119, Gondrong, Kec. Cipondoh, Kota Tangerang, Banten 15146</p>
                    </div>
                  `;
                }

                // Gabungkan item biasa, delivery fee, packaging fee, dan voucher
                const allItems = [...orderData.items];
                const deliveryFeeItem = allItems.find(
                  (item) => item.id === "delivery-fee"
                );
                const packagingFeeItem = allItems.find(
                  (item) => item.id === "packaging-fee"
                );
                const voucherDiscountItem = allItems.find(
                  (item) => item.id === "voucher-discount"
                );
                const regularItems = allItems.filter(
                  (item) =>
                    item.id !== "delivery-fee" &&
                    item.id !== "packaging-fee" &&
                    item.id !== "voucher-discount"
                );

                return {
                  id: doc.id,
                  ...orderData,
                  addressInfo,
                  regularItems,
                  deliveryFeeItem,
                  packagingFeeItem,
                  voucherDiscountItem,
                };
              })
            );
            setOrders(ordersData);
          });
        } catch (error) {
          console.error("Error mengambil pesanan: ", error);
        }
      }
    };

    // Panggil fetchOrders ketika user berubah
    fetchOrders();

    return () => unsubscribe && unsubscribe();
  }, [user]);

  useEffect(() => {
    if (location.pathname === "/history") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [location.pathname]);

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

  return (
    <>
      <AppHeader password={"goodPage"} />
      <div className="history-main-content">
        {orders.map((order) => (
          <div className="history-card" key={order.id}>
            <div className="history-header">
              <span className="history-number">#{order.orderId.slice(-6)}</span>
              <span className={`history-status ${order.orderStatus}`}>
                {order.orderStatus}
              </span>
            </div>

            {/* Alamat Pickup/Delivery */}
            <div dangerouslySetInnerHTML={{ __html: order.addressInfo }} />

            {/* Daftar Item yang Dipesan */}
            <div className="history-items">
              {order.regularItems.map((item, index) => (
                <div className="history-item" key={index}>
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="history-item-image"
                  />
                  <div className="history-item-details">
                    <span className="history-item-name">{item.name}</span>
                    {item.cupSize && (
                      <span className="history-item-cupSize">
                        {item.cupSize}
                      </span>
                    )}
                    {item.instructions && (
                      <p className="history-item-instructions">
                        {item.instructions}
                      </p>
                    )}
                    <div className="history-item-quantity">
                      {item.quantity} x {formatRupiah(item.price)}
                    </div>
                  </div>
                  <div className="history-item-price">
                    {formatRupiah(item.total)}
                  </div>
                </div>
              ))}

              {/* Delivery Fee (jika ada) */}
              {order.deliveryFeeItem && (
                <div className="history-item">
                  <div className="history-item-details">
                    <span className="history-item-name">Delivery Fee</span>
                  </div>
                  <div className="history-item-price">
                    {formatRupiah(order.deliveryFeeItem.total)}
                  </div>
                </div>
              )}
              {/* Packaging Fee (jika ada) */}
              {order.packagingFeeItem && (
                <div className="history-item">
                  <div className="history-item-details">
                    <span className="history-item-name">Packaging Fee</span>
                  </div>
                  <div className="history-item-price">
                    {formatRupiah(order.packagingFeeItem.total)}
                  </div>
                </div>
              )}

              {/* Voucher Discount (jika ada) */}
              {order.voucherDiscountItem && (
                <div className="history-item">
                  <div className="history-item-details">
                    <span className="history-item-name">Voucher Discount</span>
                  </div>
                  <div className="history-item-price">
                    {formatRupiah(order.voucherDiscountItem.total)}
                  </div>
                </div>
              )}
            </div>

            {/* Garis pemisah */}
            <hr className="history-divider" />

            {/* Total Harga */}
            <div className="history-total">
              <span className="history-total-label">Total</span>
              <span className="history-total-price">
                {formatRupiah(order.totalPrice)}
              </span>
            </div>
            {/* Detail Order */}
            <div className="history-footer">
              <div>
                <p className="history-detail-label">Order Number:</p>
                <p className="history-detail-label">Order Time:</p>
                <p className="history-detail-label">Payment Method:</p>
              </div>
              <div>
                <p className="history-detail-value">{order.orderId}</p>
                <p className="history-detail-value">
                  {new Date(order.timestamp.seconds * 1000).toLocaleString(
                    "en-US",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }
                  )}
                </p>
                <p className="history-detail-value">{order.paymentType}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <AppFooter />
    </>
  );
};

export default HistoryOrder;
