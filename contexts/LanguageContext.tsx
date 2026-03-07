
import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'EN' | 'FR';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const TRANSLATIONS: Record<string, Record<Language, string>> = {
    // Navigation & Portals
    'Dashboard': { EN: 'My Dashboard', FR: 'Mon Tableau de Bord' },
    'My Dashboard': { EN: 'My Dashboard', FR: 'Mon Tableau de Bord' },
    'My Courses': { EN: 'My Courses', FR: 'Mes Cours' },
    'AI Tutor': { EN: 'AI Tutor', FR: 'Tuteur IA' },
    'Practice': { EN: 'Practice', FR: 'Pratique' },
    'Admin Console': { EN: 'Admin Console', FR: 'Console Admin' },
    'Learner View': { EN: 'Learner View', FR: 'Vue Apprenant' },
    'Compliance Reports': { EN: 'Compliance Reports', FR: 'Rapports de Conformité' },
    'Announcements': { EN: 'Announcements', FR: 'Annonces' },
    'Admin': { EN: 'Admin', FR: 'Administration' },
    'Reporting': { EN: 'Reporting', FR: 'Rapports' },
    'Updates': { EN: 'Updates', FR: 'Mises à jour' },
    'Simulator': { EN: 'Simulator', FR: 'Simulateur' },
    'Public Verify': { EN: 'Public Verify', FR: 'Vérification Publique' },
    'Audit Log': { EN: 'Audit Log', FR: 'Journal d\'Audit' },
    
    // Header & Menus
    'Cycle User / Role': { EN: 'Cycle User / Role', FR: 'Changer d\'Utilisateur' },
    'Demo Menu': { EN: 'Demo Menu', FR: 'Menu Démo' },
    'Open Simulator': { EN: 'Open Simulator', FR: 'Ouvrir le Simulateur' },
    'Viewing as': { EN: 'Viewing as', FR: 'Vue en tant que' },
    'Log Out': { EN: 'Log Out', FR: 'Se Déconnecter' },
    'Back to Home': { EN: 'Back to Home', FR: 'Retour à l\'Accueil' },
    'Reset Demo Data': { EN: 'Reset Demo Data', FR: 'Réinitialiser les Données' },
    
    // Learner Tabs
    'Courses': { EN: 'Courses', FR: 'Cours' },
    'Onboarding': { EN: 'Onboarding', FR: 'Intégration' },
    'Documents': { EN: 'Documents', FR: 'Documents' },
    'Certificates': { EN: 'Certificates', FR: 'Certificats' },
    'Notifications': { EN: 'Notifications', FR: 'Notifications' },
    'Profile': { EN: 'Profile', FR: 'Profil' },
    
    // Admin Tabs
    'Quizzes': { EN: 'Quizzes', FR: 'Quiz' },
    'Volunteers': { EN: 'Volunteers', FR: 'Bénévoles' },
    'Roles': { EN: 'Roles & Requirements', FR: 'Rôles & Exigences' },
    'Reports': { EN: 'Reports', FR: 'Rapports' },
    'Settings': { EN: 'Settings', FR: 'Paramètres' },

    // Common UI
    'Search...': { EN: 'Search...', FR: 'Rechercher...' },
    'Edit': { EN: 'Edit', FR: 'Modifier' },
    'Delete': { EN: 'Delete', FR: 'Supprimer' },
    'Cancel': { EN: 'Cancel', FR: 'Annuler' },
    'Save': { EN: 'Save', FR: 'Enregistrer' },
    'Submit': { EN: 'Submit', FR: 'Soumettre' },
    'Pending Review': { EN: 'Pending Review', FR: 'En Attente' },
    'Approved': { EN: 'Approved', FR: 'Approuvé' },
    'Rejected': { EN: 'Rejected', FR: 'Rejeté' },
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('EN');

    const t = (key: string): string => {
        if (!TRANSLATIONS[key]) return key;
        return TRANSLATIONS[key][language];
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};
