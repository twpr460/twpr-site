export enum QuestionType {
  SINGLE = 'single',
  MULTIPLE = 'multiple', // Select 2 or more
  TRUE_FALSE_MATRIX = 'true_false_matrix', // Series of O/X
  COMBO_SELECT = 'combo_select' // Select A and B from lists
}

export interface MatrixRow {
  id: string;
  text: string;
  answer: boolean; // true = O, false = X
}

export interface Question {
  id: number;
  category: string; // e.g., "是非題", "單選題", "圖像題"
  pdfPage: number;
  text: string;
  type: QuestionType;
  options?: string[]; // For Single/Multiple
  correctOptions?: number[]; // Indices of correct options (0-based) for Single/Multiple
  matrixRows?: MatrixRow[]; // For Matrix type
  
  // For Combo Select (Part A, Part B style)
  comboGroups?: {
    label: string;
    options: string[];
    correctIndex: number;
  }[];

  imageUrl?: string; // Placeholder or link
  explanation?: string;
}

export interface UserState {
  answers: Record<number, any>; // id -> answer payload
  showResults: boolean;
}