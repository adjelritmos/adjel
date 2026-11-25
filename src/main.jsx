import React from 'react'
import ReactDOM from 'react-dom/client'
import { Portifolio } from './portifolio'
import { HeroUIProvider } from '@heroui/react'
import './index.css'

ReactDOM.createRoot(document.getElementById('portifolio')).render(
  <React.StrictMode>
    <HeroUIProvider>
      <Portifolio />
    </HeroUIProvider>
  </React.StrictMode>
)
