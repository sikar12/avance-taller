import { StyleSheet, Platform, StatusBar } from 'react-native';
import { wp, hp } from "../../utils/ResponsiveUtils";

// Estilos comunes para los formularios de login
export const loginStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: hp("2%"),
  },
  logoContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: hp("2%"),
  },
  logo: {
    width: wp("70%"),
    height: hp("20%"),
  },
  formContainer: {
    width: wp("85%"),
    backgroundColor: "#FFFFFF",
    borderRadius: wp("8%"),
    padding: wp("5%"),
    marginBottom: hp("4%"),
  },
  title: {
    fontSize: wp("7%"),
    fontWeight: "bold",
    color: "#25272B",
    textAlign: "center",
    marginBottom: hp("2%"),
  },
  inputGroup: {
    marginBottom: hp("2%"),
    width: "100%",
  },
  inputLabel: {
    fontSize: wp("4%"),
    marginBottom: hp("0.5%"),
  },
  input: {
    height: hp("6%"),
    borderRadius: wp("8%"),
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: wp("4%"),
    width: "100%",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: wp("8%"),
    borderWidth: 1,
    paddingHorizontal: wp("4%"),
    height: hp("6%"),
  },
  passwordInput: {
    flex: 1,
    height: hp("6%"),
  },
  eyeButton: {
    padding: wp("2%"),
  },
  button: {
    borderRadius: wp("8%"),
    backgroundColor: "#009245",
    width: "65%",
    height: hp("6%"),
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: hp("2%"),
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: wp("4.5%"),
    fontWeight: "500",
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: hp("2%"),
  },
  linkText: {
    fontSize: wp("3.5%"),
  },
  linkButton: {
    marginLeft: wp("1%"),
  },
  linkButtonText: {
    fontSize: wp("3.5%"),
    color: "#009245",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: wp("3%"),
    marginTop: hp("1%"),
    marginLeft: wp("1%"),
  },
  // Estilos adicionales para los formularios antiguos (compatibilidad)
  container: {
    marginTop: "10%",
    width: "90%",
    top: "-18%",
    left: "5%",
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
  },
  Text: {
    marginTop: "3%",
    left: "5%",
  },
  inputtext: {
    height: 40,
    borderRadius: 30,
    left: "5%",
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    width: "90%",
    paddingHorizontal: 15,
  },
  buton: {
    borderRadius: 30,
    backgroundColor: "#009245",
    width: 236,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    left: "19%",
    marginTop: "5%",
    top: "4%",
  },
});

export default loginStyles;
