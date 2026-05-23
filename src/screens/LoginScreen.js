import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { COLORS } from '../constants';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const validateEmail = value => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    };

    const validate = () => {
        const newErrors = {};
        if (!email) {
            newErrors.email = 'El correo es requerido';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Correo inválido';
        }
        if (!password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (password.length < 6) {
            newErrors.password = 'Mínimo 6 caracteres';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = () => {
        if (validate()) {
            // Firebase auth goes here
            console.log('Login:', email, password);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.appName}>UberClone</Text>
                    <Text style={styles.subtitle}>Tus viajes más parchados</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Text style={styles.formTitle}>Iniciar Sesión</Text>

                    {/* Email */}
                    <Text style={styles.label}>Correo electrónico</Text>
                    <TextInput
                        style={[styles.input, errors.email && styles.inputError]}
                        placeholder="ejemplo@correo.com"
                        placeholderTextColor={COLORS.gray}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={text => {
                            setEmail(text);
                            setErrors(prev => ({ ...prev, email: null }));
                        }}
                    />
                    {errors.email && (
                        <Text style={styles.errorText}>{errors.email}</Text>
                    )}

                    {/* Password */}
                    <Text style={styles.label}>Contraseña</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={[styles.passwordInput, errors.password && styles.inputError]}
                            placeholder="Mínimo 6 caracteres"
                            placeholderTextColor={COLORS.gray}
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={text => {
                                setPassword(text);
                                setErrors(prev => ({ ...prev, password: null }));
                            }}
                        />
                        <TouchableOpacity
                            style={styles.eyeButton}
                            onPress={() => setShowPassword(!showPassword)}>
                            <Text style={styles.eyeText}>
                                {showPassword ? '🙈' : '👁️'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {errors.password && (
                        <Text style={styles.errorText}>{errors.password}</Text>
                    )}

                    {/* Forgot password */}
                    <TouchableOpacity style={styles.forgotButton}>
                        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>

                    {/* Login Button */}
                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>Ingresar</Text>
                    </TouchableOpacity>

                    {/* Register */}
                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>¿No tienes cuenta? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.registerLink}>Regístrate</Text>
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
        alignItems: 'center',
        paddingTop: 80,
        paddingBottom: 40,
    },
    appName: {
        fontSize: 42,
        fontWeight: 'bold',
        color: COLORS.white,
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.white,
        opacity: 0.85,
        marginTop: 8,
    },
    form: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 28,
        paddingTop: 36,
        paddingBottom: 40,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 6,
    },
    input: {
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: COLORS.dark,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputError: {
        borderColor: COLORS.error,
    },
    passwordContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: COLORS.dark,
    },
    eyeButton: {
        paddingHorizontal: 14,
        justifyContent: 'center',
    },
    eyeText: {
        fontSize: 18,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 12,
        marginBottom: 10,
        marginLeft: 4,
    },
    forgotButton: {
        alignSelf: 'flex-end',
        marginTop: 4,
        marginBottom: 24,
    },
    forgotText: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: '600',
    },
    loginButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 24,
        elevation: 3,
    },
    loginButtonText: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
    },
    registerText: {
        color: COLORS.gray,
        fontSize: 14,
    },
    registerLink: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default LoginScreen;