import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const resources = {
  en: {
    translation: {
      "welcome": "Welcome",
      "dashboard": "Dashboard",
      "students": "Students",
      "teachers": "Teachers",
      "classes": "Classes",
      "payments": "Payments",
      "logout": "Logout",
      "total_revenue": "Total Revenue",
      "pending": "pending",
      "quick_actions": "Quick Actions",
      "add_student": "Add Student",
      "add_teacher": "Add Teacher",
      "new_class": "New Class",
      "record_payment": "Record Payment",
      "recent_students": "Recent Students",
      "see_all": "See all",
      "settings": "Settings",
      "language": "Language",
      "change_language": "Change Language",
      "switch_to_fr": "Switch to French",
      "switch_to_en": "Switch to English",
      "payment_overview": "Payment Overview",
      "paid": "Paid",
      "pending_status": "Pending",
      "records": "records",
      "welcome_back": "Welcome back",
      "create_account": "Create account",
      "sign_in_subtitle": "Sign in to your admin account",
      "sign_up_subtitle": "Join our administration portal",
      "google_continue": "Continue with Google",
      "google_signup": "Sign up with Google",
      "or_with_email": "or {{action}} with email",
      "email_address": "Email Address",
      "password": "Password",
      "sign_in": "Sign In",
      "sign_up": "Sign Up",
      "no_account": "Don't have an account?",
      "has_account": "Already have an account?",
      "first_name": "First Name",
      "last_name": "Last Name",
      "username": "Username",
    }
  },
  fr: {
    translation: {
      "welcome": "Bienvenue",
      "dashboard": "Tableau de bord",
      "students": "Étudiants",
      "teachers": "Enseignants",
      "classes": "Classes",
      "payments": "Paiements",
      "logout": "Déconnexion",
      "total_revenue": "Revenu Total",
      "pending": "en attente",
      "quick_actions": "Actions Rapides",
      "add_student": "Ajouter un Étudiant",
      "add_teacher": "Ajouter un Enseignant",
      "new_class": "Nouvelle Classe",
      "record_payment": "Enregistrer un Paiement",
      "recent_students": "Étudiants Récents",
      "see_all": "Tout voir",
      "settings": "Paramètres",
      "language": "Langue",
      "change_language": "Changer la Langue",
      "switch_to_fr": "Passer au Français",
      "switch_to_en": "Passer à l'Anglais",
      "payment_overview": "Aperçu des Paiements",
      "paid": "Payé",
      "pending_status": "En attente",
      "records": "enregistrements",
      "welcome_back": "Bon retour",
      "create_account": "Créer un compte",
      "sign_in_subtitle": "Connectez-vous à votre compte admin",
      "sign_up_subtitle": "Rejoignez notre portail d'administration",
      "google_continue": "Continuer avec Google",
      "google_signup": "S'inscrire avec Google",
      "or_with_email": "ou {{action}} avec email",
      "email_address": "Adresse Email",
      "password": "Mot de passe",
      "sign_in": "Se connecter",
      "sign_up": "S'inscrire",
      "no_account": "Vous n'avez pas de compte ?",
      "has_account": "Vous avez déjà un compte ?",
      "first_name": "Prénom",
      "last_name": "Nom",
      "username": "Nom d'utilisateur",
    }
  }
};

const LANGUAGE_KEY = "user-language";

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
  if (!savedLanguage) {
    savedLanguage = "en";
  }

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: savedLanguage,
      fallbackLng: "en",
      interpolation: {
        escapeValue: false,
      },
    });
};

initI18n();

export default i18n;
