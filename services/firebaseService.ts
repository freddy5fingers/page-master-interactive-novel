import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, orderBy, deleteDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseConfig } from '../firebaseConfig';
import { Novel } from '../types';

// Initialize Firebase
// Note: This may fail if firebaseConfig is not filled out correctly.
let app;
try {
    app = initializeApp(firebaseConfig);
} catch(e) {
    console.error("Firebase initialization failed. Please check your firebaseConfig.ts", e);
}


export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// --- Authentication ---

export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<User> => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Error signing in with Google:", error);
        // Re-throw the error to be handled by the caller, allowing for specific error handling.
        throw error;
    }
};

export const logout = () => signOut(auth);

export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// --- Firestore ---

export const saveNovelForUser = async (userId: string, novel: Novel) => {
    try {
        const novelWithTimestamp = { ...novel, lastSaved: new Date() };
        const novelRef = doc(db, 'users', userId, 'novels', novel.id);
        await setDoc(novelRef, novelWithTimestamp, { merge: true });
    } catch (error) {
        console.error("Error saving novel to Firestore:", error);
        throw new Error("Failed to save novel to your account.");
    }
};

export const getAllNovelsForUser = async (userId: string): Promise<Novel[]> => {
    try {
        const novelsRef = collection(db, 'users', userId, 'novels');
        const q = query(novelsRef, orderBy('lastSaved', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as Novel);
    } catch (error) {
        console.error("Error getting all novels from Firestore:", error);
        throw new Error("Failed to load your saved novels.");
    }
};

export const deleteNovelForUser = async (userId: string, novelId: string) => {
    try {
        const novelRef = doc(db, 'users', userId, 'novels', novelId);
        await deleteDoc(novelRef);
    } catch (error) {
        console.error("Error deleting novel from Firestore:", error);
        throw new Error("Failed to delete the selected novel.");
    }
};


// --- Subscription & Payments (Stripe Integration via Cloud Functions) ---

// This function calls a Firebase Cloud Function named 'createStripeCheckoutSession'
// You will need to deploy this function to your Firebase project.
const createStripeCheckoutSession = httpsCallable(functions, 'createStripeCheckoutSession');

export const redirectToCheckout = async () => {
    try {
        // The cloud function needs the current user's UID to create a Stripe customer.
        if (!auth.currentUser) {
            throw new Error("User must be logged in to subscribe.");
        }

        const { data } = await createStripeCheckoutSession();
        const url = (data as any).url;

        if (url) {
            // Redirect the user to the Stripe Checkout page.
            window.location.href = url;
        } else {
            throw new Error("Could not get a checkout URL.");
        }
    } catch (error) {
        console.error("Could not create Stripe checkout session:", error);
        alert("Error: Could not initiate subscription process. Please try again later.");
    }
};

// This function checks the user's subscription status from Firestore.
// The subscription data in Firestore should be managed by your backend via Stripe webhooks.
export const isUserSubscribed = async (userId: string): Promise<boolean> => {
    try {
        const userSubRef = doc(db, 'subscriptions', userId);
        const docSnap = await getDoc(userSubRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            // Assuming the subscription document has a 'status' field.
            // Common statuses from Stripe are 'active', 'trialing', 'past_due', 'canceled'.
            return data.status === 'active' || data.status === 'trialing';
        }
        return false;
    } catch (error) {
        console.error("Error checking subscription status:", error);
        return false;
    }
};