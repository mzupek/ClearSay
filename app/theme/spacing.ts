/**
  Use these spacings for margins/paddings and other whitespace throughout your app.
 */
import { Dimensions } from 'react-native'

export const spacing = {
  micro: 2,
  tiny: 4,
  extraSmall: 8,
  small: 12,
  medium: 16,
  large: 24,
  extraLarge: 32,
  huge: 48,
  massive: 64,
}

export const isTablet = () => {
  const { width, height } = Dimensions.get('window')
  return Math.max(width, height) >= 768
}

export const getResponsiveSize = (mobileSize: number, tabletMultiplier = 1.5) => {
  return isTablet() ? mobileSize * tabletMultiplier : mobileSize
}

export const getResponsiveSpacing = (value: number) => {
  return getResponsiveSize(value, 1.3)
}
