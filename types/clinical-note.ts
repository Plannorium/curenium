export interface ClinicalNote {
  _id: string;
  content: string;
  visibility: 'team' | 'private' | 'public';
  createdAt: string;
}