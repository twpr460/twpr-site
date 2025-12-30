import React, { useState, useMemo } from 'react';
import { questions } from './data/questions';
import { QuestionCard } from './components/QuestionCard';
import { UserState } from './types';
import { Layout, CheckSquare, Award, RotateCcw, BookOpen } from 'lucide-react';

export default function App() {
  const [filter, setFilter] = useState<string>('all');
  const [userState, setUserState] = useState<UserState>({
    answers: {},
    showResults: false,
  });

  const categories = useMemo(() => {
    const cats = new Set(questions.map(q => q.category));
    return ['all', ...Array.from(cats)];
  }, []);

  const filteredQuestions = useMemo(() => {
    if (filter === 'all') return questions;
    return questions.filter(q => q.category === filter);
  }, [filter]);

  const handleAnswer = (questionId: number, answer: any) => {
    setUserState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer
      }
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    let total = questions.length; // Calculate based on ALL questions, not just filtered
    
    // Helper to check single question correctness (logic duplicated from QuestionCard for summary)
    // In a real app, this logic should be centralized.
    questions.forEach(q => {
      const ans = userState.answers[q.id];
      if (!ans && ans !== 0 && ans !== false) return;

      let isCorrect = false;
      if (q.type === 'single') {
        isCorrect = q.correctOptions?.[0] === ans;
      } else if (q.type === 'multiple') {
        if (Array.isArray(ans)) {
          const correctOpts = q.correctOptions || [];
          isCorrect = ans.length === correctOpts.length && ans.every((v: number) => correctOpts.includes(v));
        }
      } else if (q.type === 'true_false_matrix') {
        isCorrect = q.matrixRows?.every(row => ans[row.id] === row.answer) ?? false;
      } else if (q.type === 'combo_select') {
         isCorrect = q.comboGroups?.every((g, i) => ans[i] === g.correctIndex) ?? false;
      }

      if (isCorrect) correct++;
    });

    return { correct, total };
  };

  const score = calculateScore();
  const progress = (Object.keys(userState.answers).length / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Layout className="text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800 hidden sm:block">CCST Networking 模擬試題</h1>
            <h1 className="text-xl font-bold text-gray-800 sm:hidden">CCST Prep</h1>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Progress Bar for Mobile */}
             <div className="w-24 h-2 bg-gray-200 rounded-full sm:hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
             </div>

            <button
              onClick={() => {
                if(confirm('確定要重置所有答案嗎？')) {
                  setUserState({ answers: {}, showResults: false });
                }
              }}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
              title="重置"
            >
              <RotateCcw size={20} />
            </button>
            <button 
              onClick={() => setUserState(prev => ({ ...prev, showResults: !prev.showResults }))}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                userState.showResults 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {userState.showResults ? <BookOpen size={18}/> : <CheckSquare size={18}/>}
              {userState.showResults ? '隱藏答案' : '交卷 / 顯示答案'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar / Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">題目分類</div>
            <div className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex justify-between ${
                    filter === cat 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="capitalize">{cat === 'all' ? '全部題目' : cat}</span>
                  <span className="bg-gray-100 text-gray-500 py-0.5 px-2 rounded-full text-xs">
                    {cat === 'all' ? questions.length : questions.filter(q => q.category === cat).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4 sticky top-24">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">目前進度</div>
            <div className="flex items-center justify-between mb-2">
               <span className="text-3xl font-bold text-gray-800">{score.correct}</span>
               <span className="text-sm text-gray-500">/ {score.total} 題正確</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
              <div 
                className="bg-green-500 h-2.5 rounded-full transition-all duration-1000" 
                style={{ width: `${(score.correct / score.total) * 100}%` }}
              ></div>
            </div>
            
            <div className="text-xs text-gray-500 flex justify-between">
              <span>已作答: {Object.keys(userState.answers).length}</span>
              <span>未作答: {questions.length - Object.keys(userState.answers).length}</span>
            </div>

            {userState.showResults && (
              <div className="mt-4 pt-4 border-t text-center">
                 <div className="inline-flex items-center justify-center p-3 bg-yellow-50 rounded-full mb-2">
                    <Award className="text-yellow-600" size={24} />
                 </div>
                 <div className="text-lg font-bold text-gray-800">
                   {Math.round((score.correct / score.total) * 100)} 分
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Question List */}
        <div className="lg:col-span-3">
          {filteredQuestions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              userAnswer={userState.answers[q.id]}
              onAnswer={(ans) => handleAnswer(q.id, ans)}
              showResult={userState.showResults}
            />
          ))}
          
          <div className="text-center py-12 text-gray-500">
             You've reached the end of the {filter === 'all' ? '' : filter} section.
          </div>
        </div>

      </main>
    </div>
  );
}