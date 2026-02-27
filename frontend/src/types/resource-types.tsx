// TypeScript types for the polymorphic resource system
// Handles diverse data: Academic, Entrance, Skill, General

export type ResourceCategory = 'ACADEMIC' | 'ENTRANCE' | 'SKILL' | 'GENERAL';

// ============ CATEGORY-SPECIFIC METADATA ============

/**
 * Academic Resources - University/College Materials
 * Examples: B.Sc, B.Tech, BBA, MBA, M.Sc, PhD
 */
export interface AcademicMetadata {
    course: string;      // "BSc IT", "B.Tech CSE", "MBA", "BBA", "M.Sc Physics"
    semester?: string;   // "Sem 1" through "Sem 8", or "Year 1", "Year 2"
    subject: string;     // "Data Structures", "Organic Chemistry", "Marketing"
    docType: string;     // "Notes", "Assignment", "Lab Manual", "Textbook", "Syllabus"
    university?: string; // Optional: "Mumbai University", "Delhi University"
}

/**
 * Entrance Exam Resources - Competitive Exams
 * Examples: GATE, JEE, NEET, CAT, UPSC, SSC, Bank PO
 */
export interface EntranceMetadata {
    exam: string;        // "GATE", "JEE Main", "JEE Advanced", "NEET", "CAT", "UPSC", "SSC CGL"
    year?: string;       // "2024", "2023", "2022"
    paperType: string;   // "PYQ", "Mock Test", "Syllabus", "Study Material", "Solution"
    branch?: string;     // For GATE: "CSE", "ECE", "ME" | For JEE: "Physics", "Chemistry", "Maths"
}

/**
 * Skill Resources - Career Development & Learning
 * Examples: Programming, Design, Marketing, Languages
 */
export interface SkillMetadata {
    topic: string;       // "React", "Python", "UI/UX Design", "Digital Marketing", "Data Science"
    level: string;       // "Beginner", "Intermediate", "Advanced"
    format?: string;     // "Tutorial", "Cheatsheet", "Roadmap", "Project Guide", "Interview Prep"
    skillCategory?: string; // "Programming", "Design", "Marketing", "Data", "DevOps"
}

/**
 * General Resources - Miscellaneous
 * Examples: Hobbies, General Knowledge, Life Skills
 */
export interface GeneralMetadata {
    topic?: string;      // Flexible topic
    description?: string; // Additional description
}

export type ResourceMetadata =
    | AcademicMetadata
    | EntranceMetadata
    | SkillMetadata
    | GeneralMetadata;

// ============ PREDEFINED OPTIONS ============

export const ACADEMIC_COURSES = [
    // Undergraduate
    'B.Sc IT', 'B.Sc CS', 'B.Sc Physics', 'B.Sc Chemistry', 'B.Sc Mathematics',
    'B.Tech CSE', 'B.Tech ECE', 'B.Tech ME', 'B.Tech Civil', 'B.Tech IT',
    'BBA', 'BCA', 'B.Com', 'BA Economics', 'BA English', 'BA Psychology',
    'MBBS', 'BDS', 'B.Pharma', 'BArch', 'LLB',
    // Postgraduate
    'M.Sc IT', 'M.Sc CS', 'M.Tech CSE', 'M.Tech ECE', 'MBA', 'MCA',
    'M.Com', 'MA Economics', 'MA English', 'PhD',
];

export const SEMESTERS = [
    'Sem 1', 'Sem 2', 'Sem 3', 'Sem 4',
    'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8',
    'Year 1', 'Year 2', 'Year 3', 'Year 4',
];

export const ACADEMIC_DOC_TYPES = [
    'Notes', 'Textbook', 'Assignment', 'Lab Manual',
    'Question Bank', 'Syllabus', 'Previous Year Paper', 'Solution',
];

export const ENTRANCE_EXAMS = [
    // Engineering
    'GATE', 'JEE Main', 'JEE Advanced', 'BITSAT', 'VITEEE',
    // Medical
    'NEET', 'AIIMS', 'JIPMER',
    // Management
    'CAT', 'MAT', 'XAT', 'SNAP', 'CMAT',
    // Government
    'UPSC CSE', 'UPSC CDS', 'SSC CGL', 'SSC CHSL', 'Bank PO', 'IBPS PO', 'RBI Grade B',
    // Law
    'CLAT', 'AILET',
    // Other
    'GRE', 'GMAT', 'TOEFL', 'IELTS',
];

export const EXAM_PAPER_TYPES = [
    'PYQ (Previous Year Questions)', 'Mock Test', 'Study Material',
    'Syllabus', 'Solution', 'Short Notes', 'Formula Sheet',
];

export const SKILL_TOPICS = [
    // Programming
    'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'TypeScript',
    'Angular', 'Vue.js', 'Django', 'Flask', 'Spring Boot', 'Go', 'Rust',
    // Data Science & AI
    'Machine Learning', 'Deep Learning', 'Data Science', 'TensorFlow', 'PyTorch',
    'SQL', 'Data Analytics', 'Power BI', 'Tableau',
    // Design
    'UI/UX Design', 'Figma', 'Adobe XD', 'Photoshop', 'Illustrator',
    'Graphic Design', 'Motion Graphics',
    // DevOps & Cloud
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Linux', 'Git',
    // Other
    'Digital Marketing', 'SEO', 'Content Writing', 'Video Editing',
];

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;

export const SKILL_FORMATS = [
    'Tutorial', 'Cheatsheet', 'Roadmap', 'Project Guide',
    'Interview Prep', 'Documentation', 'Course Notes',
];

// ============ CATEGORY LABELS & CONFIG ============

import React from 'react';
import {
    GraduationCapIcon,
    ClipboardListIcon,
    LightbulbIcon,
    BookIcon
} from '@/components/icons';

export const CATEGORY_CONFIG: Record<ResourceCategory, {
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}> = {
    ACADEMIC: {
        label: 'Academic',
        description: 'University & College study materials',
        icon: <GraduationCapIcon size={18} />,
        color: 'blue',
    },
    ENTRANCE: {
        label: 'Entrance Exams',
        description: 'Competitive exam preparation',
        icon: <ClipboardListIcon size={18} />,
        color: 'purple',
    },
    SKILL: {
        label: 'Skills & Career',
        description: 'Programming, Design & Career resources',
        icon: <LightbulbIcon size={18} />,
        color: 'green',
    },
    GENERAL: {
        label: 'General',
        description: 'Miscellaneous resources',
        icon: <BookIcon size={18} />,
        color: 'gray',
    },
};
