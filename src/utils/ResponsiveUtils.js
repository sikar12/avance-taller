// ResponsiveUtils.js
import { Dimensions, Platform, PixelRatio } from 'react-native';
import { 
  widthPercentageToDP as wp, 
  heightPercentageToDP as hp 
} from 'react-native-responsive-screen';

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive font size utility
const normalize = (size) => {
  const scale = SCREEN_WIDTH / 320; // based on standard screen width
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};

// Utility to create responsive styles
const createResponsiveStyle = (style) => {
  // Process margins and paddings
  const processed = {};
  
  Object.keys(style).forEach(key => {
    const value = style[key];
    
    // Handle percentage strings that were previously absolute positioning
    if (typeof value === 'string' && value.includes('%')) {
      processed[key] = value; // Keep percentage values as they are
    }
    // Convert numeric height/width to responsive units
    else if ((key.includes('height') || key === 'height') && typeof value === 'number') {
      processed[key] = hp(`${(value / SCREEN_HEIGHT) * 100}%`);
    }
    else if ((key.includes('width') || key === 'width') && typeof value === 'number') {
      processed[key] = wp(`${(value / SCREEN_WIDTH) * 100}%`);
    }
    // Convert top/bottom/left/right positioning to responsive units
    else if (['top', 'bottom', 'left', 'right'].includes(key) && typeof value === 'string') {
      // Remove the % sign and convert to number
      const numValue = parseFloat(value.replace('%', ''));
      processed[key] = key === 'top' || key === 'bottom' 
        ? hp(`${numValue}%`) 
        : wp(`${numValue}%`);
    }
    // Convert font sizes
    else if (key === 'fontSize' && typeof value === 'number') {
      processed[key] = normalize(value);
    }
    // Keep other properties as they are
    else {
      processed[key] = value;
    }
  });
  
  return processed;
};

export { wp, hp, normalize, createResponsiveStyle };