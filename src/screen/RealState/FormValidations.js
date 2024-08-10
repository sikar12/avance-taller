
const validateMinMax = (min, max, fieldName) => {
  if (min !== undefined && max !== undefined && min > max) {
    return `${fieldName} Min should be less than ${fieldName} Max`;
  }
  return null;
};

const validateFields = (fields) => {
  const errors = {};

  const {
    priceMin,
    priceMax,
    bedroomMin,
    bedroomMax,
    bathroomMin,
    bathroomMax,
    surfaceTotalMin,
    surfaceTotalMax,
    surfaceUtilMin,
    surfaceUtilMax,
    surfaceTerraceMin,
    surfaceTerraceMax,
  } = fields;

  errors.price = validateMinMax(priceMin, priceMax, 'Price');
  errors.bedroom = validateMinMax(bedroomMin, bedroomMax, 'Bedroom');
  errors.bathroom = validateMinMax(bathroomMin, bathroomMax, 'Bathroom');
  errors.surfaceTotal = validateMinMax(surfaceTotalMin, surfaceTotalMax, 'Total Surface');
  errors.surfaceUtil = validateMinMax(surfaceUtilMin, surfaceUtilMax, 'Util Surface');
  errors.surfaceTerrace = validateMinMax(surfaceTerraceMin, surfaceTerraceMax, 'Terrace Surface');

  return errors;
};

export default validateFields;
