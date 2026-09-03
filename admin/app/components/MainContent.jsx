"use client"

import React, { useContext } from 'react'
import Dashboard from './Dashboard'
import { Context } from '../context/Context'
import AddProduct from './AddProduct';
import ProductList from './ProductList';
import Orders from './Orders';
import Profile from './Profile';

function MainContent() {
    const { link } = useContext(Context);
    return (
        <div className='w-full'>
            {link === "dashboard" ? <Dashboard /> : ""}
            {link === "add" ? <AddProduct /> : ""}
            {link === "product-list" ? <ProductList /> : ""}
            {link === "orders" ? <Orders /> : ""}
            {link === "profile" ? <Profile /> : ""}
        </div>
    )
}

export default MainContent
