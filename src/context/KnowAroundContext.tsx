import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { isFirebaseConfigured, auth, db } from '../services/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  arrayUnion, 
  increment 
} from 'firebase/firestore';
import { 
  signInWithPhoneNumber,
  signOut,
  updateProfile
} from 'firebase/auth';
import { Alert } from 'react-native';

// Types
export interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  membersCount: number;
  members: string[];
}

export interface GroupPost {
  id: string;
  groupId: string;
  authorName: string;
  authorEmail: string;
  avatarUrl?: string;
  content: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
  replies?: Comment[];
}

export interface Post {
  id: string;
  author: string;
  avatar: string;
  location: string;
  time: string;
  verified: boolean;
  content: string;
  image?: string;
  likes: number;
  commentsCount: number;
  comments: Comment[];
  isLiked: boolean;
  isBookmarked: boolean;
  category: 'News' | 'Alert' | 'Event' | 'Community Update';
  distance: string;
  readTime?: string;
  lat?: number;
  lng?: number;
}

export interface Professional {
  id: string;
  name: string;
  avatar: string;
  profession: 'Electrician' | 'Plumber' | 'Carpenter' | 'AC Technician' | 'Driver' | 'Gig Worker' | 'Other';
  rating: number;
  reviewsCount: number;
  distance: number;
  location: string;
  phone: string;
  whatsapp: string;
  verified: boolean;
  availability: 'Available' | 'Busy' | 'Unavailable';
  lat: number;
  lng: number;
}

export interface DirectoryItem {
  id: string;
  name: string;
  category: 'Hospital' | 'ATM' | 'Medical Shop' | 'Restaurant' | 'Supermarket' | 'Petrol Bunk' | 'School' | 'Salon' | 'Police Station' | 'Other';
  rating: number;
  distance: number;
  openStatus: 'Open' | 'Closed';
  location: string;
  phone: string;
  lat: number;
  lng: number;
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  level: 'warning' | 'danger' | 'info';
  location: string;
  time: string;
  lat: number;
  lng: number;
  author?: string;
  avatar?: string;
}

export interface JobVacancy {
  id: string;
  title: string;
  company: string;
  salary: string;
  type: string;
  location: string;
  distance: number;
  lat: number;
  lng: number;
  phone: string;
  applied?: boolean;
}

export interface KnowAroundContextProps {
  user: { name: string; email: string } | null;
  login: (phone: string) => Promise<boolean>;
  googleLogin: () => void;
  register: (name: string, phone: string) => Promise<boolean>;
  logout: () => Promise<void>;
  currentUser: { name: string; avatar: string; location: string };
  updateProfileDetails: (name: string, email?: string) => void;
  activeLocation: string;
  setActiveLocation: (loc: string) => void;
  feeds: Post[];
  professionals: Professional[];
  directory: DirectoryItem[];
  alerts: AlertItem[];
  jobs: JobVacancy[];
  onboardingCompleted: boolean;
  setOnboardingCompleted: (val: boolean) => void;
  justRegistered: boolean;
  setJustRegistered: (val: boolean) => void;
  userRole: 'user' | 'professional' | null;
  setUserRole: (role: 'user' | 'professional' | null) => void;
  userAddress: { street: string; place: string; city: string; state: string; pin: string; phone: string } | null;
  setUserAddress: (address: { street: string; place: string; city: string; state: string; pin: string; phone: string }) => void;
  selectedCategory: 'professionals' | 'alerts' | 'jobs' | 'directory' | 'all';
  setSelectedCategory: (cat: 'professionals' | 'alerts' | 'jobs' | 'directory' | 'all') => void;
  selectedProfession: string;
  setSelectedProfession: (prof: string) => void;
  distanceFilter: string;
  setDistanceFilter: (dist: string) => void;
  ratingsFilter: string;
  setRatingsFilter: (rating: string) => void;
  addPost: (content: string, category: 'News' | 'Alert' | 'Event' | 'Community Update', image?: string) => void;
  likePost: (postId: string) => void;
  bookmarkPost: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  addAlert: (title: string, description: string, level: 'warning' | 'danger' | 'info', lat: number, lng: number) => void;
  applyJob: (jobId: string) => void;
  registerBusiness: (business: { name: string; profession: string; phone: string; street: string; place: string; lat?: number; lng?: number }) => Promise<void>;
  composerVisible: boolean;
  setComposerVisible: (val: boolean) => void;
  userLocation: { latitude: number; longitude: number; accuracy: number | null } | null;
  setUserLocation: (loc: { latitude: number; longitude: number; accuracy: number | null } | null) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  groups: Group[];
  groupPosts: GroupPost[];
  joinGroup: (groupId: string) => Promise<void>;
  postToGroup: (groupId: string, content: string) => Promise<void>;
}

