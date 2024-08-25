import React, { useState, useEffect } from "react";
import { useUserContext } from "../user-context/usercontext";
import { useNavigate } from "react-router-dom";
import "./admin.css";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
  getDoc,
} from "firebase/firestore";
import { storeFirebase } from "../../firebaseConfig";

const Admin = () => {
  const { user, logout } = useUserContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [chartData, setChartData] = useState([]);
  const [totalPendapatan, setTotalPendapatan] = useState(0);
  const [totalTransaksi, setTotalTransaksi] = useState(0);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showDetail, setShowDetail] = useState({});
  const [transactions, setTransactions] = useState([]); // Tambahkan state untuk transaksi

  // State untuk form tambah produk
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    description: "",
    imageUrl: "",
    category: "meal",
  });

  // State untuk mengontrol tampilan modal
  const [showModal, setShowModal] = useState(false);

  // Fungsi untuk mendapatkan nama pelanggan dari userId
  const getCustomerName = async (userId) => {
    try {
      const userDoc = await getDoc(doc(storeFirebase, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Gabungkan firstName dan lastName, jika ada
        const firstName = userData.firstName || "";
        const lastName = userData.lastName ? ` ${userData.lastName}` : "";
        return firstName + lastName;
      } else {
        return "N/A";
      }
    } catch (error) {
      console.error("Error fetching user name:", error);
      return "N/A";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const transactionsRef = collection(storeFirebase, "transactions");
        const transactionsSnapshot = await getDocs(transactionsRef);

        let newTotalPendapatan = 0;
        let newTotalTransaksi = transactionsSnapshot.docs.length;

        transactionsSnapshot.forEach((doc) => {
          newTotalPendapatan += Number(doc.data().gross_amount);
        });

        setTotalPendapatan(newTotalPendapatan);
        setTotalTransaksi(newTotalTransaksi);

        const mealRef = collection(storeFirebase, "meal");
        const menuRef = collection(storeFirebase, "menu");

        const mealSnapshot = await getDocs(mealRef);
        const menuSnapshot = await getDocs(menuRef);

        const mealProducts = mealSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          collection: "meal",
        }));

        const menuProducts = menuSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          collection: "menu",
        }));

        setProducts([...mealProducts, ...menuProducts]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchDataForChart = async () => {
      const q = query(
        collection(storeFirebase, "transactions"),
        orderBy("transaction_time", "asc")
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const newData = [];
        querySnapshot.forEach((doc) => {
          const transactionDate = new Date(doc.data().transaction_time);
          const formattedDate = `${transactionDate.getFullYear()}-${(
            transactionDate.getMonth() + 1
          )
            .toString()
            .padStart(2, "0")}-${transactionDate
            .getDate()
            .toString()
            .padStart(2, "0")}`;
          newData.push({
            date: formattedDate,
            total: doc.data().gross_amount,
          });
        });
        setChartData(newData);
      });

      return () => unsubscribe();
    };

    fetchDataForChart();
  }, []);

  // useEffect untuk mengambil data transaksi
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const transactionsRef = collection(storeFirebase, "transactions");
        const q = query(transactionsRef, orderBy("transaction_time", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedTransactions = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTransactions(fetchedTransactions);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersRef = collection(storeFirebase, "orders");
        const q = query(ordersRef, orderBy("timestamp", "desc"));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
          const fetchedOrders = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const orderData = doc.data();
              const customerName = await getCustomerName(orderData.userId);
              return {
                id: doc.id,
                ...orderData,
                customerName: customerName,
              };
            })
          );
          setOrders(fetchedOrders);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!user) {
    return (
      <div>
        <h1>Anda harus login sebagai admin!</h1>
        <button onClick={() => navigate("/login")}>Ke Halaman Login</button>
      </div>
    );
  }

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const productToDelete = products.find((p) => p.id === productId);
      const collectionName = productToDelete.collection;

      await deleteDoc(doc(storeFirebase, collectionName, productId));
      setProducts(products.filter((product) => product.id !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct({ ...product, category: product.category || "meal" });
    setShowModal(true);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (editingProduct) {
      setEditingProduct((prevProduct) => ({
        ...prevProduct,
        [name]: value,
      }));
    } else {
      setNewProduct((prevProduct) => ({
        ...prevProduct,
        [name]: value,
      }));
    }
  };

  const handleSaveEdit = async () => {
    try {
      const categoryToUpdate = editingProduct.category || "meal";

      await updateDoc(
        doc(storeFirebase, editingProduct.collection, editingProduct.id),
        {
          name: editingProduct.name,
          price: parseInt(editingProduct.price, 10),
          description: editingProduct.description,
          imageUrl: editingProduct.imageUrl,
          category: categoryToUpdate,
        }
      );

      setEditingProduct(null);
      setShowModal(false);
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === editingProduct.id
            ? { ...product, ...editingProduct }
            : product
        )
      );
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setShowModal(false);
  };

  const handleAddNewProduct = async () => {
    try {
      const collectionName = newProduct.category === "meal" ? "meal" : "menu";
      const productRef = collection(storeFirebase, collectionName);
      const docRef = await addDoc(productRef, {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        description: newProduct.description,
        imageUrl: newProduct.imageUrl,
        category: newProduct.category,
      });

      setProducts([
        ...products,
        {
          ...newProduct,
          id: docRef.id,
          collection: collectionName,
        },
      ]);
      setNewProduct({
        name: "",
        price: 0,
        description: "",
        imageUrl: "",
        category: "meal",
      });
      setShowModal(false);
    } catch (error) {
      console.error("Error adding new product:", error);
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(storeFirebase, "orders", orderId), {
        orderStatus: newStatus,
      });
      console.log("Order status updated successfully!");
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Admin TujuhSatuKopi</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>
      <div className="admin-content">
        <aside className="sidebar">
          <img src="/LOGO_KOPI.jpg" alt="Gambar" className="sidebar-logo" />
          <ul>
            <li
              className={activeTab === "dashboard" ? "active" : ""}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </li>
            <li
              className={activeTab === "products" ? "active" : ""}
              onClick={() => setActiveTab("products")}
            >
              Manajemen Produk
            </li>
            <li
              className={activeTab === "orders" ? "active" : ""}
              onClick={() => setActiveTab("orders")}
            >
              Manajemen Pesanan
            </li>
          </ul>
        </aside>
        <main className="main-content">
          {activeTab === "dashboard" && (
            <section className="admin-panel">
              <div className="summary-container">
                <div className="summary-item">
                  <h2>{formatRupiah(totalPendapatan)}</h2>
                  <p>Total Pendapatan</p>
                </div>
                <div className="summary-item">
                  <h2>{totalTransaksi}</h2>
                  <p>Total Transaksi</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#8884d8"
                    fill="#8884d8"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </section>
          )}
          {activeTab === "products" && (
            <section className="admin-panel">
              <div className="products-header">
                <h2>Manajemen Produk</h2>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowModal(true);
                  }}
                  className="add-product-button"
                >
                  Tambah Produk Baru
                </button>
              </div>

              {showModal && (
                <div className="modal">
                  <div className="modal-content">
                    <span
                      className="close-modal"
                      onClick={() => setShowModal(false)}
                    >
                      ×
                    </span>
                    <h2>
                      {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
                    </h2>
                    <form>
                      <div className="form-group">
                        <label htmlFor="productName">Nama:</label>
                        <input
                          type="text"
                          id="productName"
                          name="name"
                          value={
                            editingProduct
                              ? editingProduct.name
                              : newProduct.name
                          }
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="productPrice">Harga:</label>
                        <input
                          type="number"
                          id="productPrice"
                          name="price"
                          value={
                            editingProduct
                              ? editingProduct.price
                              : newProduct.price
                          }
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="productDescription">Deskripsi:</label>
                        <textarea
                          id="productDescription"
                          name="description"
                          value={
                            editingProduct
                              ? editingProduct.description
                              : newProduct.description
                          }
                          onChange={handleInputChange}
                        ></textarea>
                      </div>
                      <div className="form-group">
                        <label htmlFor="productImageUrl">Image URL:</label>
                        <input
                          type="text"
                          id="productImageUrl"
                          name="imageUrl"
                          value={
                            editingProduct
                              ? editingProduct.imageUrl
                              : newProduct.imageUrl
                          }
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="productCategory">Kategori:</label>
                        <select
                          id="productCategory"
                          name="category"
                          value={
                            editingProduct
                              ? editingProduct.category
                              : newProduct.category
                          }
                          onChange={handleInputChange}
                        >
                          <option value="meal">Makanan</option>
                          <option value="menu">Minuman</option>
                        </select>
                      </div>
                      <div className="form-button-group">
                        <button
                          type="button"
                          onClick={
                            editingProduct
                              ? handleSaveEdit
                              : handleAddNewProduct
                          }
                        >
                          Simpan
                        </button>
                        <button type="button" onClick={handleCancelEdit}>
                          Batal
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Tabel Produk */}
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nama</th>
                    <th>Harga</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>
                        {editingProduct?.id === product.id ? (
                          <input
                            type="text"
                            name="name"
                            value={editingProduct.name}
                            onChange={handleInputChange}
                          />
                        ) : (
                          product.name
                        )}
                      </td>
                      <td>
                        {editingProduct?.id === product.id ? (
                          <input
                            type="number"
                            name="price"
                            value={editingProduct.price}
                            onChange={handleInputChange}
                          />
                        ) : (
                          formatRupiah(product.price)
                        )}
                      </td>
                      <td>
                        {editingProduct?.id === product.id ? (
                          <>
                            <button onClick={handleSaveEdit}>Simpan</button>
                            <button onClick={handleCancelEdit}>Batal</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEditProduct(product)}>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              Hapus
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
          {activeTab === "orders" && (
            <section className="admin-panel">
              <h2>Manajemen Pesanan</h2>
              <table>
                <thead>
                  <tr>
                    <th>ID Pesanan</th>
                    <th>Tanggal</th>
                    <th>Pelanggan</th>
                    <th>Total Harga</th>
                    <th>Status Pembayaran</th>
                    <th>Status Pesanan</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    // Cari transaksi yang sesuai dengan orderId
                    const transaction = transactions.find(
                      (t) => t.order_id === order.orderId
                    );

                    // Ubah tampilan 'settlement' menjadi 'SUCCESS'
                    const formattedTransactionStatus =
                      transaction?.status === "settlement"
                        ? "SUCCESS"
                        : transaction?.status;

                    return (
                      <React.Fragment key={order.id}>
                        <tr>
                          <td>{order.orderId}</td>
                          <td>{order.timestamp.toDate().toLocaleString()}</td>
                          <td>{order.customerName}</td>
                          <td>{formatRupiah(order.totalPrice)}</td>
                          <td>
                            {/* Tampilkan status berdasarkan transaksi Midtrans */}
                            {formattedTransactionStatus || "Pending"}
                          </td>
                          <td>
                            <select
                              value={order.orderStatus}
                              onChange={(e) =>
                                handleOrderStatusChange(
                                  order.id,
                                  e.target.value
                                )
                              }
                            >
                              <option value="Menunggu Konfirmasi">
                                Menunggu Konfirmasi
                              </option>
                              <option value="Sedang Diproses">
                                Sedang Diproses
                              </option>
                              <option value="Siap Dikirim">Siap Dikirim</option>
                              <option value="Selesai">Selesai</option>
                            </select>
                          </td>
                          <td>
                            <button
                              onClick={() =>
                                setShowDetail({
                                  [order.id]: !showDetail[order.id],
                                })
                              }
                            >
                              {showDetail[order.id] ? "Sembunyikan" : "Detail"}
                            </button>
                          </td>
                        </tr>
                        {/* Detail item ditampilkan jika tombol Detail di klik */}
                        {showDetail[order.id] && (
                          <tr>
                            <td colSpan={7}>
                              <table>
                                <thead>
                                  <tr>
                                    <th>Nama Item</th>
                                    <th>Jumlah</th>
                                    <th>Harga</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {order.items.map((item, index) => (
                                    <tr key={index}>
                                      <td>{item.name}</td>
                                      <td>{item.quantity}</td>
                                      <td>{formatRupiah(item.price)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;
