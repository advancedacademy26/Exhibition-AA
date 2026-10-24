export interface ExhibitionZone {
  id: string;
  zoneNumber: number;
  title: string;
  subtitle: string;
  category: string;
  location: string;
  description: string;
  secretCode: string;
  badgeIcon: string;
  badgeTitle: string;
  highlights: string[];
  imageUrl?: string;
}

export interface Visitor {
  id: number;
  passportCode: string;
  name: string;
  studentName?: string | null;
  classGrade: string;
  section: string;
  relation?: string | null;
  phone?: string | null;
  stampsCollected: string[];
  certificateId?: string | null;
  completedAt?: string | null;
  createdAt: string;
  avatarUrl?: string | null;
}

export interface AppCustomMediaSettings {
  schoolName: string;
  eventName: string;
  passportImage: string;
  welcomeImage: string;
  routeImage: string;
  stampImage: string;
  certificateImage: string;
  completionImage: string;
}