const KnowAroundContext = createContext<KnowAroundContextProps | undefined>(undefined);

const SEED_POSTS: Post[] = [
  {
    id: 'p1',
    author: 'Olivia Cooke',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    location: 'Heritage Town',
    time: '1w',
    verified: true,
    category: 'Community Update',
    distance: '300m away',
    content: "Good morning Heritage Town! 🌸 Caught this beautiful view of the bougainvillea spilling over the classic yellow heritage walls on my morning walk. Stop by the local French bakery for some fresh croissants if you are out today! 🥐☕",
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800',
    likes: 16,
    commentsCount: 2,
    isLiked: false,
    isBookmarked: false,
    lat: 11.9330,
    lng: 79.8320,
    comments: [
      {
        id: 'c1',
        author: 'Ramesh Kumar',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        text: 'I have two extra louvred doors in my garage, you can take them!',
        time: '6d'
      },
      {
        id: 'c2',
        author: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        text: 'This sounds like an amazing reuse project. Good luck!',
        time: '5d'
      }
    ]
  },
  {
    id: 'p2',
    author: 'Neighborhood Safety Committee',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    location: 'White Town',
    time: '2d',
    verified: true,
    category: 'Alert',
    distance: '100m away',
    content: 'CRITICAL ALERT: Power cut scheduled for tomorrow, Tuesday from 10 AM to 2 PM in White Town for cable grid maintenance. Please secure water supply beforehand.',
    likes: 34,
    commentsCount: 0,
    isLiked: false,
    isBookmarked: false,
    lat: 11.9318,
    lng: 79.8315,
    comments: []
  },
  {
    id: 'p3',
    author: 'Pondy News Daily',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
    location: 'Goubert Avenue',
    time: '4d',
    verified: true,
    category: 'News',
    distance: '1.4km away',
    content: 'Traffic diversion on Beach Road (Goubert Avenue) this Sunday evening due to the annual Heritage Walkathon. Avoid Beach Road from 4 PM to 8 PM.',
    likes: 45,
    commentsCount: 0,
    isLiked: false,
    isBookmarked: false,
    lat: 11.9300,
    lng: 79.8330,
    comments: []
  },
  {
    id: 'p4',
    author: 'Sunita Krishnan',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    location: 'White Town',
    time: '3h',
    verified: false,
    category: 'Alert',
    distance: '50m away',
    content: '⚠️ LOST PET ALERT: Our Golden Retriever, Bella, went missing near Canal Street. She is wearing a red collar and is extremely friendly. Please ping if spotted!',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800',
    likes: 28,
    commentsCount: 4,
    isLiked: false,
    isBookmarked: false,
    lat: 11.9348,
    lng: 79.8290,
    comments: [
      {
        id: 'c4_1',
        author: 'Ramesh Kumar',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        text: 'I saw a golden retriever matching her description running near the Swings Park about an hour ago!',
        time: '2h',
        replies: [
          {
            id: 'r4_1_1',
            author: 'Sunita Krishnan',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
            text: 'Oh! Which swings? The ones near the primary school side?',
            time: '1.5h'
          },
          {
            id: 'r4_1_2',
            author: 'Ramesh Kumar',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
            text: 'Yes, exactly there. A local shopkeeper was trying to feed her biscuit.',
            time: '1h'
          }
        ]
      },
      {
        id: 'c4_2',
        author: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        text: 'Sharing this in our local WhatsApp group. Hope Bella comes home soon!',
        time: '1.5h',
        replies: [
          {
            id: 'r4_2_1',
            author: 'Sunita Krishnan',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
            text: 'Thank you so much Sarah, really appreciate the help!',
            time: '1h'
          }
        ]
      }
    ]
  },
  {
    id: 'p5',
    author: 'Pondy Foodies Club',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    location: 'Heritage Town',
    time: '5h',
    verified: true,
    category: 'Event',
    distance: '450m away',
    content: '🌮 LOCAL FESTIVAL: The Neighborhood Food Carnival starts this Friday at Goubert Avenue! Come support 20+ local home-chefs and bakers. Live acoustic set starts at 6:30 PM!',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
    likes: 89,
    commentsCount: 3,
    isLiked: false,
    isBookmarked: false,
    lat: 11.9300,
    lng: 79.8330,
    comments: [
      {
        id: 'c5_1',
        author: 'Priya Sharma',
        avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=200',
        text: 'Will there be options for gluten-free or vegan food?',
        time: '4h',
        replies: [
          {
            id: 'r5_1_1',
            author: 'Pondy Foodies Club',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            text: 'Yes! Stalls #4 (Arogya Organic) and #12 (Cocoa Love) are completely gluten-free and vegan friendly.',
            time: '3.5h'
          }
        ]
      },
      {
        id: 'c5_2',
        author: 'Dinesh Karthik',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
        text: 'Is entry free or do we need passes?',
        time: '3h',
        replies: [
          {
            id: 'r5_2_1',
            author: 'Pondy Foodies Club',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            text: 'Entry is completely free for everyone!',
            time: '2h'
          }
        ]
      }
    ]
  },
  {
    id: 'p6',
    author: 'Neighborhood Civic Council',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
    location: 'White Town',
    time: '1d',
    verified: true,
    category: 'News',
    distance: '200m away',
    content: '🚧 CIVIC UPDATE: New Smart Metro Station planning approved for White Town extension. Preliminary soil testing begins on Monday. Expect minor traffic diversions on Kamaraj Salai during daytime hours.',
    likes: 54,
    commentsCount: 1,
    isLiked: false,
    isBookmarked: false,
    lat: 11.9310,
    lng: 79.8310,
    comments: [
      {
        id: 'c6_1',
        author: 'Balaji S.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
        text: 'This is long overdue! Hope they ensure proper parking space design next to the entrance.',
        time: '18h'
      }
    ]
  },
  {
    id: 'p7',
    author: 'Karan Malhotra',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    location: 'Heritage Town',
    time: '2d',
    verified: false,
    category: 'Community Update',
    distance: '600m away',
    content: '🌱 Clean & Green Drive: Let\'s gather this Sunday at 7 AM near the Canal Road arch for a cleanliness drive. Garbage bags, rake, and safety gloves will be provided. High tea at 9 AM for volunteers!',
    likes: 42,
    commentsCount: 2,
    isLiked: false,
    isBookmarked: false,
    lat: 11.9350,
    lng: 79.8280,
    comments: [
      {
        id: 'c7_1',
        author: 'Arun Kumar',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
        text: 'Count me in! I will bring my son along as well to help out.',
        time: '1.5d'
      },
      {
        id: 'c7_2',
        author: 'Olivia Cooke',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        text: 'Great initiative Karan, I will be there!',
        time: '1d'
      }
    ]
  },
  {
    id: 'p8',
    author: 'Pondy Bakeries Association',
    avatar: 'https://images.unsplash.com/photo-1579038773867-044c48829161?auto=format&fit=crop&q=80&w=200',
    location: 'White Town',
    time: '3d',
    verified: true,
    category: 'News',
    distance: '900m away',
    content: '🏆 CHAMPIONS: Local neighborhood bakery \'Baker Street\' has won the regional Sourdough Bread Championship! Huge congratulations to Chef Pierre and his hardworking crew.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
    likes: 112,
    commentsCount: 3,
    isLiked: false,
    isBookmarked: false,
    lat: 11.9325,
    lng: 79.8325,
    comments: [
      {
        id: 'c8_1',
        author: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        text: 'So deserved! Chef Pierre is extremely talented.',
        time: '2d',
        replies: [
          {
            id: 'r8_1_1',
            author: 'Olivia Cooke',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
            text: 'Agreed! Their chocolate almond croissants are out of this world as well.',
            time: '1.5d'
          },
          {
            id: 'r8_1_2',
            author: 'Sarah Johnson',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
            text: 'Oh my, yes! Those are to die for.',
            time: '1d'
          }
        ]
      }
    ]
  }
];

