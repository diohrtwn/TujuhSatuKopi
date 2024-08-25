import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { app, storeFirebase } from '../../firebaseConfig';

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userCartRef = doc(storeFirebase, "carts", user.uid);
        const cartSnapshot = await getDoc(userCartRef);
        if (cartSnapshot.exists()) {
          setCart(cartSnapshot.data().cart);
        }
        setUser(user);
      } else {
        setUser(null);
        setCart(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (user) => {
    const userCartRef = doc(storeFirebase, "carts", user.uid);
    const cartSnapshot = await getDoc(userCartRef);
    if (cartSnapshot.exists()) {
      setCart(cartSnapshot.data().cart);
    }
    setUser(user);
  };

  const logout = () => {
    const auth = getAuth(app);
    signOut(auth).then(() => {
      setUser(null);
      setCart(null);
    });
  };

  return (
    <UserContext.Provider value={{ user, login, logout, cart }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);