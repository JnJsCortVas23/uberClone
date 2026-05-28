import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { COLORS } from '../constants';

const ProfileScreen = () => {
  const user = auth().currentUser;
    if (!user) return null;

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    gender: '',
    email: '',
    language: 'es',
  });
  const [errors, setErrors] = useState({});
  const [showGenderMenu, setShowGenderMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoURL, setPhotoURL] = useState('');

  const genderOptions = ['Masculino', 'Femenino', 'Vee Pabuence', 'Therian', 'No se ni que soy'];
  const languageOptions = [
    { label: 'Español', value: 'es' },
    { label: 'English', value: 'en' },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      const doc = await firestore().collection('users').doc(user.uid).get();
      if (doc.exists) {
        setForm(prev => ({
          ...prev,
          ...doc.data(),
          email: doc.data()?.email || user.email,
        }));
        setPhotoURL(doc.data()?.photoURL || ''); 
      }
    };
    fetchProfile();
  }, []);

  const handlePickPhoto = useCallback(() => { 
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, async (response) => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets[0];
      setPhotoURL(asset.uri);
      try {
        const ref = storage().ref(`avatars/${user.uid}.jpg`);
        await ref.putFile(asset.uri);
        const url = await ref.getDownloadURL();
        setPhotoURL(url);
        await firestore().collection('users').doc(user.uid).update({ photoURL: url });
      } catch (error) {
        Alert.alert('Error', 'Could not upload photo');
      }
    });
  }, [user]);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = useCallback(() => {
    const newErrors = {};
    if (!form.fullName || form.fullName.trim().length < 3) {
      newErrors.fullName = 'Ingresa tu nombre completo';
    } else if (form.fullName.length > 50) {
      newErrors.fullName = 'Máximo 50 caracteres';
    }
    if (!form.phone || !/^\d+$/.test(form.phone)) {
      newErrors.phone = 'Ingresa un número válido';
    }
    if (!form.gender) {
      newErrors.gender = 'Selecciona tu género';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await firestore().collection('users').doc(user.uid).update({
        fullName: form.fullName,
        phone: form.phone,
        gender: form.gender,
        language: form.language,
      });
      Alert.alert('¡Listo!', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Could not update profile');
    }
    setLoading(false);
  }, [form, validate]);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePickPhoto} style={styles.avatar}>
          {photoURL ? (
            <Image source={{ uri: photoURL }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {form.fullName ? form.fullName.charAt(0).toUpperCase() : '?'}
            </Text>
          )}
          <View style={styles.avatarBadge}>
            <Text style={{ color: 'white', fontSize: 12 }}>📷</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerName}>{form.fullName}</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Datos personales</Text>

        <Text style={styles.label}>Nombre completo</Text>
        <TextInput
          style={[styles.input, errors.fullName && styles.inputError]}
          value={form.fullName}
          maxLength={50}
          onChangeText={text => updateField('fullName', text)}
        />
        {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

        <Text style={styles.label}>Número de celular</Text>
        <TextInput
          style={[styles.input, errors.phone && styles.inputError]}
          value={form.phone}
          keyboardType="numeric"
          onChangeText={text => updateField('phone', text)}
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

        <Text style={styles.label}>Género</Text>
        <TouchableOpacity
          style={[styles.dropdown, errors.gender && styles.inputError]}
          onPress={() => setShowGenderMenu(!showGenderMenu)}>
          <Text style={[styles.dropdownText, !form.gender && { color: COLORS.gray }]}>
            {form.gender || 'Selecciona tu género'}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
        {showGenderMenu && (
          <View style={styles.dropdownMenu}>
            {genderOptions.map(option => (
              <TouchableOpacity
                key={option}
                style={styles.dropdownItem}
                onPress={() => { updateField('gender', option); setShowGenderMenu(false); }}>
                <Text style={styles.dropdownItemText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={form.email}
          editable={false}
        />

        <Text style={styles.label}>Idioma</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowLangMenu(!showLangMenu)}>
          <Text style={styles.dropdownText}>
            {languageOptions.find(l => l.value === form.language)?.label}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
        {showLangMenu && (
          <View style={styles.dropdownMenu}>
            {languageOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={styles.dropdownItem}
                onPress={() => { updateField('language', option.value); setShowLangMenu(false); }}>
                <Text style={styles.dropdownItemText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}>
          <Text style={styles.saveButtonText}>
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: COLORS.primary },
  avatarBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: COLORS.primary, borderRadius: 10, padding: 2,
  },
  headerName: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
  form: { padding: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.dark, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.dark, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.white, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 15, color: COLORS.dark, marginBottom: 6,
    borderWidth: 1, borderColor: COLORS.lightGray,
  },
  inputDisabled: { backgroundColor: COLORS.lightGray, color: COLORS.gray },
  inputError: { borderColor: COLORS.error },
  errorText: { color: COLORS.error, fontSize: 12, marginBottom: 10, marginLeft: 4 },
  dropdown: {
    backgroundColor: COLORS.white, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 13, marginBottom: 6,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.lightGray,
  },
  dropdownText: { fontSize: 15, color: COLORS.dark },
  dropdownArrow: { fontSize: 12, color: COLORS.gray },
  dropdownMenu: {
    backgroundColor: COLORS.white, borderRadius: 12,
    marginBottom: 8, elevation: 4,
    borderWidth: 1, borderColor: COLORS.lightGray,
  },
  dropdownItem: {
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.lightGray,
  },
  dropdownItemText: { fontSize: 15, color: COLORS.dark },
  saveButton: {
    backgroundColor: COLORS.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 16, elevation: 3,
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: COLORS.white, fontSize: 17, fontWeight: 'bold' },
});

export default ProfileScreen;