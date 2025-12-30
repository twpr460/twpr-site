import React from 'react';
import { Question, QuestionType, MatrixRow } from '../types';
import { Check, X, AlertCircle, Image as ImageIcon, ArrowRight } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  userAnswer: any;
  onAnswer: (answer: any) => void;
  showResult: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  userAnswer,
  onAnswer,
  showResult,
}) => {
  const isCorrect = () => {
    if (!userAnswer) return false;
    
    if (question.type === QuestionType.SINGLE) {
      return question.correctOptions?.[0] === userAnswer;
    }
    if (question.type === QuestionType.MULTIPLE) {
      if (!Array.isArray(userAnswer)) return false;
      const correct = question.correctOptions || [];
      return (
        userAnswer.length === correct.length &&
        userAnswer.every((val: number) => correct.includes(val))
      );
    }
    if (question.type === QuestionType.TRUE_FALSE_MATRIX) {
      // userAnswer is { rowId: boolean }
      return question.matrixRows?.every(row => userAnswer[row.id] === row.answer);
    }
    if (question.type === QuestionType.COMBO_SELECT) {
      // userAnswer is { groupIndex: optionIndex }
      return question.comboGroups?.every((g, i) => userAnswer[i] === g.correctIndex);
    }
    if (question.type === QuestionType.MATCHING) {
      // userAnswer is { leftId: rightId }
      const correctPairs = question.correctMatching || {};
      const keys = Object.keys(correctPairs);
      if (Object.keys(userAnswer).length !== keys.length) return false;
      return keys.every(key => userAnswer[key] === correctPairs[key]);
    }
    return false;
  };

  const getCardBorder = () => {
    if (!showResult) return 'border-gray-200';
    return isCorrect() ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50';
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 mb-6 transition-colors ${getCardBorder()}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-sm">
            {question.id}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {question.category}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            PDF Page {question.pdfPage}
          </span>
        </div>
        {showResult && (
          <div className={`flex items-center gap-1 font-bold ${isCorrect() ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect() ? <Check size={20} /> : <X size={20} />}
            <span>{isCorrect() ? '正確' : '錯誤'}</span>
          </div>
        )}
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-4 whitespace-pre-wrap leading-relaxed">
        {question.text}
      </h3>

      {question.imageUrl && (
        <div className="mb-6 bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
          <img 
            src={question.imageUrl} 
            alt={`Question ${question.id} Reference`}
            className="max-w-full h-auto max-h-[300px] object-contain rounded shadow-sm"
          />
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <ImageIcon size={12} />
            示意圖 (請對照原始 PDF 第 {question.pdfPage} 頁)
          </div>
        </div>
      )}

      {/* Render Options based on type */}
      <div className="space-y-3">
        {/* SINGLE CHOICE */}
        {question.type === QuestionType.SINGLE && (
          <div className="flex flex-col gap-2">
            {question.options?.map((opt, idx) => {
              const isSelected = userAnswer === idx;
              const isActuallyCorrect = showResult && question.correctOptions?.includes(idx);
              const isWrongSelection = showResult && isSelected && !isActuallyCorrect;

              return (
                <button
                  key={idx}
                  onClick={() => !showResult && onAnswer(idx)}
                  disabled={showResult}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isActuallyCorrect 
                      ? 'bg-green-100 border-green-500 text-green-900 font-medium'
                      : isWrongSelection
                      ? 'bg-red-100 border-red-500 text-red-900'
                      : isSelected
                      ? 'bg-blue-50 border-blue-500 text-blue-900'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="font-mono text-gray-500">{idx + 1}.</span>
                    <span>{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* MULTIPLE CHOICE */}
        {question.type === QuestionType.MULTIPLE && (
          <div className="flex flex-col gap-2">
            <div className="text-sm text-gray-500 mb-2 font-medium">請選擇 2 個答案:</div>
            {question.options?.map((opt, idx) => {
              const currentAnswers = (userAnswer as number[]) || [];
              const isSelected = currentAnswers.includes(idx);
              const isActuallyCorrect = showResult && question.correctOptions?.includes(idx);
              const isWrongSelection = showResult && isSelected && !isActuallyCorrect;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (showResult) return;
                    if (isSelected) {
                      onAnswer(currentAnswers.filter(a => a !== idx));
                    } else {
                      if (currentAnswers.length < (question.correctOptions?.length || 2)) {
                        onAnswer([...currentAnswers, idx]);
                      }
                    }
                  }}
                  disabled={showResult}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isActuallyCorrect 
                      ? 'bg-green-100 border-green-500 text-green-900 font-medium'
                      : isWrongSelection
                      ? 'bg-red-100 border-red-500 text-red-900'
                      : isSelected
                      ? 'bg-blue-50 border-blue-500 text-blue-900'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex gap-3 items-center">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}>
                      {isSelected && <Check size={14} />}
                    </div>
                    <span>{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* TRUE/FALSE MATRIX */}
        {question.type === QuestionType.TRUE_FALSE_MATRIX && (
          <div className="overflow-hidden border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">敘述</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">O (是)</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">X (否)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {question.matrixRows?.map((row) => {
                  const currentVal = userAnswer?.[row.id];
                  const isRowCorrect = showResult && currentVal === row.answer;
                  
                  return (
                    <tr key={row.id} className={showResult ? (isRowCorrect ? 'bg-green-50' : 'bg-red-50') : ''}>
                      <td className="px-6 py-4 text-sm text-gray-900">{row.text}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => !showResult && onAnswer({ ...userAnswer, [row.id]: true })}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center mx-auto ${
                            currentVal === true 
                              ? 'bg-green-600 text-white border-green-600' 
                              : 'border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          O
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => !showResult && onAnswer({ ...userAnswer, [row.id]: false })}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center mx-auto ${
                            currentVal === false
                              ? 'bg-red-600 text-white border-red-600' 
                              : 'border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {showResult && (
              <div className="p-2 bg-gray-100 text-xs text-center text-gray-600">
                正確答案: {question.matrixRows?.map(r => `${r.id}: ${r.answer ? 'O' : 'X'}`).join(', ')}
              </div>
            )}
          </div>
        )}

        {/* COMBO SELECT (Dropdown Simulation) */}
        {question.type === QuestionType.COMBO_SELECT && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            {question.comboGroups?.map((group, groupIdx) => {
              const selectedOptIdx = userAnswer?.[groupIdx];
              const isGroupCorrect = showResult && selectedOptIdx === group.correctIndex;

              return (
                <div key={groupIdx} className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="font-bold text-gray-700 min-w-[3rem]">{group.label}:</span>
                  <div className="flex-1 flex flex-wrap gap-2">
                    {group.options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => !showResult && onAnswer({...userAnswer, [groupIdx]: optIdx})}
                        disabled={showResult}
                        className={`px-3 py-2 text-sm rounded border transition-colors ${
                          selectedOptIdx === optIdx
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        } ${showResult && group.correctIndex === optIdx ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}
                      >
                         {optIdx + 1}. {opt}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MATCHING TYPE */}
        {question.type === QuestionType.MATCHING && (
          <div className="space-y-4">
             <div className="text-sm text-gray-500 mb-2">請為左側每個項目選擇正確的右側對應選項：</div>
             <div className="grid grid-cols-1 gap-3">
                {question.matchingItems?.map((item) => {
                   const selectedTargetId = userAnswer?.[item.id] || "";
                   const correctTargetId = question.correctMatching?.[item.id];
                   const isItemCorrect = showResult && selectedTargetId === correctTargetId;
                   const correctTarget = question.matchingTargets?.find(t => t.id === correctTargetId);

                   return (
                      <div key={item.id} className={`p-4 rounded-lg border transition-colors ${showResult ? (isItemCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200') : 'bg-white border-gray-200'}`}>
                         <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex-1 font-medium text-gray-800">
                               <span className="inline-block w-6 font-bold text-blue-600">{item.id}.</span>
                               {item.text}
                            </div>
                            
                            <div className="hidden md:block text-gray-400">
                               <ArrowRight size={20} />
                            </div>

                            <div className="flex-1">
                               <select
                                  className={`w-full p-2 border rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${showResult ? 'opacity-80' : ''}`}
                                  value={selectedTargetId}
                                  onChange={(e) => !showResult && onAnswer({...userAnswer, [item.id]: e.target.value})}
                                  disabled={showResult}
                               >
                                  <option value="">請選擇...</option>
                                  {question.matchingTargets?.map(target => (
                                     <option key={target.id} value={target.id}>
                                        {target.id}. {target.text}
                                     </option>
                                  ))}
                               </select>
                            </div>
                         </div>
                         
                         {showResult && !isItemCorrect && (
                            <div className="mt-2 text-sm text-red-600 flex items-center gap-1 pl-1 md:pl-0">
                               <AlertCircle size={14} />
                               <span>正確答案: {correctTargetId}. {correctTarget?.text}</span>
                            </div>
                         )}
                      </div>
                   );
                })}
             </div>
          </div>
        )}
      </div>

      {showResult && !isCorrect() && question.type !== QuestionType.MATCHING && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg flex gap-2">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">正確答案提示:</span>
            <div className="mt-1">
               {question.type === QuestionType.SINGLE && `選項 ${question.correctOptions![0] + 1}`}
               {question.type === QuestionType.MULTIPLE && `選項 ${question.correctOptions!.map(i => i + 1).join(' 和 ')}`}
               {question.type === QuestionType.TRUE_FALSE_MATRIX && '請參考上方表格標記'}
               {question.type === QuestionType.COMBO_SELECT && question.comboGroups?.map(g => `${g.label}: ${g.options[g.correctIndex]}`).join(', ')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
