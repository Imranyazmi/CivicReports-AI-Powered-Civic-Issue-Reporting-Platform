import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  lastLoginAt: string;
}

export const saveUserProfile = async (userData: UserProfile): Promise<void> => {
  const userRef = doc(db, 'users', userData.id);
  await setDoc(userRef, {
    ...userData,
    lastLoginAt: new Date().toISOString()
  }, { merge: true });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
};

export const updateUserAvatar = async (userId: string, avatar: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      avatar,
      lastLoginAt: new Date().toISOString()
    }, { merge: true });
    console.log('Avatar updated successfully in database');
  } catch (error) {
    console.error('Failed to update avatar in database:', error);
    throw error;
  }
};

export const getUserIssues = async (userEmail: string) => {
  const issuesRef = collection(db, 'issues');
  const q = query(issuesRef, where('reportedBy', '==', userEmail));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};