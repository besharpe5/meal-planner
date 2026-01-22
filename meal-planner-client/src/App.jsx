import { useState } from 'react'
import './App.css'

// src/App.jsx
export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-blue-600">Tailwind is working!</h1>
      <button className="mt-4 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600">
        Test Button
      </button>
    </div>
  )
}
