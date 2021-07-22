import {useState,useEffect, useCallback} from 'react'
import alanBtn from '@alan-ai/alan-sdk-web'
import { useCart  } from '../context/CartContext'
import storeItems from '../items.json'

const COMMANDS = {
    OPEN_CART: 'open-cart',
    CLOSE_CART: 'close-cart',
    ADD_ITEM: 'add-item',
    REMOVE_ITEM: 'remove-item',
    CHECKOUT: 'checkout'
}

export default function useAlan() {
    const [alanBtnInstance, setAlanBtnInstance] = useState()
    const { setShowCartItems, isCartEmpty, addToCart , removeFromCart, cart, checkout} = useCart()

    const openCart = useCallback(() => {
        if(isCartEmpty) {
            alanBtnInstance.playText('There are no items in the cart')    
        } else {
            alanBtnInstance.playText('opening cart')
            setShowCartItems(true);
        }
    },[alanBtnInstance,setShowCartItems,isCartEmpty])

    const closeCart = useCallback(() => {
        if(isCartEmpty) {
            alanBtnInstance.playText('Either way it it is empty!')    
        } else {
            alanBtnInstance.playText('closing the cart');
            setShowCartItems(false);
        }
        
    },[alanBtnInstance,isCartEmpty,setShowCartItems])

    const addItem = useCallback(({detail: {name,quantity}}) => {
        const item = storeItems.find(i => i.name.toLowerCase() === name.toLowerCase())
        if(item == null) {
            alanBtnInstance.playText(`I cannot find the ${name} item`)
        } else {
            addToCart(item.id, quantity)
            alanBtnInstance.playText(`added ${quantity} of the ${name} to your cart`)
        }
    },[alanBtnInstance,addToCart])

    const removeItem = useCallback(({detail: {name}}) => {
        const entry = cart.find(e => e.item.name.toLowerCase() === name.toLowerCase())
        if(entry == null) {
            alanBtnInstance.playText(`I cannot find the ${name} item`)
        } else {
            removeFromCart(entry.itemId)
            alanBtnInstance.playText(`removed ${name} from your cart`)
        }
    },[alanBtnInstance,removeFromCart,cart])

    const checkOut = useCallback(() => {
        if(isCartEmpty) {
            alanBtnInstance.playText("The cart does not have any items");
        } else {
            alanBtnInstance.playText("Checking out");
            setTimeout(() => checkout(),5000);
        } 
    },[alanBtnInstance,isCartEmpty,checkout])

    useEffect(() => {
        window.addEventListener(COMMANDS.OPEN_CART,openCart);
        window.addEventListener(COMMANDS.CLOSE_CART,closeCart);
        window.addEventListener(COMMANDS.ADD_ITEM,addItem);
        window.addEventListener(COMMANDS.REMOVE_ITEM,removeItem);
        window.addEventListener(COMMANDS.CHECKOUT,checkOut);


        return () => {
            window.removeEventListener(COMMANDS.OPEN_CART,openCart);
            window.removeEventListener(COMMANDS.CLOSE_CART,closeCart);
            window.removeEventListener(COMMANDS.ADD_ITEM,addItem);
            window.removeEventListener(COMMANDS.REMOVE_ITEM,removeItem);
            window.removeEventListener(COMMANDS.CHECKOUT,checkOut);
        }
    },[openCart,closeCart,addItem,removeItem,checkOut])

    useEffect(() => {
        if(alanBtnInstance != null) return 
        setAlanBtnInstance(alanBtn({
            key: process.env.REACT_APP_ALAN_KEY,
            onCommand: ({command,payload}) => {
                window.dispatchEvent(new CustomEvent(command,{detail: payload}));
            }
        }))
    },[alanBtnInstance])
    return null;
}
