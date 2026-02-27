import { Resource, Domain, PlatformStats, User } from '@/types';

// Mock Users
export const mockUsers: User[] = [
    {
        id: '1',
        name: 'Arjun Sharma',
        email: 'arjun@example.com',
        avatar: '/avatars/user1.jpg',
        credits: 15,
        dailyCredits: 10,
        uploadCredits: 5,
        role: 'USER',
        createdAt: '2024-01-15T10:30:00Z',
    },
    {
        id: '2',
        name: 'Priya Patel',
        email: 'priya@example.com',
        credits: 42,
        dailyCredits: 10,
        uploadCredits: 5,
        role: 'USER',
        subscription: {
            id: 'sub_1',
            planId: 'plan_1',
            startDate: '2024-12-01T00:00:00Z',
            endDate: '2025-01-01T00:00:00Z',
            active: true,
        },
        createdAt: '2024-02-20T14:00:00Z',
    },
];

// Mock Resources
export const mockResources: Resource[] = [
    {
        id: '1',
        title: 'Complete Physics Notes - Class 12 CBSE',
        description: 'Comprehensive handwritten notes covering all chapters of Class 12 Physics including Electrostatics, Current Electricity, Magnetism, Optics, and Modern Physics. Includes solved numericals and important diagrams.',
        fileUrl: '/resources/physics-12.pdf',
        fileType: 'PDF',
        thumbnailUrl: '/thumbnails/physics.jpg',
        domain: 'School',
        subDomain: 'CBSE',
        stream: 'Science',
        subject: 'Physics',
        resourceType: 'NOTES',
        tags: ['physics', 'class-12', 'cbse', 'handwritten'],
        status: 'APPROVED',
        author: { id: '1', name: 'Arjun Sharma' },
        downloadCount: 1247,
        createdAt: '2024-11-15T10:30:00Z',
        updatedAt: '2024-11-15T10:30:00Z',
    },
    {
        id: '2',
        title: 'Data Structures & Algorithms - Complete Guide',
        description: 'In-depth guide covering Arrays, Linked Lists, Trees, Graphs, Sorting, Searching, and Dynamic Programming with code examples in C++ and Java.',
        fileUrl: '/resources/dsa-guide.pdf',
        fileType: 'PDF',
        domain: 'University',
        subDomain: 'Engineering',
        stream: 'Computer Science',
        subject: 'Data Structures',
        resourceType: 'GUIDE',
        tags: ['dsa', 'algorithms', 'programming', 'interview-prep'],
        status: 'APPROVED',
        author: { id: '2', name: 'Priya Patel' },
        downloadCount: 892,
        createdAt: '2024-11-10T08:00:00Z',
        updatedAt: '2024-11-10T08:00:00Z',
    },
    {
        id: '3',
        title: 'JEE Main 2024 - Previous Year Questions',
        description: 'Complete collection of JEE Main 2024 questions from all shifts with detailed solutions and explanations. Perfect for exam preparation.',
        fileUrl: '/resources/jee-2024-pyq.pdf',
        fileType: 'PDF',
        domain: 'Competitive Exams',
        subDomain: 'JEE',
        subject: 'Combined',
        resourceType: 'PYQ',
        tags: ['jee', 'pyq', '2024', 'solutions'],
        status: 'APPROVED',
        author: { id: '1', name: 'Arjun Sharma' },
        downloadCount: 2341,
        createdAt: '2024-10-05T12:00:00Z',
        updatedAt: '2024-10-05T12:00:00Z',
    },
    {
        id: '4',
        title: 'Organic Chemistry - Reaction Mechanisms',
        description: 'Detailed notes on all organic chemistry reaction mechanisms with electron flow diagrams. Covers SN1, SN2, E1, E2, addition, elimination, and rearrangement reactions.',
        fileUrl: '/resources/organic-chem.pdf',
        fileType: 'PDF',
        domain: 'School',
        subDomain: 'CBSE',
        stream: 'Science',
        subject: 'Chemistry',
        resourceType: 'NOTES',
        tags: ['chemistry', 'organic', 'mechanisms', 'reactions'],
        status: 'APPROVED',
        author: { id: '2', name: 'Priya Patel' },
        downloadCount: 756,
        createdAt: '2024-11-20T09:15:00Z',
        updatedAt: '2024-11-20T09:15:00Z',
    },
    {
        id: '5',
        title: 'NEET Biology - Chapter-wise Notes',
        description: 'Complete biology notes for NEET preparation covering Botany and Zoology. Includes NCERT-based content with additional concepts for competitive exams.',
        fileUrl: '/resources/neet-bio.pdf',
        fileType: 'PDF',
        domain: 'Competitive Exams',
        subDomain: 'NEET',
        subject: 'Biology',
        resourceType: 'NOTES',
        tags: ['neet', 'biology', 'ncert', 'medical'],
        status: 'APPROVED',
        author: { id: '1', name: 'Arjun Sharma' },
        downloadCount: 1823,
        createdAt: '2024-11-25T14:30:00Z',
        updatedAt: '2024-11-25T14:30:00Z',
    },
    {
        id: '6',
        title: 'Machine Learning Fundamentals',
        description: 'Comprehensive guide to Machine Learning covering supervised, unsupervised, and reinforcement learning with mathematical foundations and Python implementations.',
        fileUrl: '/resources/ml-guide.pdf',
        fileType: 'PDF',
        domain: 'University',
        subDomain: 'Engineering',
        stream: 'Computer Science',
        subject: 'Machine Learning',
        resourceType: 'GUIDE',
        tags: ['ml', 'ai', 'python', 'deep-learning'],
        status: 'APPROVED',
        author: { id: '2', name: 'Priya Patel' },
        downloadCount: 567,
        createdAt: '2024-12-01T11:00:00Z',
        updatedAt: '2024-12-01T11:00:00Z',
    },
    {
        id: '7',
        title: 'CAT 2024 Quantitative Aptitude',
        description: 'Previous year CAT questions with shortcuts and tricks for Quantitative Aptitude section. Includes number systems, algebra, geometry, and data interpretation.',
        fileUrl: '/resources/cat-quant.pdf',
        fileType: 'PDF',
        domain: 'Competitive Exams',
        subDomain: 'CAT',
        subject: 'Quantitative Aptitude',
        resourceType: 'PYQ',
        tags: ['cat', 'mba', 'quant', 'aptitude'],
        status: 'APPROVED',
        author: { id: '1', name: 'Arjun Sharma' },
        downloadCount: 423,
        createdAt: '2024-12-10T16:00:00Z',
        updatedAt: '2024-12-10T16:00:00Z',
    },
    {
        id: '8',
        title: 'English Literature - Shakespeare Analysis',
        description: 'In-depth analysis of Shakespeare\'s major works including Hamlet, Macbeth, Othello, and King Lear. Perfect for BA English students and literature enthusiasts.',
        fileUrl: '/resources/shakespeare.pdf',
        fileType: 'PDF',
        domain: 'University',
        subDomain: 'Arts',
        stream: 'English Literature',
        subject: 'English',
        resourceType: 'NOTES',
        tags: ['shakespeare', 'literature', 'drama', 'analysis'],
        status: 'APPROVED',
        author: { id: '2', name: 'Priya Patel' },
        downloadCount: 234,
        createdAt: '2024-12-15T10:00:00Z',
        updatedAt: '2024-12-15T10:00:00Z',
    },
];

