import { Alert } from 'react-native';

export const validateField = (field, value, propertyData) => {
  const updatedData = { ...propertyData, [field]: value };

  switch (field) {
    case 'priceMin':
      if (parseFloat(value) >= parseFloat(updatedData.priceMax)) {
        Alert.alert('Error', 'El precio mínimo debe ser menor que el precio máximo');
        return false;
      }
      break;
    case 'priceMax':
      if (parseFloat(updatedData.priceMin) >= parseFloat(value)) {
        Alert.alert('Error', 'El precio mínimo debe ser menor que el precio máximo');
        return false;
      }
      break;
    case 'bedroomMin':
      if (parseFloat(value) >= parseFloat(updatedData.bedroomMax)) {
        Alert.alert('Error', 'El número mínimo de dormitorios debe ser menor que el número máximo de dormitorios');
        return false;
      }
      break;
    case 'bedroomMax':
      if (parseFloat(updatedData.bedroomMin) >= parseFloat(value)) {
        Alert.alert('Error', 'El número mínimo de dormitorios debe ser menor que el número máximo de dormitorios');
        return false;
      }
      break;
    case 'bathroomMin':
      if (parseFloat(value) >= parseFloat(updatedData.bathroomMax)) {
        Alert.alert('Error', 'El número mínimo de baños debe ser menor que el número máximo de baños');
        return false;
      }
      break;
    case 'bathroomMax':
      if (parseFloat(updatedData.bathroomMin) >= parseFloat(value)) {
        Alert.alert('Error', 'El número mínimo de baños debe ser menor que el número máximo de baños');
        return false;
      }
      break;
    case 'surfaceTotalMin':
      if (parseFloat(value) >= parseFloat(updatedData.surfaceTotalMax)) {
        Alert.alert('Error', 'La superficie total mínima debe ser menor que la superficie total máxima');
        return false;
      }
      break;
    case 'surfaceTotalMax':
      if (parseFloat(updatedData.surfaceTotalMin) >= parseFloat(value)) {
        Alert.alert('Error', 'La superficie total mínima debe ser menor que la superficie total máxima');
        return false;
      }
      break;
    case 'surfaceUtilMin':
      if (parseFloat(value) >= parseFloat(updatedData.surfaceUtilMax)) {
        Alert.alert('Error', 'La superficie útil mínima debe ser menor que la superficie útil máxima');
        return false;
      }
      break;
    case 'surfaceUtilMax':
      if (parseFloat(updatedData.surfaceUtilMin) >= parseFloat(value)) {
        Alert.alert('Error', 'La superficie útil mínima debe ser menor que la superficie útil máxima');
        return false;
      }
      break;
    case 'surfaceTerraceMin':
      if (parseFloat(value) >= parseFloat(updatedData.surfaceTerraceMax)) {
        Alert.alert('Error', 'La superficie de la terraza mínima debe ser menor que la superficie de la terraza máxima');
        return false;
      }
      break;
    case 'surfaceTerraceMax':
      if (parseFloat(updatedData.surfaceTerraceMin) >= parseFloat(value)) {
        Alert.alert('Error', 'La superficie de la terraza mínima debe ser menor que la superficie de la terraza máxima');
        return false;
      }
      break;
    default:
      break;
  }

  return true;
};

export const validateAllFields = (propertyData) => {
  const fieldsToValidate = [
    'priceMin', 'priceMax', 'bedroomMin', 'bedroomMax', 
    'bathroomMin', 'bathroomMax', 'surfaceTotalMin', 
    'surfaceTotalMax', 'surfaceUtilMin', 'surfaceUtilMax', 
    'surfaceTerraceMin', 'surfaceTerraceMax'
  ];

  for (let field of fieldsToValidate) {
    if (!validateField(field, propertyData[field], propertyData)) {
      return false;
    }
  }

  return true;
};