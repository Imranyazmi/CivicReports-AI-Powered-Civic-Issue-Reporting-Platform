import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const updateIssueStatus = async (issueId: string, status: 'pending' | 'in-progress' | 'resolved'): Promise<void> => {
  const issueRef = doc(db, 'issues', issueId);
  await updateDoc(issueRef, { status });
};

export const assignIssue = async (issueId: string, assignedTo: string): Promise<void> => {
  const issueRef = doc(db, 'issues', issueId);
  await updateDoc(issueRef, { assignedTo });
};

export const updateIssuePriority = async (issueId: string, priority: 'Low' | 'Medium' | 'High'): Promise<void> => {
  const issueRef = doc(db, 'issues', issueId);
  await updateDoc(issueRef, { priority });
};