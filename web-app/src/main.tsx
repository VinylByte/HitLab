import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 1. import `HeroUIProvider` component
import {HeroUIProvider} from "@heroui/react";

import { MantineProvider } from '@mantine/core';

import '@mantine/core/styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HeroUIProvider>
      <MantineProvider>
        <App />
      </MantineProvider>
    </HeroUIProvider>
  </StrictMode>,
)
