import React, { useState } from 'react';
import { X, Sparkles, Loader2, Calendar } from 'lucide-react';
import { parseScheduleWithAI } from '../services/geminiService';
import { Session, SessionStatus } from '../types';
import { v4 as uuidv4 } from 'uuid'; // NOTE: Ideally use uuid lib, but for this mock environment I'll use a simple random string generator if uuid isn't available, but standard prompts allow popular libs. I'll use a helper.

// Simple ID generator to avoid deps
const generateId = () => Math.random().toString(36).substr(2, 9);

interface SmartAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: Session) => void;
}

export const SmartAddModal: React.FC<SmartAddModalProps> = ({ isOpen, onClose, onSave }) => {
  const [mode, setMode] = useState<'manual' | 'ai'>('ai');
  const [aiInput, setAiInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  // Manual Form State
  const [formData, setFormData] = useState<Partial<Session>>({
    studentName: '',
    subject: '',
    startTime: '',
    durationMinutes: 60,
    rate: 0,
    status: SessionStatus.SCHEDULED,
    notes: ''
  });

  if (!isOpen) return null;

  const handleAiAnalyze = async () => {
    if (!aiInput.trim()) return;
    setIsAnalyzing(true);
    setError('');

    try {
      const result = await parseScheduleWithAI(aiInput);
      if (result) {
        setFormData({
            ...formData,
            ...result,
            status: SessionStatus.SCHEDULED,
            // Ensure date is formatted for datetime-local input (YYYY-MM-DDTHH:mm)
            startTime: result.startTime ? new Date(result.startTime).toISOString().slice(0, 16) : ''
        });
        setMode('manual'); // Switch to manual for review
      } else {
        setError('Could not understand the input. Please try again or use manual mode.');
      }
    } catch (e) {
      setError('AI service unavailable. Please use manual entry.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName || !formData.startTime) {
      setError('Please fill in required fields.');
      return;
    }

    const newSession: Session = {
      id: generateId(),
      createdAt: Date.now(),
      studentName: formData.studentName || 'Unknown',
      subject: formData.subject || 'General',
      startTime: new Date(formData.startTime).toISOString(),
      durationMinutes: formData.durationMinutes || 60,
      rate: formData.rate || 0,
      status: formData.status || SessionStatus.SCHEDULED,
      notes: formData.notes || ''
    };

    onSave(newSession);
    // Reset
    setAiInput('');
    setFormData({
        studentName: '',
        subject: '',
        startTime: '',
        durationMinutes: 60,
        rate: 0,
        status: SessionStatus.SCHEDULED,
        notes: ''
    });
    setMode('ai');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            {mode === 'ai' ? <Sparkles className="text-purple-600" size={20}/> : <Calendar className="text-blue-600" size={20}/>}
            {mode === 'ai' ? 'Smart Schedule' : 'New Session'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {mode === 'ai' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Describe the session naturally. For example: <br/>
                <span className="italic text-gray-400">"Chemistry with Alex tomorrow at 5pm for $40"</span>
              </p>
              
              <textarea
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Type here..."
                className="w-full p-4 rounded-xl border-2 border-purple-100 focus:border-purple-500 focus:ring-0 resize-none h-32 text-gray-800 placeholder:text-gray-300 transition-colors"
                autoFocus
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                 <button 
                  onClick={() => setMode('manual')}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  Manual Entry
                </button>
                <button 
                  onClick={handleAiAnalyze}
                  disabled={!aiInput.trim() || isAnalyzing}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18}/>}
                  {isAnalyzing ? 'Analyzing...' : 'Auto-Fill'}
                </button>
              </div>
            </div>
          ) : (
            <form id="session-form" onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Student Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.studentName}
                    onChange={e => setFormData({...formData, studentName: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Subject</label>
                  <input 
                    type="text" 
                    required
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Date & Time</label>
                <input 
                  type="datetime-local" 
                  required
                  value={formData.startTime}
                  onChange={e => setFormData({...formData, startTime: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Duration (mins)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={formData.durationMinutes}
                    onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Rate ($)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={formData.rate}
                    onChange={e => setFormData({...formData, rate: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

               <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Notes</label>
                  <textarea 
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none h-20 resize-none transition-all"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                   <button 
                    type="button"
                    onClick={() => setMode('ai')}
                    className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-700 font-medium"
                  >
                    Back to AI
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                  >
                    Save Session
                  </button>
                </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
