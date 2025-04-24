import { Dimensions } from 'react-native'

export const isTablet = () => {
  const { width, height } = Dimensions.get('window')
  return Math.max(width, height) >= 768
}

export const getResponsiveSize = (mobileSize: number, tabletMultiplier = 1.5) => {
  return isTablet() ? mobileSize * tabletMultiplier : mobileSize
}

export const getResponsiveSpacing = (spacing: number) => {
  return getResponsiveSize(spacing, 1.3)
}