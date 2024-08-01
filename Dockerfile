
# Usar una imagen base de Node.js con Alpine
FROM node:20.16.0

#crear carpeta 
RUN mkdir -p /Users/src/app

# Establecer el directorio de trabajo en el contenedor
WORKDIR /usr/src/app



#instalar git hub
RUN apt-get update && apt-get install -y git && apt-get clean


# clonar repo 
RUN git clone https://github.com/sikar12/avance-taller.git .


# Instalar dependencias
RUN npm install 

# Instalar Firebase 
RUN npm install firebase
# Instalar la versión específica de react-native-screens
RUN npm install react-native-screens@3.31.1

# Actualizar expo y react-native a las versiones esperadas
RUN npm install expo@~51.0.24 react-native@0.74.3

# Instalar expo-cli globalmente
RUN npm install -g expo-cli

# Instalar @expo/ngrok globalmente
RUN npm install -g @expo/ngrok@^4.1.0

# Copiar el resto del código de la aplicación al contenedor
COPY . .

# Exponer puerto 8081 que utiliza Expo
EXPOSE 8081

# Iniciar el proyecto
CMD ["npx", "expo", "start", "--tunnel"]
