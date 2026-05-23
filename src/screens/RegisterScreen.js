import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {COLORS} from '../constants';

const RegisterScreen = ({navigation}) => {
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    gender: '',
    email: '',
    password: '',
    confirmPassword: '',
    language: 'es',
  });
  const [errors, setErrors] = useState({});
  const [showGenderMenu, setShowGenderMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const genderOptions = ['Masculino', 'Femenino', 'Vee Pabuence', 'No se ni que soy'];
  const languageOptions = [
    {label: 'Español', value: 'es'},
    {label: 'English', value: 'en'},
  ];

  const updateField = (field, value) => {
    setForm(prev => ({...prev, [field]: value}));
    setErrors(prev => ({...prev, [field]: null}));
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    if (!form.email) {
      newErrors.email = 'El correo es requerido';
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = 'Correo inválido';
    }
    if (!form.password || form.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (validate()) {
      // Firebase auth goes here
      console.log('Register:', form);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.appName}>UberClone</Text>
          <Text style={styles.subtitle}>Tus viajes más parchados</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Crear Cuenta</Text>

          {/* Full Name */}
          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={[styles.input, errors.fullName && styles.inputError]}
            placeholder="Máximo 50 caracteres"
            placeholderTextColor={COLORS.gray}
            maxLength={50}
            value={form.fullName}
            onChangeText={text => updateField('fullName', text)}
          />
          {errors.fullName && (
            <Text style={styles.errorText}>{errors.fullName}</Text>
          )}

          {/* Gender */}
          <Text style={styles.label}>Género</Text>
          <TouchableOpacity
            style={[styles.dropdown, errors.gender && styles.inputError]}
            onPress={() => setShowGenderMenu(!showGenderMenu)}>
            <Text
              style={[
                styles.dropdownText,
                !form.gender && {color: COLORS.gray},
              ]}>
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
                  onPress={() => {
                    updateField('gender', option);
                    setShowGenderMenu(false);
                  }}>
                  <Text style={styles.dropdownItemText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {errors.gender && (
            <Text style={styles.errorText}>{errors.gender}</Text>
          )}

          {/* Phone */}
          <Text style={styles.label}>Número de celular</Text>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            placeholder="Ej: 3001234567"
            placeholderTextColor={COLORS.gray}
            keyboardType="numeric"
            value={form.phone}
            onChangeText={text => updateField('phone', text)}
          />
          {errors.phone && (
            <Text style={styles.errorText}>{errors.phone}</Text>
          )}


          {/* Email */}
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="ejemplo@correo.com"
            placeholderTextColor={COLORS.gray}
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={text => updateField('email', text)}
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}

          {/* Password */}
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={COLORS.gray}
            secureTextEntry
            value={form.password}
            onChangeText={text => updateField('password', text)}
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          {/* Confirm Password */}
          <Text style={styles.label}>Confirmar contraseña</Text>
          <TextInput
            style={[styles.input, errors.confirmPassword && styles.inputError]}
            placeholder="Repite tu contraseña"
            placeholderTextColor={COLORS.gray}
            secureTextEntry
            value={form.confirmPassword}
            onChangeText={text => updateField('confirmPassword', text)}
          />
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}

          {/* Language */}
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
                  onPress={() => {
                    updateField('language', option.value);
                    setShowLangMenu(false);
                  }}>
                  <Text style={styles.dropdownItemText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Register Button */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Crear Cuenta</Text>
          </TouchableOpacity>

          {/* Login */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scroll: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.85,
    marginTop: 4,
  },
  form: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: COLORS.dark,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 4,
  },
  dropdown: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dropdownText: {
    fontSize: 15,
    color: COLORS.dark,
  },
  dropdownArrow: {
    fontSize: 12,
    color: COLORS.gray,
  },
  dropdownMenu: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  dropdownItemText: {
    fontSize: 15,
    color: COLORS.dark,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    elevation: 3,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: COLORS.gray,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;