const SEED_PROFESSIONALS: Professional[] = [
  {
    id: 'pr1',
    name: 'Arun Kumar',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    profession: 'Electrician',
    rating: 4.8,
    reviewsCount: 124,
    distance: 0.5,
    location: 'Heritage Town',
    phone: '+91 98765 43210',
    whatsapp: '9876543210',
    verified: true,
    availability: 'Available',
    lat: 11.9344,
    lng: 79.8290
  },
  {
    id: 'pr2',
    name: 'Balaji S.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    profession: 'Plumber',
    rating: 4.6,
    reviewsCount: 98,
    distance: 1.2,
    location: 'White Town',
    phone: '+91 99944 88811',
    whatsapp: '9994488811',
    verified: true,
    availability: 'Busy',
    lat: 11.9318,
    lng: 79.8315
  },
  {
    id: 'pr3',
    name: 'Dinesh Karthik',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    profession: 'AC Technician',
    rating: 4.9,
    reviewsCount: 56,
    distance: 2.1,
    location: 'Heritage Town',
    phone: '+91 94433 22110',
    whatsapp: '9443322110',
    verified: false,
    availability: 'Available',
    lat: 11.9358,
    lng: 79.8260
  }
];

const SEED_DIRECTORY: DirectoryItem[] = [
  {
    id: 'dir1',
    name: 'Pondicherry General Hospital',
    category: 'Hospital',
    rating: 4.5,
    distance: 0.9,
    openStatus: 'Open',
    location: 'Victor Simonel St',
    phone: '0413 223 6001',
    lat: 11.9328,
    lng: 79.8270
  },
  {
    id: 'dir2',
    name: 'SBI ATM & Cash Point',
    category: 'ATM',
    rating: 4.1,
    distance: 0.3,
    openStatus: 'Open',
    location: 'Mission Street',
    phone: '1800 123 4',
    lat: 11.9338,
    lng: 79.8305
  },
  {
    id: 'dir3',
    name: 'Heritage Pharmacy & Medicals',
    category: 'Medical Shop',
    rating: 4.7,
    distance: 0.4,
    openStatus: 'Open',
    location: 'Lally Tollendal St',
    phone: '+91 98432 12345',
    lat: 11.9348,
    lng: 79.8322
  },
  {
    id: 'dir4',
    name: 'Surguru Veg Restaurant',
    category: 'Restaurant',
    rating: 4.4,
    distance: 0.6,
    openStatus: 'Open',
    location: 'Mission Street',
    phone: '0413 233 9022',
    lat: 11.9352,
    lng: 79.8285
  },
  {
    id: 'dir5',
    name: 'Bhavani Supermarket',
    category: 'Supermarket',
    rating: 4.3,
    distance: 1.1,
    openStatus: 'Open',
    location: 'Heritage Town',
    phone: '0413 234 5678',
    lat: 11.9362,
    lng: 79.8250
  }
];

