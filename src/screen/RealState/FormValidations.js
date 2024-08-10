// Función para validar si el valor mínimo es menor que el valor máximo
const validateMinMax = (min, max, fieldName) => {
  if (min !== undefined && max !== undefined && min > max) {
    return `${fieldName} Min should be less than ${fieldName} Max`;
  }
  return null;
};

// Función principal de validación que utiliza la función validateMinMax
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

// Función para obtener los valores del DOM y validar
const getFieldsFromDOMAndValidate = () => {
  if (typeof document !== 'undefined') {
    const fields = {
      priceMin: Number(document.getElementById('priceMin').value),
      priceMax: Number(document.getElementById('priceMax').value),
      bedroomMin: Number(document.getElementById('bedroomMin').value),
      bedroomMax: Number(document.getElementById('bedroomMax').value),
      bathroomMin: Number(document.getElementById('bathroomMin').value),
      bathroomMax: Number(document.getElementById('bathroomMax').value),
      surfaceTotalMin: Number(document.getElementById('surfaceTotalMin').value),
      surfaceTotalMax: Number(document.getElementById('surfaceTotalMax').value),
      surfaceUtilMin: Number(document.getElementById('surfaceUtilMin').value),
      surfaceUtilMax: Number(document.getElementById('surfaceUtilMax').value),
      surfaceTerraceMin: Number(document.getElementById('surfaceTerraceMin').value),
      surfaceTerraceMax: Number(document.getElementById('surfaceTerraceMax').value),
    };

    // Imprimir los valores obtenidos del DOM
    console.log('Valores obtenidos del DOM:', fields);

    const errors = validateFields(fields);

    // Filtrar nulls para mostrar solo errores presentes
    const filteredErrors = Object.fromEntries(
      Object.entries(errors).filter(([key, value]) => value !== null)
    );

    if (Object.keys(filteredErrors).length > 0) {
      console.log('Errores de validación:', filteredErrors);
    } else {
      console.log('Todos los campos son válidos');
      // Aquí puedes continuar con el proceso, como enviar el formulario
    }
  } else {
    console.error('El objeto document no está disponible.');
  }
};

// Ejemplo de cómo podrías llamar a la función de validación
if (typeof document !== 'undefined') {
  document.getElementById('submitButton').addEventListener('click', getFieldsFromDOMAndValidate);
}