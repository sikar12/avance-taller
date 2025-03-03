import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DeleteP from "./src/screen/PropertyBrokerage/deleteP";
import CRUD from "./src/screen/PropertyBrokerage/property";
import UpdateProp from "./src/screen/PropertyBrokerage/updateProp";
import { Dimensions } from "react-native";
import Addproject from "./src/screen/RealState/Addproject";
import ListProjet from "./src/screen/RealState/Listprojet";
import Loggin from "./src/screen/Loggin/Homelogg";
import Register from "./src/screen/Loggin/Register";
import Form_np from "./src/screen/Loggin/Form_np";
import Verification from "./src/screen/Loggin/Verification";
import Singin from "./src/screen/Loggin/Singin";
import Form_inmo from "./src/screen/Loggin/Form_Inmo";
import Form_co from "./src/screen/Loggin/Form_co";
import Form_ac from "./src/screen/Loggin/Form_ac";
import Perfil from "./src/screen/RealState/Perfil";
import Agencymapa from "./src/screen/Agencybrokage/Agencymapa";
import Porfileseting from "./src/screen/Agencybrokage/Porfileseting";
import Addpublication from "./src/screen/Agencybrokage/Addpublication";
import Employed from "./src/screen/Agencybrokage/Employed";
import Meeting_date from "./src/screen/Agencybrokage/Meeting_date";
const Stack = createNativeStackNavigator();

const { width, height } = Dimensions.get("window");

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const horizontalScale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (horizontalScale(size) - size) * factor;

export { horizontalScale, verticalScale, moderateScale };

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Loggin" component={Loggin} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Form_np" component={Form_np} />
        <Stack.Screen name="Perfil" component={Perfil} />
        <Stack.Screen name="Inmo" component={Form_inmo} />
        <Stack.Screen name="Co" component={Form_co} />
        <Stack.Screen name="Ac" component={Form_ac} />
        <Stack.Screen name="Singin" component={Singin} />
        <Stack.Screen name="Verification" component={Verification} />
        <Stack.Screen name="Home" component={Agencymapa} />
        <Stack.Screen name="Pllist" component={ListProjet} />
        <Stack.Screen name="DeleteP" component={DeleteP} />
        <Stack.Screen name="UpdateProp" component={UpdateProp} />
        <Stack.Screen name="Porfileseting" component={Porfileseting} />
        <Stack.Screen name="Addpublication" component={Addpublication} />
        <Stack.Screen name="Employed" component={Employed} />
        <Stack.Screen name="Meeting_date" component={Meeting_date} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
