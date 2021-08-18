import { extendTheme } from '@chakra-ui/react'

const theme = {
  colors: {
    transparent: "transparent",
    black: "#030303",
    white: "#fff",
    grey: {
      600: "#718096",
      400: "#A0AEC0",
      20: "#F7FAFC",
    },
  },
  fonts: {
      primary: "Roboto, sans-serif",
      heading: "Roboto, sans-serif",
      body: "Roboto, sans-serif"
  },
  config: {
      useSystemColorMode: false,
  },
}

export default extendTheme(theme);