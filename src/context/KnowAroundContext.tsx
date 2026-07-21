import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { isFirebaseConfigured, auth, db } from '../services/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  setDoc,
  updateDoc, 
  arrayUnion, 
  increment,
  getDocs,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { 
  signInWithPhoneNumber,
  signOut,
  updateProfile
} from 'firebase/auth';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserDocument {
  uid: string;
  phoneNumber: string;
  name?: string;
  avatar?: string;
  address?: string;
  street?: string;
  area?: string;
  locality?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  locationVerified: boolean;
  notificationEnabled: boolean;
  profileCompleted: boolean;
  accountType: 'personal';
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
}

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
  user: { name: string; email: string; phone?: string; avatar?: string; profileCompleted?: boolean } | null;
  authenticatePhone: (phone: string) => Promise<{ isNewUser: boolean; profileCompleted: boolean }>;
  completeOnboarding: (data: {
    name: string;
    street: string;
    area: string;
    locality: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    notificationEnabled: boolean;
  }) => Promise<void>;
  login: (phone: string) => Promise<boolean>;
  googleLogin: () => void;
  register: (name: string, phone: string) => Promise<boolean>;
  logout: () => Promise<void>;
  currentUser: { name: string; avatar?: string; location: string };
  updateProfileDetails: (name: string, email?: string, phone?: string, avatar?: string) => void;
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
  clearUserCredentials: () => Promise<void>;
}

const KnowAroundContext = createContext<KnowAroundContextProps | undefined>(undefined);

