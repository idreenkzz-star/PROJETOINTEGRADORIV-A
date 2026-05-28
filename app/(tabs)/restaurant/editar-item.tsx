import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMenu } from "@/contexts/MenuContext";

function EditItemScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { menuItems, updateMenuItem } = useMenu();

  const item = menuItems.find((i) => i.id === id);

  if (!item) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Item não encontrado</Text>
      </View>
    );
  }

  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description);
  const [price, setPrice] = useState(String(item.price));
  const [category, setCategory] = useState(item.category);
  const [image, setImage] = useState<string | null>(item.image ?? null);

  // Selecionar imagem da galeria
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Permissão necessária para acessar a galeria.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!name || !price || !category) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
      return;
    }

    updateMenuItem(item.id, {
      name,
      description,
      price: Number(price),
      category,
      image: image || item.image,
    });

    Alert.alert("Sucesso", "Prato atualizado com sucesso!");
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Prato</Text>

      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.previewImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={{ color: "#999" }}>Sem imagem</Text>
          </View>
        )}
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>Trocar Imagem</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Nome</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Preço</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Categoria</Text>
      <TextInput style={styles.input} value={category} onChangeText={setCategory} />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Salvar Alterações</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default EditItemScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },

  // imagem
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  previewImage: {
    width: 140,
    height: 140,
    borderRadius: 12,
    marginBottom: 10,
  },
  imagePlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 12,
    backgroundColor: "#EEE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  imageButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  imageButtonText: {
    color: "#FFF",
    fontWeight: "700",
  },

  saveButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  saveText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 17,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
});