const SEED_ALERTS: AlertItem[] = [
  {
    id: 'alt1',
    title: 'Scheduled Water Supply Interruption',
    description: 'RWA Notice: Water supply will be cut off on Tuesday (14th July) between 9:00 AM and 1:00 PM for overhead tank maintenance.',
    level: 'warning',
    location: 'Heritage Town',
    time: '2h ago',
    lat: 11.9350,
    lng: 79.8275,
    author: 'Heritage Town RWA',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    verified: true,
  },
  {
    id: 'alt2',
    title: 'Stray Dogs Spotted Near Play Area',
    description: 'Caution: A pack of aggressive stray dogs has been spotted near the Bharathi Park children play area. Please be careful in the evenings.',
    level: 'danger',
    location: 'White Town',
    time: '5h ago',
    lat: 11.9325,
    lng: 79.8340,
    author: 'Municipal Guard',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    verified: true,
  }
];

const SEED_JOBS: JobVacancy[] = [
  {
    id: 'job1',
    title: 'Store Assistant Required',
    company: 'Sri Krishna Kirana Store',
    salary: '₹12,000 - ₹15,000 / month',
    type: 'Full-time',
    location: 'Heritage Town',
    distance: 0.8,
    lat: 11.9330,
    lng: 79.8260,
    phone: '+91 98765 00112'
  },
  {
    id: 'job2',
    title: 'Home Tutor for Grade 8 (Maths/Science)',
    company: 'Sharma Family Home',
    salary: '₹5,000 - ₹6,000 / month',
    type: 'Part-time (Evenings)',
    location: 'White Town',
    distance: 2.1,
    lat: 11.9300,
    lng: 79.8330,
    phone: '+91 98989 89898'
  }
];

const SEED_GROUPS: Group[] = [
  {
    id: 'pet_owners',
    name: 'Pet Owners Association',
    description: 'For pet parents in White Town. Schedule dog walks, find vets, and share pet tips!',
    category: 'Pets',
    image: '🐾',
    membersCount: 12,
    members: []
  },
  {
    id: 'gardening_club',
    name: 'White Town Gardening Club',
    description: 'Discuss terrace gardening, soil mixing, seed swaps, and organic vegetable growth.',
    category: 'Hobbies',
    image: '🌱',
    membersCount: 8,
    members: []
  },
  {
    id: 'safety_watch',
    name: 'Neighborhood Watch & Safety',
    description: 'Stay alert and keep the community secure. Safety discussions and suspicious reports.',
    category: 'Safety',
    image: '🛡️',
    membersCount: 25,
    members: []
  },
  {
    id: 'book_club',
    name: 'Literary Circle',
    description: 'Monthly book readings, exchanges, and discussions on classics and modern bestsellers.',
    category: 'Education',
    image: '📚',
    membersCount: 6,
    members: []
  },
  {
    id: 'parenting_circle',
    name: 'White Town Parents Group',
    description: 'Connecting parents for playdates, school recommendations, and kids activity planning.',
    category: 'Family',
    image: '👶',
    membersCount: 15,
    members: []
  }
];

