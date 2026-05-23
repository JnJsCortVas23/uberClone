import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Register new user
export const registerUser = async (email, password, userData) => {
    try {
        const userCredential = await auth().createUserWithEmailAndPassword(
            email,
            password,
        );
        const uid = userCredential.user.uid;

        // Save user data in Firestore
        await firestore().collection('users').doc(uid).set({
            fullName: userData.fullName,
            phone: userData.phone,
            gender: userData.gender,
            email: email,
            language: userData.language,
            createdAt: firestore.FieldValue.serverTimestamp(),
        });

        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Login user
export const loginUser = async (email, password) => {
    try {
        const userCredential = await auth().signInWithEmailAndPassword(
            email,
            password,
        );
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Logout user
export const logoutUser = async () => {
    try {
        await auth().signOut();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};