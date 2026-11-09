import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  MessagesSquare,
  Mic,
  MicOff,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Volume2,
  Check,
  X
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ScoreGauge } from '../../components/ui/ScoreGauge';
import { apiRequest } from '../../lib/apiClient';

export function MockInterviewPage() {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState('setup'); // setup, active, review
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);

  // Active Session State
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [finalScore, setFinalScore] = useState(80);

  // Voice Recognition State
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = false;
      recog.lang = 'en-US';

      recog.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript.trim()) {
          setCurrentAnswer((prev) => (prev ? prev.trim() + ' ' + transcript.trim() : transcript.trim()));
        }
      };

      recog.onerror = () => setIsRecording(false);
      recog.onend = () => setIsRecording(false);

      recognitionRef.current = recog;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!speechSupported || !recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        setIsRecording(false);
      }
    }
  };

  const handleStartInterview = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/interviews', {
        method: 'POST',
        body: JSON.stringify({
          targetRole,
          difficulty,
          questionCount
        })
      });
      setSessionId(res.session.id);
      setQuestions(res.questions || []);
      setCurrentIndex(0);
      setCurrentAnswer('');
      setShowHint(false);
      setCurrentFeedback(null);
      setViewState('active');
      toast.success('Interview session prepared!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate interview.');
    } finally {
      setLoading(false);
    }
  };

  const currentQ = questions[currentIndex];

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || !currentQ) return;
    setEvaluating(true);
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    try {
      const res = await apiRequest(`/interviews/${sessionId}/answer`, {
        method: 'POST',
        body: JSON.stringify({
          messageId: currentQ.id,
          userAnswer: currentAnswer
        })
      });

      const evalData = res.evaluation;
      setCurrentFeedback(evalData);

      // update question in array
      const updated = [...questions];
      updated[currentIndex].user_answer = currentAnswer;
      updated[currentIndex].evaluation = evalData;
      setQuestions(updated);
      toast.success('Answer evaluated!');
    } catch (err) {
      toast.error('Failed to evaluate answer: ' + err.message);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    setCurrentFeedback(null);
    setCurrentAnswer('');
    setShowHint(false);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleCompleteSession();
    }
  };

  const handleCompleteSession = async () => {
    try {
      const res = await apiRequest(`/interviews/${sessionId}/complete`, { method: 'POST' });
      if (res?.session?.overall_score != null) {
        setFinalScore(res.session.overall_score);
      }
      setViewState('review');
    } catch (e) {
      setViewState('review');
    }
  };

  return (
    <div className="space-y-6">
      {/* State 1: Setup View */}
      {viewState === 'setup' && (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
          <div className="text-center space-y-2">
            <h1 className="font-headline font-extrabold text-3xl text-carbon">
              AI Mock Interview Practice
            </h1>
            <p className="text-xs text-textSecondary max-w-md mx-auto">
              Simulate technical and behavioral interviews tailored to your target role with instant technical depth, communication clarity, and STAR-method scoring.
            </p>
          </div>

          <Card className="p-6 sm:p-8 space-y-6 bg-white border-borderStrong shadow-md">
            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wide mb-2">
                Target Role
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full rounded-standard border border-borderStandard px-3 py-2.5 text-xs focus:ring-2 focus:ring-signature focus:outline-none"
              >
                <option value="Software Engineer">Software Engineer (General)</option>
                <option value="Frontend Developer">Frontend Developer (React / Web UI)</option>
                <option value="Backend Developer">Backend Developer (Python / APIs / DBs)</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Data Scientist">Data Scientist / ML Engineer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wide mb-2">
                Experience Level / Difficulty
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['entry', 'intermediate', 'senior'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 px-3 rounded-btn text-xs font-semibold uppercase tracking-wider border transition ${
                      difficulty === diff
                        ? 'border-signature bg-peach text-burnt shadow-sm'
                        : 'border-borderStandard bg-white text-textSecondary hover:bg-neutralLight'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wide mb-2">
                Questions In Session: <span className="font-bold text-carbon">{questionCount}</span>
              </label>
              <input
                type="range"
                min="3"
                max="8"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full accent-signature cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-textMuted mt-1">
                <span>Quick (3 questions)</span>
                <span>Standard (5 questions)</span>
                <span>In-Depth (8 questions)</span>
              </div>
            </div>

            <div className="p-4 rounded-standard bg-surface border border-surfaceBorder text-xs text-secondary space-y-1">
              <span className="font-bold text-carbon block">Curriculum Breakdown:</span>
              <p>• 1 Background Project Walkthrough</p>
              <p>• 2 Core Technical Problem-Solving Questions</p>
              <p>• 1 Architecture / Skill-Gap Troubleshooting Scenario</p>
              <p>• 1 Behavioral Question Evaluated via STAR Framework</p>
            </div>

            <Button
              variant="primary"
              size="lg"
              loading={loading}
              onClick={handleStartInterview}
              className="w-full"
            >
              <span>Begin Mock Interview</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Card>
        </div>
      )}

      {/* State 2: Active Interview */}
      {viewState === 'active' && currentQ && (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-150">
          {/* Stepper Progress */}
          <div className="flex items-center justify-between pb-3 border-b border-borderStandard text-xs">
            <span className="font-bold text-burnt uppercase tracking-wider">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <Badge variant="carbon" size="sm">
              {currentQ.question_type.toUpperCase()} • {currentQ.difficulty.toUpperCase()}
            </Badge>
          </div>

          {/* Question Card */}
          <Card className="bg-white border-borderStrong p-6 space-y-4">
            <h2 className="font-headline font-bold text-lg sm:text-xl text-carbon leading-relaxed">
              "{currentQ.question_text}"
            </h2>

            {currentQ.target_skill && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-textMuted">Assessing Competency:</span>
                <Badge variant="orange" size="sm">{currentQ.target_skill}</Badge>
              </div>
            )}

            {/* Hint Toggle */}
            {currentQ.hint && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs text-signature hover:text-burnt font-semibold flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? 'Hide Hint' : 'Request Strategy Hint'}</span>
                </button>
                {showHint && (
                  <p className="mt-2 p-3 bg-peach/40 border border-orange-100 rounded text-xs text-burnt leading-relaxed">
                    <strong>Interviewer Tip:</strong> {currentQ.hint}
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Answer Editor & Voice Control */}
          {!currentFeedback ? (
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-carbon uppercase tracking-wider">
                  Your Answer
                </label>

                {speechSupported && (
                  <Button
                    variant={isRecording ? 'danger' : 'outline'}
                    size="sm"
                    icon={isRecording ? MicOff : Mic}
                    onClick={toggleRecording}
                  >
                    {isRecording ? 'Stop Recording' : 'Voice Input (Mic)'}
                  </Button>
                )}
              </div>

              {isRecording && (
                <div className="p-2.5 rounded bg-red-50 border border-red-200 text-xs text-semanticError flex items-center gap-2 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-semanticError" />
                  <span>Listening... Speak clearly into your microphone. Transcribing live.</span>
                </div>
              )}

              <textarea
                rows={6}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type or speak your answer here. Provide specific technical examples, architectural choices, and measurable results..."
                className="w-full rounded-standard border border-borderStandard p-3.5 text-xs focus:ring-2 focus:ring-signature focus:outline-none"
              />

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextQuestion}
                >
                  Skip Question
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  loading={evaluating}
                  onClick={handleSubmitAnswer}
                  disabled={!currentAnswer.trim()}
                >
                  Submit For Evaluation
                </Button>
              </div>
            </Card>
          ) : (
            /* Answer Evaluation Panel */
            <Card className="border-borderStrong bg-white p-6 space-y-6 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-borderStandard">
                <div className="flex items-center gap-2 text-burnt font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-signature" />
                  <span>AI Answer Evaluation</span>
                </div>
                <Badge variant="success">Scored</Badge>
              </div>

              {/* Metric Scores */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-neutralLight/40 rounded border border-borderStandard">
                  <span className="text-[10px] text-textMuted uppercase font-semibold block">Technical Depth</span>
                  <span className="font-headline font-bold text-xl text-carbon">{currentFeedback.technical_depth} / 10</span>
                </div>
                <div className="p-3 bg-neutralLight/40 rounded border border-borderStandard">
                  <span className="text-[10px] text-textMuted uppercase font-semibold block">Communication</span>
                  <span className="font-headline font-bold text-xl text-carbon">{currentFeedback.communication_clarity} / 10</span>
                </div>
                <div className="p-3 bg-neutralLight/40 rounded border border-borderStandard">
                  <span className="text-[10px] text-textMuted uppercase font-semibold block">Relevance</span>
                  <span className="font-headline font-bold text-xl text-carbon">{currentFeedback.relevance} / 10</span>
                </div>
                <div className="p-3 bg-neutralLight/40 rounded border border-borderStandard">
                  <span className="text-[10px] text-textMuted uppercase font-semibold block">Structure</span>
                  <span className="font-headline font-bold text-xl text-carbon">{currentFeedback.structure} / 10</span>
                </div>
              </div>

              {/* STAR Alignment Check for behavioral */}
              {currentFeedback.star_alignment && (
                <div className="p-3.5 bg-surface rounded border border-surfaceBorder space-y-2 text-xs">
                  <span className="font-bold text-carbon block">STAR Framework Alignment:</span>
                  <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-semibold">
                    <span className={`inline-flex items-center justify-center gap-1 ${currentFeedback.star_alignment.situation ? 'text-semanticSuccess' : 'text-textDisabled'}`}>
                      Situation {currentFeedback.star_alignment.situation ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-red-500" />}
                    </span>
                    <span className={`inline-flex items-center justify-center gap-1 ${currentFeedback.star_alignment.task ? 'text-semanticSuccess' : 'text-textDisabled'}`}>
                      Task {currentFeedback.star_alignment.task ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-red-500" />}
                    </span>
                    <span className={`inline-flex items-center justify-center gap-1 ${currentFeedback.star_alignment.action ? 'text-semanticSuccess' : 'text-textDisabled'}`}>
                      Action {currentFeedback.star_alignment.action ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-red-500" />}
                    </span>
                    <span className={`inline-flex items-center justify-center gap-1 ${currentFeedback.star_alignment.result ? 'text-semanticSuccess' : 'text-textDisabled'}`}>
                      Result {currentFeedback.star_alignment.result ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-red-500" />}
                    </span>
                  </div>
                </div>
              )}

              {/* Summary & Suggestions */}
              <div className="space-y-3 text-xs text-textSecondary">
                <p className="bg-peach/30 p-3 rounded border border-orange-100 text-carbon font-medium">
                  {currentFeedback.summary_feedback}
                </p>

                {currentFeedback.areas_for_improvement?.length > 0 && (
                  <div>
                    <span className="font-bold text-carbon block mb-1">Recommended Polish:</span>
                    <ul className="list-disc pl-5 space-y-1">
                      {currentFeedback.areas_for_improvement.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-borderStandard">
                <Button variant="primary" size="md" onClick={handleNextQuestion}>
                  <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'Complete Session'}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* State 3: Session Review */}
      {viewState === 'review' && (
        <div className="max-w-2xl mx-auto space-y-6 text-center animate-in fade-in duration-200">
          <Card className="p-8 space-y-6">
            <div className="w-16 h-16 rounded-full bg-semanticSuccessBg text-semanticSuccess flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="font-headline font-extrabold text-2xl text-carbon">
                Interview Session Completed!
              </h2>
              <p className="text-xs text-textSecondary">
                You evaluated {questions.length} questions for {targetRole}.
              </p>
            </div>

            <div className="flex justify-center py-4">
              <ScoreGauge score={finalScore} maxScore={100} size={150} sublabel="Overall Interview Score" />
            </div>

            <div className="flex justify-center gap-3 pt-4 border-t border-borderStandard">
              <Button variant="outline" size="md" icon={RotateCcw} onClick={() => setViewState('setup')}>
                Retake Another Interview
              </Button>
              <Button variant="primary" size="md" onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