const SEED_GROUP_POSTS: GroupPost[] = [
  {
    id: 'gp1',
    groupId: 'pet_owners',
    authorName: 'Ramesh Kumar',
    authorEmail: 'ramesh@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    content: 'Anyone know a good dog walker near French Quarter? My Golden Retriever needs daily walks.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'gp2',
    groupId: 'gardening_club',
    authorName: 'Sita Ram',
    authorEmail: 'sita@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    content: 'Our cherry tomatoes are finally ripening! Highly recommend adding coco peat to Pondy soil.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

// Load state helper safely supporting both web & mobile environments
const getLocalStorageItem = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {
    // Ignore
  }
  return null;
};

const getLocalStorageJSON = (key: string): any => {
  const val = getLocalStorageItem(key);
  if (val === null) return null;
  try {
    return JSON.parse(val);
  } catch (e) {
    return val;
  }
};

export const KnowAroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [activeLocation, setActiveLocation] = useState('White Town, PY');
  const [feeds, setFeeds] = useState<Post[]>(SEED_POSTS);
  const [professionals, setProfessionals] = useState<Professional[]>(SEED_PROFESSIONALS);
  const [directory, setDirectory] = useState<DirectoryItem[]>(SEED_DIRECTORY);
  const [alerts, setAlerts] = useState<AlertItem[]>(SEED_ALERTS);
  const [jobs, setJobs] = useState<JobVacancy[]>(SEED_JOBS);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'professional' | null>(null);
  const [userAddress, setUserAddress] = useState<{ street: string; place: string; city: string; state: string; pin: string; phone: string } | null>(null);
  const [composerVisible, setComposerVisible] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; accuracy: number | null } | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [groups, setGroups] = useState<Group[]>(SEED_GROUPS);
  const [groupPosts, setGroupPosts] = useState<GroupPost[]>(SEED_GROUP_POSTS);

  const [selectedCategory, setSelectedCategory] = useState<'professionals' | 'alerts' | 'jobs' | 'directory' | 'all'>('professionals');
  const [selectedProfession, setSelectedProfession] = useState('Electricians');
  const [distanceFilter, setDistanceFilter] = useState('5 km');
  const [ratingsFilter, setRatingsFilter] = useState('All');

  // Load from localStorage on mount (Web support)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedUser = window.localStorage.getItem('native_user');
        const savedFeeds = window.localStorage.getItem('native_feeds');
        const savedAlerts = window.localStorage.getItem('native_alerts');
        const savedJobs = window.localStorage.getItem('native_jobs');
        const savedOnboarding = window.localStorage.getItem('native_onboarding');
        const savedRole = window.localStorage.getItem('native_role');
        const savedLoc = window.localStorage.getItem('native_location');
        const savedAddr = window.localStorage.getItem('native_address');
        const savedPros = window.localStorage.getItem('native_professionals');
        const savedGroups = window.localStorage.getItem('native_groups');
        const savedGPosts = window.localStorage.getItem('native_group_posts');
        
        if (savedUser) setUser(JSON.parse(savedUser));
        if (savedFeeds) setFeeds(JSON.parse(savedFeeds));
        if (savedAlerts) setAlerts(JSON.parse(savedAlerts));
        if (savedJobs) setJobs(JSON.parse(savedJobs));
        if (savedOnboarding) setOnboardingCompleted(JSON.parse(savedOnboarding));
        if (savedRole) setUserRole(savedRole as any);
        if (savedLoc) setActiveLocation(savedLoc);
        if (savedAddr) setUserAddress(JSON.parse(savedAddr));
        if (savedPros) setProfessionals(JSON.parse(savedPros));
        if (savedGroups) setGroups(JSON.parse(savedGroups));
        if (savedGPosts) setGroupPosts(JSON.parse(savedGPosts));
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  const authInitialLoad = useRef(true);

  // Firebase Real-time listeners & Auth synchronizers
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const loggedInUser = {
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Neighbor',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
        };
        setUser(loggedInUser);
        saveState('native_user', loggedInUser);
        
        // Only evaluate onboarding Completed state from localstorage on initial mount/session restore
        // Active actions (Sign In vs Sign Up) will manage the React state and localstorage directly
        if (authInitialLoad.current) {
          const savedOnboarding = getLocalStorageJSON('native_onboarding');
          setOnboardingCompleted(savedOnboarding !== false);
          authInitialLoad.current = false;
        }
      } else {
        setUser(null);
        saveState('native_user', null);
        authInitialLoad.current = false;
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    // Subscribe to feeds
    const unsubFeeds = onSnapshot(collection(db, 'feeds'), async (snapshot) => {
      const list: Post[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Post);
      });
      if (snapshot.empty) {
        // Bootstrap seed data
        for (const post of SEED_POSTS) {
          await addDoc(collection(db, 'feeds'), post);
        }
      } else {
        // Deduplicate by id (Firestore doc id wins), then sort newest first
        const seen = new Set<string>();
        const unique = list.filter(p => seen.has(p.id) ? false : (seen.add(p.id), true));
        unique.sort((a, b) => b.id.localeCompare(a.id));
        setFeeds(unique);
        saveState('native_feeds', unique);
      }
    });

    // Subscribe to alerts
    const unsubAlerts = onSnapshot(collection(db, 'alerts'), async (snapshot) => {
      const list: AlertItem[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as AlertItem);
      });
      if (snapshot.empty) {
        for (const alert of SEED_ALERTS) {
          await addDoc(collection(db, 'alerts'), alert);
        }
      } else {
        list.sort((a, b) => b.id.localeCompare(a.id));
        setAlerts(list);
        saveState('native_alerts', list);
      }
    });

    // Subscribe to professionals
    const unsubPros = onSnapshot(collection(db, 'professionals'), async (snapshot) => {
      const list: Professional[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Professional);
      });
      if (snapshot.empty) {
        for (const pro of SEED_PROFESSIONALS) {
          await addDoc(collection(db, 'professionals'), pro);
        }
      } else {
        setProfessionals(list);
        saveState('native_professionals', list);
      }
    });

    // Subscribe to groups
    const unsubGroups = onSnapshot(collection(db, 'groups'), async (snapshot) => {
      const list: Group[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Group);
      });
      if (snapshot.empty) {
        for (const grp of SEED_GROUPS) {
          await addDoc(collection(db, 'groups'), grp);
        }
      } else {
        setGroups(list);
        saveState('native_groups', list);
      }
    });

    // Subscribe to group posts
    const unsubGroupPosts = onSnapshot(collection(db, 'group_posts'), async (snapshot) => {
      const list: GroupPost[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as GroupPost);
      });
      if (snapshot.empty) {
        for (const gp of SEED_GROUP_POSTS) {
          await addDoc(collection(db, 'group_posts'), gp);
        }
      } else {
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setGroupPosts(list);
        saveState('native_group_posts', list);
      }
    });

    return () => {
      unsubFeeds();
      unsubAlerts();
      unsubPros();
      unsubGroups();
      unsubGroupPosts();
    };
  }, []);

  // Save state helper
  const saveState = (key: string, data: any) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (e) {
      // Ignore
    }
  };

  const login = async (phone: string): Promise<boolean> => {
    setOnboardingCompleted(true);
    saveState('native_onboarding', true);
    setJustRegistered(false);

    const formattedName = phone.replace(/[^0-9]/g, '').slice(-10) || 'Neighbor';
    const newUser = { name: `User ${formattedName}`, email: phone };
    setUser(newUser);
    saveState('native_user', newUser);
    return true;
  };

  const googleLogin = () => {
    const newUser = { name: 'Google Neighbor', email: 'google.neighbor@gmail.com' };
    setUser(newUser);
    saveState('native_user', newUser);
    setOnboardingCompleted(true);
    saveState('native_onboarding', true);
    setJustRegistered(false);
  };

  const register = async (name: string, phone: string): Promise<boolean> => {
    // New signup, force onboarding to run
    setOnboardingCompleted(false);
    saveState('native_onboarding', false);
    setJustRegistered(true);

    const newUser = { name: name || 'Neighbor', email: phone };
    setUser(newUser);
    saveState('native_user', newUser);
    return true;
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
    setUser(null);
    setOnboardingCompleted(false);
    setUserRole(null);
    setUserAddress(null);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('native_user');
        window.localStorage.removeItem('native_onboarding');
        window.localStorage.removeItem('native_role');
        window.localStorage.removeItem('native_address');
        window.localStorage.removeItem('native_professionals');
      }
    } catch (e) {}
    setProfessionals(SEED_PROFESSIONALS);
  };

  const updateProfileDetails = (name: string, email?: string) => {
    if (user) {
      const updatedUser = { ...user, name, email: email || user.email };
      setUser(updatedUser);
      saveState('native_user', updatedUser);
    }
  };

  const addPost = async (content: string, category: 'News' | 'Alert' | 'Event' | 'Community Update', image?: string) => {
    const newPostData = {
      author: user?.name || 'You (Neighbor)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      location: activeLocation.split(',')[0],
      time: 'Just now',
      verified: true,
      category,
      distance: '0m away',
      content,
      image: image || null,
      likes: 0,
      commentsCount: 0,
      isLiked: false,
      isBookmarked: false,
      comments: [],
      lat: userLocation ? userLocation.latitude : 11.9340,
      lng: userLocation ? userLocation.longitude : 79.8300
    };

    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'feeds'), newPostData);
      } catch (err) {
        console.error('Firestore addPost error:', err);
      }
    } else {
      const newPost: Post = {
        id: `post_${Date.now()}`,
        ...newPostData,
        image
      };
      const updatedFeeds = [newPost, ...feeds];
      setFeeds(updatedFeeds);
      saveState('native_feeds', updatedFeeds);
    }
  };

  const likePost = async (postId: string) => {
    if (isFirebaseConfigured && db) {
      try {
        const postRef = doc(db, 'feeds', postId);
        const post = feeds.find(p => p.id === postId);
        if (post) {
          await updateDoc(postRef, {
            isLiked: !post.isLiked,
            likes: post.isLiked ? increment(-1) : increment(1)
          });
        }
      } catch (err) {
        console.error('Firestore likePost error:', err);
      }
    } else {
      const updated = feeds.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          };
        }
        return post;
      });
      setFeeds(updated);
      saveState('native_feeds', updated);
    }
  };

  const bookmarkPost = async (postId: string) => {
    if (isFirebaseConfigured && db) {
      try {
        const postRef = doc(db, 'feeds', postId);
        const post = feeds.find(p => p.id === postId);
        if (post) {
          await updateDoc(postRef, {
            isBookmarked: !post.isBookmarked
          });
        }
      } catch (err) {
        console.error('Firestore bookmarkPost error:', err);
      }
    } else {
      const updated = feeds.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            isBookmarked: !post.isBookmarked
          };
        }
        return post;
      });
      setFeeds(updated);
      saveState('native_feeds', updated);
    }
  };

  const addComment = async (postId: string, text: string) => {
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      author: user?.name || 'You (Neighbor)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      text,
      time: 'Just now'
    };

    if (isFirebaseConfigured && db) {
      try {
        const postRef = doc(db, 'feeds', postId);
        await updateDoc(postRef, {
          comments: arrayUnion(newComment),
          commentsCount: increment(1)
        });
      } catch (err) {
        console.error('Firestore addComment error:', err);
      }
    } else {
      const updated = feeds.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment],
            commentsCount: post.commentsCount + 1
          };
        }
        return post;
      });
      setFeeds(updated);
      saveState('native_feeds', updated);
    }
  };

  const addAlert = async (title: string, description: string, level: 'warning' | 'danger' | 'info', lat: number, lng: number) => {
    const newAlertData = {
      title,
      description,
      level,
      location: activeLocation.split(',')[0],
      time: 'Just now',
      lat,
      lng,
      author: user?.name || 'Municipal Admin',
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      verified: true
    };

    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'alerts'), newAlertData);
      } catch (err) {
        console.error('Firestore addAlert error:', err);
      }
    } else {
      const newAlert: AlertItem = {
        id: `alert_${Date.now()}`,
        ...newAlertData
      };
      const updatedAlerts = [newAlert, ...alerts];
      setAlerts(updatedAlerts);
      saveState('native_alerts', updatedAlerts);
    }
  };

  const applyJob = (jobId: string) => {
    const updated = jobs.map(j => {
      if (j.id === jobId) {
        return { ...j, applied: true };
      }
      return j;
    });
    setJobs(updated);
    saveState('native_jobs', updated);
  };

  // Register a new Professional (Business Account onboarding) dynamically!
  const registerBusiness = async (business: { name: string; profession: string; phone: string; street: string; place: string; lat?: number; lng?: number }) => {
    const newProData = {
      name: business.name,
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
      profession: business.profession as any,
      rating: 5.0,
      reviewsCount: 0,
      distance: 0.1,
      location: business.street,
      phone: business.phone,
      whatsapp: business.phone,
      verified: true,
      availability: 'Available',
      lat: business.lat || (userLocation ? userLocation.latitude : 11.9340),
      lng: business.lng || (userLocation ? userLocation.longitude : 79.8300)
    };

    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'professionals'), newProData);
      } catch (err) {
        console.error('Firestore registerBusiness error:', err);
      }
    } else {
      const newPro: Professional = {
        id: `pr_${Date.now()}`,
        ...newProData
      };
      const updatedPros = [newPro, ...professionals];
      setProfessionals(updatedPros);
      saveState('native_professionals', updatedPros);
    }
  };

  const joinGroup = async (groupId: string) => {
    const userEmail = user?.email || 'neighbor@gmail.com';
    if (isFirebaseConfigured && db) {
      try {
        const q = collection(db, 'groups');
        const unsub = onSnapshot(q, async (snap) => {
          let foundDocId = '';
          let currentMembers: string[] = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.id === groupId) {
              foundDocId = docSnap.id;
              currentMembers = data.members || [];
            }
          });
          
          if (foundDocId) {
            unsub();
            if (!currentMembers.includes(userEmail)) {
              const updatedMembers = [...currentMembers, userEmail];
              await updateDoc(doc(db, 'groups', foundDocId), {
                members: updatedMembers,
                membersCount: updatedMembers.length
              });
            }
          }
        });
      } catch (err) {
        console.error('Firestore joinGroup error:', err);
      }
    } else {
      const updated = groups.map(g => {
        if (g.id === groupId) {
          const membersList = g.members || [];
          if (!membersList.includes(userEmail)) {
            const newMembers = [...membersList, userEmail];
            return {
              ...g,
              members: newMembers,
              membersCount: newMembers.length
            };
          }
        }
        return g;
      });
      setGroups(updated);
      saveState('native_groups', updated);
    }
  };

  const postToGroup = async (groupId: string, content: string) => {
    const newPost: GroupPost = {
      id: `gpost_${Date.now()}`,
      groupId,
      authorName: user?.name || 'You (Neighbor)',
      authorEmail: user?.email || 'neighbor@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      content,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'group_posts'), newPost);
      } catch (err) {
        console.error('Firestore postToGroup error:', err);
      }
    } else {
      const updated = [newPost, ...groupPosts];
      setGroupPosts(updated);
      saveState('native_group_posts', updated);
    }
  };

  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const mappedFeeds = React.useMemo(() => {
    if (!userLocation) return feeds;
    return feeds.map(post => {
      if (post.lat && post.lng) {
        const dist = getDistanceKm(userLocation.latitude, userLocation.longitude, post.lat, post.lng);
        const distStr = dist < 1 ? `${Math.round(dist * 1000)}m away` : `${dist.toFixed(1)}km away`;
        return { ...post, distance: distStr };
      }
      return post;
    });
  }, [feeds, userLocation]);

  const mappedProfessionals = React.useMemo(() => {
    if (!userLocation) return professionals;
    return professionals.map(p => {
      const dist = getDistanceKm(userLocation.latitude, userLocation.longitude, p.lat, p.lng);
      return { ...p, distance: parseFloat(dist.toFixed(1)) };
    });
  }, [professionals, userLocation]);

  const mappedDirectory = React.useMemo(() => {
    if (!userLocation) return directory;
    return directory.map(d => {
      const dist = getDistanceKm(userLocation.latitude, userLocation.longitude, d.lat, d.lng);
      return { ...d, distance: parseFloat(dist.toFixed(1)) };
    });
  }, [directory, userLocation]);

  const mappedAlerts = React.useMemo(() => {
    if (!userLocation) return alerts;
    return alerts.map(a => {
      const dist = getDistanceKm(userLocation.latitude, userLocation.longitude, a.lat, a.lng);
      return { ...a, distance: parseFloat(dist.toFixed(1)) };
    });
  }, [alerts, userLocation]);

  const currentUser = {
    name: user?.name || 'Ajay',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    location: activeLocation
  };

  return (
    <KnowAroundContext.Provider
      value={{
        user,
        login,
        googleLogin,
        register,
        logout,
        currentUser,
        updateProfileDetails,
        activeLocation,
        setActiveLocation: (loc) => {
          setActiveLocation(loc);
          saveState('native_location', loc);
        },
        feeds: mappedFeeds,
        professionals: mappedProfessionals,
        directory: mappedDirectory,
        alerts: mappedAlerts,
        jobs,
        onboardingCompleted,
        setOnboardingCompleted: (val) => {
          setOnboardingCompleted(val);
          saveState('native_onboarding', val);
        },
        justRegistered,
        setJustRegistered,
        userRole,
        setUserRole: (role) => {
          setUserRole(role);
          saveState('native_role', role);
        },
        userAddress,
        setUserAddress: (addr) => {
          setUserAddress(addr);
          saveState('native_address', addr);
        },
        selectedCategory,
        setSelectedCategory,
        selectedProfession,
        setSelectedProfession,
        distanceFilter,
        setDistanceFilter,
        ratingsFilter,
        setRatingsFilter,
        addPost,
        likePost,
        bookmarkPost,
        addComment,
        addAlert,
        applyJob,
        registerBusiness,
        composerVisible,
        setComposerVisible,
        userLocation,
        setUserLocation,
        darkMode,
        setDarkMode,
        groups,
        groupPosts,
        joinGroup,
        postToGroup
      }}
    >
      {children}
    </KnowAroundContext.Provider>
  );
};

export const useKnowAround = () => {
  const context = useContext(KnowAroundContext);
  if (!context) {
    throw new Error('useKnowAround must be used within a KnowAroundProvider');
  }
  return context;
};