const SEED_POSTS: Post[] = [
  {
    id: 'p1',
    author: 'Olivia Cooke',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    location: 'Heritage Town',
    time: '1h',
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
        id: 'c1_1',
        author: 'Ramesh Kumar',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        text: 'This bakery is fantastic, love their croissants!',
        time: '45m'
      },
      {
        id: 'c1_2',
        author: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        text: 'Perfect morning walk vibe!',
        time: '30m'
      }
    ]
  },
  {
    id: 'p2',
    author: 'Neighborhood Safety Committee',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    location: 'White Town',
    time: '2h',
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
    time: '4h',
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
    location: 'Swings Park',
    time: '5h',
    verified: false,
    category: 'Alert',
    distance: '50m away',
    content: '⚠️ LOST PET ALERT: Our Golden Retriever, Bella, went missing near Swings Park. She is wearing a red collar and is extremely friendly. Please ping if spotted!',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800',
    likes: 28,
    commentsCount: 1,
    isLiked: false,
    isBookmarked: false,
    lat: 11.9348,
    lng: 79.8290,
    comments: [
      {
        id: 'c4_1',
        author: 'Ramesh Kumar',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        text: 'I saw a dog matching this near Swings Park about an hour ago!',
        time: '3h'
      }
    ]
  },
  {
    id: 'p5',
    author: 'Pondy Foodies Club',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    location: 'Goubert Avenue',
    time: '6h',
    verified: true,
    category: 'Event',
    distance: '450m away',
    content: '🌮 LOCAL FESTIVAL: The Neighborhood Food Carnival starts this Friday at Goubert Avenue! Come support 20+ local home-chefs and bakers. Live acoustic set starts at 6:30 PM!',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
    likes: 89,
    commentsCount: 0,
    isLiked: false,
    isBookmarked: false,
    lat: 11.9300,
    lng: 79.8330,
    comments: []
  },
  {
    id: 'p6',
    author: 'Vikram Malhotra',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    location: 'White Town',
    time: '7h',
    verified: false,
    category: 'Community Update',
    distance: '200m away',
    content: 'Anyone experiencing slow fiber broadband near Romain Rolland Street today? Let me know if it is a local area outage or just my connection.',
    likes: 5,
    commentsCount: 0,
    isLiked: false,
    isBookmarked: false,
    lat: 11.9320,
    lng: 79.8310,
    comments: []
  },
  {
    id: 'p7',
    author: 'Marie Dubois',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
    location: 'Heritage Town',
    time: '8h',
    verified: true,
    category: 'Community Update',
    distance: '600m away',
    content: "Just donated old books to the municipal library! 📚 They mentioned they are looking for children's fiction and school textbooks. Drop them off if you have any spare!",
    likes: 22,
    commentsCount: 0,
    isLiked: false,
    isBookmarked: false,
    lat: 11.9360,
    lng: 79.8270,
    comments: []
  },
  {
    id: 'p8',
    author: 'Rajesh Iyer',
    avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=200',
    location: 'Mission Street',
    time: '9h',
    verified: false,
    category: 'Community Update',
    distance: '400m away',
    content: '🔑 Found a bunch of keys on the pavement near the SBI ATM on Mission Street. I have left them with the security guard at the cash point. Please retrieve them if they are yours.',
    likes: 12,
    commentsCount: 0,
    isLiked: false,
    isBookmarked: false,
    lat: 11.9338,
    lng: 79.8305,
    comments: []
  },
  {
    id: 'p9',
    author: 'Canal Road Watch',
    avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=200',
    location: 'Heritage Town',
    time: '10h',
    verified: true,
    category: 'Alert',
    distance: '700m away',
    content: '⚠️ WATER LOGGING ALERT: Heavy water accumulation near the Canal Road junction following last night\'s rain. Avoid this stretch and take the Mission Street detour.',
    likes: 18,
    commentsCount: 0,
    isLiked: false,
    isBookmarked: false,
    lat: 11.9370,
    lng: 79.8260,
    comments: []
  },
  {
    id: 'p10',
    author: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=200',
    location: 'Romain Rolland St',
    time: '11h',
    verified: false,
    category: 'Community Update',
    distance: '350m away',
    content: 'The new gelato spot on Romain Rolland St is absolutely amazing! 🍦 Their dark Belgian chocolate is a must-try. Perfect relief for the afternoon heat.',
    likes: 14,
    commentsCount: 0,
    isLiked: false,
    isBookmarked: false,
    lat: 11.9315,
    lng: 79.8320,
    comments: []
  },
  {
    id: 'p11',
    author: 'Pondy Art House',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    location: 'Beach Road',
    time: '12h',
    verified: true,
    category: 'Event',
    distance: '1.2km away',
    content: '🎨 ART EXHIBITION: Join us for the annual Pondicherry local artists showcase this Saturday at 10 AM. Free entry. Come support local talent and buy unique paintings!',
    likes: 38,
    commentsCount: 0,
    isLiked: false,
    isBookmarked: false,
    lat: 11.9295,
    lng: 79.8335,
    comments: []
  },
  {
    id: 'p12',
    author: 'David K.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    location: 'Heritage Town',
    time: '13h',
    verified: false,
    category: 'Community Update',
    distance: '500m away',
    content: 'Looking for a reliable local plumber to fix an overhead water tank seepage. Any quick recommendations would be highly appreciated. Thanks!',
    likes: 3,
    commentsCount: 0,
    isLiked: false,
    isBookmarked: false,
    lat: 11.9355,
    lng: 79.8275,
    comments: []
  },
  {
    id: 'p13',
    author: 'Green Pondy Initiative',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200',
    location: 'Swadeshi Plaza',
    time: '14h',
    verified: true,
    category: 'Community Update',
    distance: '800m away',
    content: '♻️ CLEANUP SUCCESS: Our Sunday cleanup drive at Swadeshi Plaza was a huge hit! Over 15 volunteers turned up and we collected 12 bags of plastic waste. Thanks team!',
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800',
    likes: 56,
    commentsCount: 0,
    isLiked: false,
    isBookmarked: false,
    lat: 11.9340,
    lng: 79.8250,
    comments: []
  },
  {
    id: 'p14',
    author: 'Amit Patel',
    avatar: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=200',
    location: 'Promenade',
    time: '15h',
    verified: false,
    category: 'Community Update',
    distance: '1.5km away',
    content: 'The evening breeze on the Promenade is absolutely perfect tonight. It is the best place in Pondicherry to clear your head after a long workday. 🌊',
    likes: 29,
    commentsCount: 0,
    isLiked: false,
    isBookmarked: false,
    lat: 11.9288,
    lng: 79.8340,
    comments: []
  },
  {
    id: 'p15',
    author: 'Swadeshi Residents Assc',
    avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&q=80&w=200',
    location: 'Swadeshi Plaza',
    time: '16h',
    verified: true,
    category: 'Alert',
    distance: '850m away',
    content: '⚠️ VEHICLE BLOCKING: A grey sedan is parked blocking the entrance of Residential Lane 4. Traffic police have been notified. Please move it if it belongs to you.',
    likes: 9,
    commentsCount: 0,
    isLiked: false,
    isBookmarked: false,
    lat: 11.9345,
    lng: 79.8255,
    comments: []
  },
  {
    id: 'p16',
    author: 'Ananya Das',
    avatar: 'https://images.unsplash.com/photo-1534751516642-a131ffd103fd?auto=format&fit=crop&q=80&w=200',
    location: 'Swings Park',
    time: '17h',
    verified: false,
    category: 'Community Update',
    distance: '100m away',
    content: 'Does anyone know if the Swings Park children\'s play section has reopened? Thinking of taking my nieces there this weekend.',
    likes: 4,
    commentsCount: 0,
    isLiked: false,
    isBookmarked: false,
    lat: 11.9350,
    lng: 79.8290,
    comments: []
  },
  {
    id: 'p17',
    author: 'Chef Francois',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    location: 'White Town',
    time: '18h',
    verified: true,
    category: 'Community Update',
    distance: '250m away',
    content: '🍕 NEW MENU: We are launching our brand new wood-fired sourdough pizzas tonight at the Cafe! Fresh organic ingredients, handmade dough. Come try them!',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800',
    likes: 67,
    commentsCount: 0,
    isLiked: false,
    isBookmarked: false,
    lat: 11.9322,
    lng: 79.8318,
    comments: []
  },
  {
    id: 'p18',
    author: 'Sanjay Verma',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    location: 'Mission Street',
    time: '19h',
    verified: false,
    category: 'Alert',
    distance: '450m away',
    content: '⚠️ PIPELINE LEAK: Major Metro water pipeline burst near Swadeshi Plaza junction. Watch out for water logging and mud flow on the road.',
    likes: 15,
    commentsCount: 0,
    isLiked: false,
    isBookmarked: false,
    lat: 11.9342,
    lng: 79.8298,
    comments: []
  },
  {
    id: 'p19',
    author: 'Pondy Music Collective',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=200',
    location: 'Beach Road',
    time: '20h',
    verified: true,
    category: 'Event',
    distance: '1.3km away',
    content: '🎸 SUNSET JAM: Sunset acoustic jam session this Sunday at 5:30 PM on Beach Road. Open to all musicians and music lovers. Bring your own acoustic instrument!',
    likes: 52,
    commentsCount: 0,
    isLiked: false,
    isBookmarked: false,
    lat: 11.9290,
    lng: 79.8338,
    comments: []
  },
  {
    id: 'p20',
    author: 'Meera Nair',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=200',
    location: 'Heritage Town',
    time: '21h',
    verified: false,
    category: 'Community Update',
    distance: '650m away',
    content: 'The beautiful colonial architecture is what makes Heritage Town truly special. Glad to call this place home. ❤️',
    likes: 31,
    commentsCount: 0,
    isLiked: false,
    isBookmarked: false,
    lat: 11.9365,
    lng: 79.8268,
    comments: []
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
    location: 'Neighborhood',
    time: '2h ago',
    lat: 11.9350,
    lng: 79.8275,
  },
  {
    id: 'alt2',
    title: 'Stray Dogs Spotted Near Play Area',
    description: 'Caution: A pack of aggressive stray dogs has been spotted near the Bharathi Park children play area. Please be careful in the evenings.',
    level: 'danger',
    location: 'Neighborhood',
    time: '5h ago',
    lat: 11.9325,
    lng: 79.8340,
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

const GLOBAL_REGISTERED_ACCOUNTS: Record<string, UserDocument> = {};

const registerAccountInMemoryAndStorage = (docData: UserDocument) => {
  if (!docData) return;
  const phoneStr = docData.phoneNumber || '';
  const rawDigits = phoneStr.replace(/[^0-9]/g, '');
  const last10 = rawDigits.slice(-10);
  const fullPhone = phoneStr.startsWith('+') ? phoneStr : (last10 ? `+91${last10}` : '');

  if (fullPhone) GLOBAL_REGISTERED_ACCOUNTS[fullPhone] = docData;
  if (last10) GLOBAL_REGISTERED_ACCOUNTS[last10] = docData;
  if (rawDigits) GLOBAL_REGISTERED_ACCOUNTS[rawDigits] = docData;

  try {
    const jsonStr = JSON.stringify(GLOBAL_REGISTERED_ACCOUNTS);
    AsyncStorage.setItem('native_registered_accounts', jsonStr).catch(() => {});
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('native_registered_accounts', jsonStr);
    }
  } catch (e) {}
};

