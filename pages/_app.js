import { Typography } from '@mui/material';
import { useEffect, useState } from 'react'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  const [IsWeb3Enabled, setIsWeb3Enabled] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (typeof window.ethereum === 'undefined' && !window.ethereum.isMetaMask && initialized) return
    console.log('metaMask is installed')
    setIsWeb3Enabled(true)
    setInitialized(true)
  }, []);

  return !IsWeb3Enabled ?
    (<Typography variant="h1">Please enable Metamask</Typography>)
    :
    (<Component {...pageProps} />)

}


export default MyApp
