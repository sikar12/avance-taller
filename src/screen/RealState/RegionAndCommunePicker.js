import React, { useState } from "react";
import { View, Picker, StyleSheet } from "react-native";
import { RegionsAndCommunes } from "./RegionsAndCommunes";


export default function RegionAndCommunePicker({ onRegionChange, onCommuneChange }) {
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");
  const [communes, setCommunes] = useState([]);

  const handleRegionChange = (region) => {
    setSelectedRegion(region);
    const foundRegion = RegionsAndCommunes.find(r => r.region === region);
    setCommunes(foundRegion ? foundRegion.communes : []);
    setSelectedCommune("");
    onRegionChange(region);
  };

  const handleCommuneChange = (commune) => {
    setSelectedCommune(commune);
    onCommuneChange(commune);
  };

  return (
    <View>
      <Picker
        selectedValue={selectedRegion}
        onValueChange={handleRegionChange}
        style={styles.picker}
      >
        <Picker.Item label="Seleccione una región" value="" />
        {RegionsAndCommunes.map((item, index) => (
          <Picker.Item key={`${item.region}-${index}`} label={item.region} value={item.region} />
        ))}
      </Picker>

      {communes.length > 0 && (
        <Picker
          selectedValue={selectedCommune}
          onValueChange={handleCommuneChange}
          style={styles.picker}
        >
          <Picker.Item label="Seleccione una comuna" value="" />
          {communes.map((commune, index) => (
            <Picker.Item key={`${commune}-${index}`} label={commune} value={commune} />
          ))}
        </Picker>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  picker: {
    height: 50,
    width: "100%",
    marginVertical: 10,
  },
});