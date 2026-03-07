
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { PersonaType } from '../types';

interface Terminology {
    learner: string;
    learners: string;
    program: string;
    programs: string;
    manager: string;
    managerView: string;
    compliance: string;
    readiness: string;
}

interface PersonaConfig {
    type: PersonaType;
    label: string;
    accentColor: string;
    terminology: Terminology;
}

const PERSONA_CONFIGS: Record<PersonaType, PersonaConfig> = {
    'Non-Profit': {
        type: 'Non-Profit',
        label: 'Non-Profit Org',
        accentColor: '#10B981', // Emerald 500
        terminology: {
            learner: 'Volunteer',
            learners: 'Volunteers',
            program: 'Training Path',
            programs: 'Training Paths',
            manager: 'Coordinator',
            managerView: 'Coordinator View',
            compliance: 'Volunteer Compliance',
            readiness: 'Volunteer Readiness'
        }
    },
    'University': {
        type: 'University',
        label: 'Higher Ed',
        accentColor: '#2563EB', // Blue 600
        terminology: {
            learner: 'Student',
            learners: 'Students',
            program: 'Credential',
            programs: 'Credentials',
            manager: 'Placement Lead',
            managerView: 'Placement View',
            compliance: 'Institutional Compliance',
            readiness: 'Clinical Readiness'
        }
    },
    'Business': {
        type: 'Business',
        label: 'Enterprise',
        accentColor: '#1E293B', // Slate 800
        terminology: {
            learner: 'Employee',
            learners: 'Employees',
            program: 'Qualification',
            programs: 'Qualifications',
            manager: 'Operations Manager',
            managerView: 'Operations Console',
            compliance: 'Corporate Compliance',
            readiness: 'Workforce Readiness'
        }
    }
};

interface PersonaContextType {
    persona: PersonaConfig;
    setPersona: (type: PersonaType) => void;
    pt: (key: keyof Terminology) => string;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export const PersonaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activePersonaType, setActivePersonaType] = useState<PersonaType>(() => {
        return (localStorage.getItem('persona_type') as PersonaType) || 'Non-Profit';
    });

    const persona = PERSONA_CONFIGS[activePersonaType];

    useEffect(() => {
        localStorage.setItem('persona_type', activePersonaType);
        // Inject color variables for Tailwind
        document.documentElement.style.setProperty('--persona-accent', persona.accentColor);
    }, [activePersonaType, persona]);

    const setPersona = (type: PersonaType) => setActivePersonaType(type);

    const pt = (key: keyof Terminology): string => persona.terminology[key];

    return (
        <PersonaContext.Provider value={{ persona, setPersona, pt }}>
            {children}
        </PersonaContext.Provider>
    );
};

export const usePersona = () => {
    const context = useContext(PersonaContext);
    if (!context) throw new Error('usePersona must be used within PersonaProvider');
    return context;
};