// Mock Domains (Category Hierarchy)
export const mockDomains: Domain[] = [
    {
        id: '1',
        name: 'School',
        slug: 'school',
        subDomains: [
            {
                id: '1-1',
                name: 'CBSE',
                slug: 'cbse',
                streams: [
                    {
                        id: '1-1-1',
                        name: 'Science',
                        slug: 'science',
                        subjects: [
                            { id: 's1', name: 'Physics', slug: 'physics' },
                            { id: 's2', name: 'Chemistry', slug: 'chemistry' },
                            { id: 's3', name: 'Biology', slug: 'biology' },
                            { id: 's4', name: 'Mathematics', slug: 'mathematics' },
                        ],
                    },
                    {
                        id: '1-1-2',
                        name: 'Commerce',
                        slug: 'commerce',
                        subjects: [
                            { id: 's5', name: 'Accountancy', slug: 'accountancy' },
                            { id: 's6', name: 'Business Studies', slug: 'business-studies' },
                            { id: 's7', name: 'Economics', slug: 'economics' },
                        ],
                    },
                ],
            },
            {
                id: '1-2',
                name: 'ICSE',
                slug: 'icse',
                streams: [
                    {
                        id: '1-2-1',
                        name: 'Science',
                        slug: 'science',
                        subjects: [
                            { id: 's8', name: 'Physics', slug: 'physics' },
                            { id: 's9', name: 'Chemistry', slug: 'chemistry' },
                            { id: 's10', name: 'Biology', slug: 'biology' },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: '2',
        name: 'University',
        slug: 'university',
        subDomains: [
            {
                id: '2-1',
                name: 'Engineering',
                slug: 'engineering',
                streams: [
                    {
                        id: '2-1-1',
                        name: 'Computer Science',
                        slug: 'computer-science',
                        subjects: [
                            { id: 's11', name: 'Data Structures', slug: 'data-structures' },
                            { id: 's12', name: 'Algorithms', slug: 'algorithms' },
                            { id: 's13', name: 'Database Systems', slug: 'database-systems' },
                            { id: 's14', name: 'Machine Learning', slug: 'machine-learning' },
                        ],
                    },
                    {
                        id: '2-1-2',
                        name: 'Electrical',
                        slug: 'electrical',
                        subjects: [
                            { id: 's15', name: 'Circuit Theory', slug: 'circuit-theory' },
                            { id: 's16', name: 'Power Systems', slug: 'power-systems' },
                        ],
                    },
                ],
            },
            {
                id: '2-2',
                name: 'Arts',
                slug: 'arts',
                streams: [
                    {
                        id: '2-2-1',
                        name: 'English Literature',
                        slug: 'english-literature',
                        subjects: [
                            { id: 's17', name: 'English', slug: 'english' },
                            { id: 's18', name: 'Literary Criticism', slug: 'literary-criticism' },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: '3',
        name: 'Competitive Exams',
        slug: 'competitive-exams',
        subDomains: [
            {
                id: '3-1',
                name: 'JEE',
                slug: 'jee',
                streams: [
                    {
                        id: '3-1-1',
                        name: 'JEE Main',
                        slug: 'jee-main',
                        subjects: [
                            { id: 's19', name: 'Physics', slug: 'physics' },
                            { id: 's20', name: 'Chemistry', slug: 'chemistry' },
                            { id: 's21', name: 'Mathematics', slug: 'mathematics' },
                        ],
                    },
                ],
            },
            {
                id: '3-2',
                name: 'NEET',
                slug: 'neet',
                streams: [
                    {
                        id: '3-2-1',
                        name: 'NEET UG',
                        slug: 'neet-ug',
                        subjects: [
                            { id: 's22', name: 'Physics', slug: 'physics' },
                            { id: 's23', name: 'Chemistry', slug: 'chemistry' },
                            { id: 's24', name: 'Biology', slug: 'biology' },
                        ],
                    },
                ],
            },
            {
                id: '3-3',
                name: 'CAT',
                slug: 'cat',
                streams: [
                    {
                        id: '3-3-1',
                        name: 'MBA Entrance',
                        slug: 'mba-entrance',
                        subjects: [
                            { id: 's25', name: 'Quantitative Aptitude', slug: 'quant' },
                            { id: 's26', name: 'Verbal Ability', slug: 'verbal' },
                            { id: 's27', name: 'Logical Reasoning', slug: 'logical-reasoning' },
                        ],
                    },
                ],
            },
        ],
    },
];

// Platform Statistics
export const mockStats: PlatformStats = {
    totalResources: 12500,
    totalUsers: 45000,
    totalDownloads: 156000,
    categories: 150,
};

// Resource Types for filters
export const resourceTypes = [
    { value: 'NOTES', label: 'Notes' },
    { value: 'GUIDE', label: 'Guides' },
    { value: 'PYQ', label: 'Previous Year Questions' },
    { value: 'SOLUTION', label: 'Solutions' },
];

// Featured Categories for home page
export const featuredCategories = [
    { name: 'JEE Preparation', icon: '🎯', count: 1250, slug: 'jee' },
    { name: 'NEET Resources', icon: '🏥', count: 980, slug: 'neet' },
    { name: 'CBSE Notes', icon: '📚', count: 2340, slug: 'cbse' },
    { name: 'Engineering', icon: '⚙️', count: 1560, slug: 'engineering' },
    { name: 'CAT/MBA', icon: '📈', count: 670, slug: 'cat' },
    { name: 'UPSC', icon: '🏛️', count: 890, slug: 'upsc' },
];