let feedsResetDone = false;

export const KnowAroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ name: string; email: string; phone?: string; avatar?: string } | null>(null);
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

  // Load from AsyncStorage & localStorage on mount
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const savedAccountsStr = await AsyncStorage.getItem('native_registered_accounts').catch(() => null) || 
                                 (typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('native_registered_accounts') : null);
        if (savedAccountsStr) {
          try {
            const parsed = JSON.parse(savedAccountsStr);
            Object.assign(GLOBAL_REGISTERED_ACCOUNTS, parsed);
          } catch (e) {}
        }

        const savedUserDocStr = await AsyncStorage.getItem('native_user_doc').catch(() => null) || 
                                (typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('native_user_doc') : null);
        if (savedUserDocStr) {
          try {
            registerAccountInMemoryAndStorage(JSON.parse(savedUserDocStr));
          } catch (e) {}
        }

        const savedUserStr = await AsyncStorage.getItem('native_user').catch(() => null) || 
                             (typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('native_user') : null);
        if (savedUserStr) {
          try {
            const u = JSON.parse(savedUserStr);
            if (u && u.phone && u.name) {
              registerAccountInMemoryAndStorage({
                uid: `usr_${u.phone.replace(/[^0-9]/g, '')}`,
                phoneNumber: u.phone,
                name: u.name,
                profileCompleted: true,
                locationVerified: true,
                notificationEnabled: true,
                accountType: 'personal',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
              });
            }
            setUser(u);
          } catch (e) {}
        }

        const savedOnboardingStr = await AsyncStorage.getItem('native_onboarding').catch(() => null) || 
                                   (typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('native_onboarding') : null);
        if (savedOnboardingStr) {
          try {
            setOnboardingCompleted(JSON.parse(savedOnboardingStr));
          } catch (e) {}
        }

        const savedLocStr = await AsyncStorage.getItem('native_location').catch(() => null) || 
                            (typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('native_location') : null);
        if (savedLocStr) {
          try { setActiveLocation(savedLocStr); } catch (e) {}
        }

        const savedAddrStr = await AsyncStorage.getItem('native_address').catch(() => null) || 
                             (typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('native_address') : null);
        if (savedAddrStr) {
          try { setUserAddress(JSON.parse(savedAddrStr)); } catch (e) {}
        }
      } catch (err) {
        console.warn('Persisted data load error:', err);
      }
    };

    loadPersistedData();
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

    // Reset database feeds to 20 fresh items if not already done
    const checkAndResetFeeds = async () => {
      try {
        if (feedsResetDone) return;

        if (typeof window !== 'undefined' && window.localStorage) {
          const resetDone = window.localStorage.getItem('db_feeds_reset_v4');
          if (resetDone === 'true') {
            feedsResetDone = true;
            return;
          }
        }
        
        console.log("WIPING FIRESTORE 'feeds' COLLECTION FOR 20 NEW POSTS...");
        const q = collection(db, 'feeds');
        const snapshot = await getDocs(query(q));
        const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(doc(db, 'feeds', docSnap.id)));
        await Promise.all(deletePromises);
        
        feedsResetDone = true;
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('db_feeds_reset_v4', 'true');
        }
        console.log("WIPE SUCCESSFUL, METRO WILL AUTOMATICALLY RE-BOOTSTRAP!");
      } catch (err) {
        console.warn("Feeds database reset error:", err);
      }
    };
    checkAndResetFeeds();
  }, [db]);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    // Subscribe to feeds
    const unsubFeeds = onSnapshot(collection(db, 'feeds'), async (snapshot) => {
      const list: Post[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Post);
      });
      if (snapshot.empty) {
        // Bootstrap seed data
        for (const post of SEED_POSTS) {
          await addDoc(collection(db, 'feeds'), post);
        }
      } else {
        // Sort feeds by id/creation time desc
        list.sort((a, b) => b.id.localeCompare(a.id));
        setFeeds(list);
        saveState('native_feeds', list);
      }
    });

    // Subscribe to alerts
    const unsubAlerts = onSnapshot(collection(db, 'alerts'), async (snapshot) => {
      const list: AlertItem[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as AlertItem);
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
        list.push({ ...docSnap.data(), id: docSnap.id } as Professional);
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
        list.push({ ...docSnap.data(), id: docSnap.id } as Group);
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
        list.push({ ...docSnap.data(), id: docSnap.id } as GroupPost);
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

  const authenticatePhone = async (phone: string): Promise<{ isNewUser: boolean; profileCompleted: boolean }> => {
    const rawDigits = phone.replace(/[^0-9]/g, '');
    const fullPhoneNumber = phone.startsWith('+') ? phone : `+91${rawDigits.slice(-10)}`;
    const nowIso = new Date().toISOString();
    const mockUid = `usr_${rawDigits.slice(-10)}`;

    let userDoc: UserDocument | null = null;

    if (isFirebaseConfigured && db) {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('phoneNumber', '==', fullPhoneNumber));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          userDoc = docSnap.data() as UserDocument;
          userDoc.uid = docSnap.id;

          // Update lastLogin timestamp in Firestore
          await updateDoc(doc(db, 'users', docSnap.id), {
            lastLogin: nowIso,
            updatedAt: nowIso
          });
        }
      } catch (err) {
        console.warn('Firestore fetch user error:', err);
      }
    }

    if (!userDoc) {
      userDoc = GLOBAL_REGISTERED_ACCOUNTS[fullPhoneNumber] || 
                GLOBAL_REGISTERED_ACCOUNTS[rawDigits.slice(-10)] || 
                GLOBAL_REGISTERED_ACCOUNTS[rawDigits] || 
                null;

      if (!userDoc) {
        try {
          const asyncRegisteredStr = await AsyncStorage.getItem('native_registered_accounts').catch(() => null);
          const asyncRegistered = asyncRegisteredStr ? JSON.parse(asyncRegisteredStr) : null;
          const registered = asyncRegistered || getLocalStorageJSON('native_registered_accounts') || {};
          userDoc = registered[fullPhoneNumber] || registered[rawDigits.slice(-10)] || registered[rawDigits] || null;
        } catch (e) {}

        if (!userDoc) {
          try {
            const asyncUserDocStr = await AsyncStorage.getItem('native_user_doc').catch(() => null);
            const savedUserDoc = asyncUserDocStr ? JSON.parse(asyncUserDocStr) : getLocalStorageJSON('native_user_doc');
            if (savedUserDoc && (savedUserDoc.phoneNumber === fullPhoneNumber || savedUserDoc.phoneNumber?.includes(rawDigits.slice(-10)))) {
              userDoc = savedUserDoc;
            } else {
              const asyncUserStr = await AsyncStorage.getItem('native_user').catch(() => null);
              const savedUser = asyncUserStr ? JSON.parse(asyncUserStr) : getLocalStorageJSON('native_user');
              if (savedUser && (savedUser.phone === fullPhoneNumber || savedUser.phone?.includes(rawDigits.slice(-10)) || savedUser.email === fullPhoneNumber) && savedUser.name) {
                userDoc = {
                  uid: mockUid,
                  phoneNumber: fullPhoneNumber,
                  name: savedUser.name,
                  address: 'Registered User Address',
                  profileCompleted: true,
                  locationVerified: true,
                  notificationEnabled: true,
                  accountType: 'personal',
                  createdAt: nowIso,
                  updatedAt: nowIso,
                  lastLogin: nowIso
                };
              }
            }
          } catch (e) {}
        }
      }
    }

    if (userDoc && userDoc.name && userDoc.name.trim().length > 0) {
      // Returning registered user -> Sign In Process -> Open Home Straightaway!
      registerAccountInMemoryAndStorage(userDoc);

      const activeUser = {
        name: userDoc.name,
        email: userDoc.phoneNumber,
        phone: userDoc.phoneNumber,
        avatar: userDoc.avatar || undefined,
        profileCompleted: true
      };

      if (userDoc.street || userDoc.city) {
        const addr = {
          street: userDoc.street || '',
          place: userDoc.locality || userDoc.area || '',
          city: userDoc.city || '',
          state: userDoc.state || '',
          pin: userDoc.postalCode || '',
          phone: userDoc.phoneNumber
        };
        setUserAddress(addr);
        saveState('native_address', addr);
      }

      if (userDoc.city) {
        const locStr = userDoc.state ? `${userDoc.city}, ${userDoc.state.slice(0, 2).toUpperCase()}` : userDoc.city;
        setActiveLocation(locStr);
        saveState('native_location', locStr);
      }

      // FIRST set onboardingCompleted to true so OnboardingModal NEVER renders
      setOnboardingCompleted(true);
      saveState('native_onboarding', true);
      setJustRegistered(false);

      // THEN set user state
      setUser(activeUser);
      saveState('native_user', activeUser);
      saveState('native_user_doc', userDoc);

      return { isNewUser: false, profileCompleted: true };
    } else {
      // New user or incomplete profile -> Sign Up Process -> Trigger Onboarding
      const minimalDoc: UserDocument = userDoc || {
        uid: mockUid,
        phoneNumber: fullPhoneNumber,
        accountType: 'personal',
        locationVerified: false,
        notificationEnabled: false,
        profileCompleted: false,
        createdAt: nowIso,
        updatedAt: nowIso,
        lastLogin: nowIso
      };

      if (isFirebaseConfigured && db && !userDoc) {
        try {
          await setDoc(doc(db, 'users', mockUid), minimalDoc);
        } catch (e) {
          console.warn('Firestore create minimal user error:', e);
        }
      }

      const activeUser = {
        name: minimalDoc.name || '',
        email: fullPhoneNumber,
        phone: fullPhoneNumber,
        avatar: undefined,
        profileCompleted: false
      };
      setUser(activeUser);
      saveState('native_user', activeUser);
      saveState('native_user_doc', minimalDoc);

      setOnboardingCompleted(false);
      saveState('native_onboarding', false);
      setJustRegistered(true);

      return { isNewUser: !userDoc, profileCompleted: false };
    }
  };

  const completeOnboarding = async (data: {
    name: string;
    street: string;
    area: string;
    locality: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    notificationEnabled: boolean;
  }) => {
    const nowIso = new Date().toISOString();
    const fullAddress = [data.street, data.area, data.locality, data.city, data.state, data.postalCode].filter(Boolean).join(', ');

    const updatedUser = {
      name: data.name.trim(),
      email: user?.phone || '',
      phone: user?.phone || '',
      avatar: user?.avatar || undefined,
      profileCompleted: true
    };
    setUser(updatedUser);
    saveState('native_user', updatedUser);

    const addr = {
      street: data.street,
      place: data.locality || data.area || data.city,
      city: data.city,
      state: data.state,
      pin: data.postalCode,
      phone: user?.phone || ''
    };
    setUserAddress(addr);
    saveState('native_address', addr);

    if (data.city) {
      const locStr = data.state ? `${data.city}, ${data.state.slice(0, 2).toUpperCase()}` : data.city;
      setActiveLocation(locStr);
      saveState('native_location', locStr);
    }

    if (data.latitude && data.longitude) {
      setUserLocation({ latitude: data.latitude, longitude: data.longitude, accuracy: null });
    }

    // Save/Update full document in Firestore `users` collection
    const rawDigits = (user?.phone || '').replace(/[^0-9]/g, '');
    const uid = `usr_${rawDigits}`;
    const userDocData: UserDocument = {
      uid,
      phoneNumber: user?.phone || '',
      name: data.name.trim(),
      address: fullAddress,
      street: data.street,
      area: data.area,
      locality: data.locality,
      city: data.city,
      state: data.state,
      country: data.country || 'India',
      postalCode: data.postalCode,
      latitude: data.latitude,
      longitude: data.longitude,
      locationVerified: true,
      notificationEnabled: data.notificationEnabled,
      profileCompleted: true,
      accountType: 'personal',
      createdAt: nowIso,
      updatedAt: nowIso,
      lastLogin: nowIso
    };

    saveState('native_user_doc', userDocData);
    registerAccountInMemoryAndStorage(userDocData);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'users', uid), userDocData, { merge: true });
      } catch (err) {
        console.warn('Firestore completeOnboarding error:', err);
      }
    }

    setOnboardingCompleted(true);
    saveState('native_onboarding', true);
    setJustRegistered(false);
  };

  const login = async (phone: string): Promise<boolean> => {
    await authenticatePhone(phone);
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

    const newUser = {
      name: name.trim() || 'Neighbor',
      email: phone,
      phone,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
    };
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
      await AsyncStorage.removeItem('native_user').catch(() => {});
      await AsyncStorage.removeItem('native_onboarding').catch(() => {});
      await AsyncStorage.removeItem('native_role').catch(() => {});
      await AsyncStorage.removeItem('native_address').catch(() => {});
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

  const clearUserCredentials = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('Sign out error on clear credentials:', err);
      }
    }
    setUser(null);
    setUserAddress(null);
    setOnboardingCompleted(false);
    setJustRegistered(false);
    setUserRole(null);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('native_user');
        window.localStorage.removeItem('native_onboarding');
        window.localStorage.removeItem('native_role');
        window.localStorage.removeItem('native_address');
        window.localStorage.removeItem('native_location');
      }
    } catch (e) {}
  };

  const updateProfileDetails = (name: string, email?: string, phone?: string, avatar?: string) => {
    if (user) {
      const updatedUser = {
        ...user,
        name,
        email: email || user.email,
        ...(phone !== undefined && { phone }),
        ...(avatar !== undefined && { avatar })
      };
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
    name: user?.name || 'Neighbor',
    avatar: user?.avatar || undefined,
    location: userAddress ? `${userAddress.place ? userAddress.place + ', ' : ''}${userAddress.city || activeLocation}` : activeLocation
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
        postToGroup,
        clearUserCredentials,
        authenticatePhone,
        completeOnboarding
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

