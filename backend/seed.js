import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/product.model.js'; // ES Modules mein .js extension lagana zaroori hota hai

dotenv.config();

const dummyProducts = [
    {
        name: "Apple MacBook Air M2",
        description: "Lightweight, incredibly fast, and featuring a beautiful Liquid Retina display.",
        price: 114900,
        category: "Laptops",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
        stock: 15
    },
    {
        name: "Sony WH-1000XM5",
        description: "Industry leading noise canceling wireless headphones.",
        price: 29990,
        category: "Audio",
        image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80",
        stock: 25
    },
    {
        name: "Nike Air Force 1 '07",
        description: "The radiance lives on in the Nike Air Force 1 '07, the b-ball icon that puts a fresh spin on what you know best.",
        price: 7495,
        category: "Shoes",
        image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
        stock: 40
    },
    {
        name: "Samsung Galaxy S24 Ultra",
        description: "Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity.",
        price: 129999,
        category: "Smartphones",
        image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80",
        stock: 10
    },
    {
        name: "Sony PlayStation 5",
        description: "Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio.",
        price: 49990,
        category: "Gaming",
        image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80",
        stock: 12
    },
    {
        name: "Apple Watch Series 9",
        description: "Smarter, brighter, and mightier. Features a new S9 chip, a super-bright display, and a magical new double tap gesture.",
        price: 41900,
        category: "Wearables",
        image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=800&q=80",
        stock: 20
    },
    {
        name: "Logitech MX Master 3S",
        description: "An iconic mouse remastered for ultimate tactility, performance, and flow. Features quiet clicks and an 8K DPI track-on-glass sensor.",
        price: 9999,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
        stock: 35
    },
    {
        name: "Keychron K2 Wireless Mechanical Keyboard",
        description: "A versatile wireless mechanical keyboard with a compact 84-key Mac layout, tactile switches, and RGB backlighting.",
        price: 8499,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80",
        stock: 18
    },
    {
        name: "iPad Air (5th Generation)",
        description: "Supercharged by the Apple M1 chip. Features a 10.9-inch Liquid Retina display, 12MP front camera with Center Stage, and 5G.",
        price: 54900,
        category: "Tablets",
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
        stock: 22
    },
    {
        name: "GoPro HERO 12 Black",
        description: "Incredible image quality, even better HyperSmooth video stabilization and a huge boost in battery life.",
        price: 37990,
        category: "Cameras",
        image: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=800&q=80",
        stock: 14
    },
    {
        name: "Apple AirPods Pro (2nd Gen)",
        description: "Rich, high-quality audio and magic like you’ve never heard. Next-level Active Noise Cancellation and Adaptive Transparency.",
        price: 24900,
        category: "Audio",
        image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
        stock: 50
    },
    {
        name: "LG 34-Inch UltraWide Monitor",
        description: "Elevate your home office equipment with this 21:9 ultrawide monitor featuring sRGB 99% color gamut and HDR10.",
        price: 26500,
        category: "Monitors",
        image: "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&w=800&q=80",
        stock: 8
    },
    {
        name: "Puma Classic Black Backpack",
        description: "A durable and stylish everyday backpack featuring multiple compartments, a laptop sleeve, and padded shoulder straps.",
        price: 1499,
        category: "Bags",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
        stock: 60
    },
    {
        name: "Amazon Kindle Paperwhite",
        description: "Now with a 6.8-inch display, thinner borders, adjustable warm light, up to 10 weeks of battery life, and 20% faster page turns.",
        price: 13999,
        category: "Tablets",
        image: "https://images.unsplash.com/photo-1592496001020-d31bd830651f?auto=format&fit=crop&w=800&q=80",
        stock: 28
    }
];

const seedDatabase = async () => {
    try {
        // Database se connect kar rahe hain
        await mongoose.connect(process.env.dburl);
        console.log("✅ Database connected successfully!");

        // Purana kachra saaf kar rahe hain (agar kuch hoga toh)
        await Product.deleteMany({});
        console.log("🧹 Cleared existing products.");

        // Naye dummy products insert kar rahe hain
        await Product.insertMany(dummyProducts);
        console.log("🎉 Dummy products added successfully!");

        // Kaam hone ke baad connection close
        mongoose.connection.close();
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        mongoose.connection.close();
    }
};

seedDatabase();