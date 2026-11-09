import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { apiRequest } from '../../lib/apiClient';

const ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'AI / ML Engineer',
  'DevOps / Cloud Engineer'
];

const SKILL_OPTIONS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'FastAPI',
  'PostgreSQL', 'SQL', 'Docker', 'Kubernetes', 'AWS', 'Git',
  'REST API', 'GraphQL', 'Tailwind CSS', 'Next.js', 'Redis'
];

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [careerStatus, setCareerStatus] = useState('entry_level');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [location, setLocation] = useState('Remote');
  const [selectedSkills, setSelectedSkills] = useState(['Python', 'JavaScript', 'React', 'SQL', 'Git']);
  const [studyHours, setStudyHours] = useState(10);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await apiRequest('/profiles/me', {
        method: 'PATCH',
        body: JSON.stringify({
          career_status: careerStatus,
          target_role: targetRole,
          location,
          skills: selectedSkills,
          study_hours_per_week: Number(studyHours),
          onboarding_completed: true
        })
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to save profile:', err);
      navigate('/dashboard'); // Proceed anyway for local flow
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="max-w-2xl w-full border-surfaceBorder shadow-2xl bg-surfaceCard p-6 sm:p-10 space-y-8">
        {/* Progress Header */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs text-textMuted font-semibold uppercase tracking-wider">
            <span>Candidate Onboarding</span>
            <span>Step {step} of 4</span>
          </div>
          <div className="w-full bg-borderStandard h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-signature h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Career Status */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <h2 className="font-headline font-bold text-2xl text-carbon">What is your current career status?</h2>
              <p className="text-xs text-textSecondary mt-1">This tailors your resume scoring benchmarks and roadmap pace.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'student', title: 'University Student', desc: 'Preparing for internships or upcoming graduation' },
                { id: 'entry_level', title: 'Fresh Graduate / Junior', desc: 'Actively targeting 0-2 years experience roles' },
                { id: 'switcher', title: 'Career Switcher', desc: 'Transitioning technical domain or software focus' },
                { id: 'professional', title: 'Working Professional', desc: 'Seeking mid-to-senior level promotion or switch' }
              ].map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setCareerStatus(opt.id)}
                  className={`p-4 rounded-standard border cursor-pointer transition-all ${
                    careerStatus === opt.id
                      ? 'border-signature bg-peach/40 shadow-sm'
                      : 'border-borderStandard hover:border-borderStrong bg-white'
                  }`}
                >
                  <div className="font-bold text-sm text-carbon flex items-center justify-between">
                    <span>{opt.title}</span>
                    {careerStatus === opt.id && <Check className="w-4 h-4 text-burnt" />}
                  </div>
                  <p className="text-xs text-textSecondary mt-1">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Target Role & Location */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <h2 className="font-headline font-bold text-2xl text-carbon">What is your primary target role?</h2>
              <p className="text-xs text-textSecondary mt-1">We align your ATS keyword density and mock interview questions to this role.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wide mb-2">
                  Target Technical Role
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ROLES.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setTargetRole(role)}
                      className={`px-3.5 py-2.5 rounded-btn text-xs font-semibold text-left border transition ${
                        targetRole === role
                          ? 'border-signature bg-peach text-burnt shadow-sm'
                          : 'border-borderStandard bg-white text-carbon hover:bg-neutralLight'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Preferred Location / Work Style"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote, Hybrid (New York), Austin TX"
              />
            </div>
          </div>
        )}

        {/* Step 3: Current Skills */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <h2 className="font-headline font-bold text-2xl text-carbon">Select your current skills</h2>
              <p className="text-xs text-textSecondary mt-1">Pick technologies you have worked with or learned in coursework.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map(skill => {
                const selected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                      selected
                        ? 'border-signature bg-signature text-white shadow-sm'
                        : 'border-borderStandard bg-white text-textSecondary hover:border-borderStrong'
                    }`}
                  >
                    <span>{skill}</span>
                    {selected && <Check className="w-3 h-3 inline ml-1.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Available Study Hours */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <h2 className="font-headline font-bold text-2xl text-carbon">Weekly study commitment</h2>
              <p className="text-xs text-textSecondary mt-1">How many hours per week can you allocate toward bridging skill gaps?</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-carbon">{studyHours} Hours / week</span>
                <span className="text-xs text-textMuted">Estimated 6-8 weeks to role readiness</span>
              </div>
              <input
                type="range"
                min="4"
                max="30"
                step="2"
                value={studyHours}
                onChange={(e) => setStudyHours(e.target.value)}
                className="w-full accent-signature cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-standard bg-peach/40 border border-orange-200 space-y-1">
              <div className="flex items-center gap-1.5 text-burnt font-bold text-xs">
                <Sparkles className="w-4 h-4 text-signature" />
                <span>Ready to Launch Career Intelligence</span>
              </div>
              <p className="text-xs text-textSecondary leading-relaxed">
                We'll now configure your dashboard, seed your target role benchmarks, and prepare the ATS scoring workspace.
              </p>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-borderStandard">
          {step > 1 ? (
            <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)} icon={ArrowLeft}>
              Back
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            {step < 4 ? (
              <Button variant="primary" size="md" onClick={() => setStep(step + 1)}>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button variant="primary" size="md" loading={loading} onClick={handleFinish}>
                <span>Enter Workspace</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
