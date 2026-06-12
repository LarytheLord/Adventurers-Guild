"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  X, 
  Loader2
} from "lucide-react";

const INTEREST_OPTIONS = [
  "Frontend Development",
  "Backend Development",
  "Fullstack Development",
  "Mobile Apps",
  "AI / Machine Learning",
  "DevOps & Cloud",
  "Security & Ethical Hacking",
  "QA & Testing",
  "UI/UX Design",
  "Data Science"
];

const PRESET_SKILLS = [
  "React", "Node.js", "TypeScript", "Python", "SQL", 
  "Tailwind CSS", "Next.js", "Docker", "Git", "Figma"
];

export function OnboardingPrompt() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [studentType, setStudentType] = useState<"college" | "school" | "professional" | "">("");
  const [institutionName, setInstitutionName] = useState("");
  const [yearOrExperience, setYearOrExperience] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [dailyWorkHours, setDailyWorkHours] = useState("");
  const [expectations, setExpectations] = useState("");

  // Check onboarding status
  useEffect(() => {
    if (session?.user && session.user.role === "adventurer") {
      fetch("/api/user/onboarding")
        .then((res) => res.json())
        .then((data) => {
          if (data.onboardingCompleted === false) {
            setIsOpen(true);
          }
          setIsLoadingStatus(false);
        })
        .catch((err) => {
          console.error("Error loading onboarding status:", err);
          setIsLoadingStatus(false);
        });
    } else {
      setIsLoadingStatus(false);
    }
  }, [session]);

  const addSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!studentType) {
        toast.error("Please select your career status");
        return;
      }
      if (!institutionName) {
        toast.error(`Please enter the name of your ${studentType === "professional" ? "workplace" : "college/school"}`);
        return;
      }
      if (!yearOrExperience) {
        toast.error("Please specify your year or experience level");
        return;
      }
    } else if (step === 2) {
      if (skills.length === 0) {
        toast.error("Please add at least one skill");
        return;
      }
      if (selectedInterests.length === 0) {
        toast.error("Please select at least one interest field");
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyWorkHours || expectations.length < 10) {
      toast.error("Please specify daily hours and write expectations (minimum 10 characters)");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentType,
          institutionName,
          yearOrExperience,
          skills,
          interests: selectedInterests,
          dailyWorkHours,
          expectations
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit onboarding");
      }

      toast.success("Welcome aboard, Adventurer!");
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamically render the year or experience selection depending on studentType
  const renderYearOrExperienceSelect = () => {
    if (studentType === "college") {
      return (
        <select
          value={yearOrExperience}
          onChange={(e) => setYearOrExperience(e.target.value)}
          className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black text-sm"
        >
          <option value="">Select your College Year</option>
          <option value="1st Year">1st Year</option>
          <option value="2nd Year">2nd Year</option>
          <option value="3rd Year">3rd Year</option>
          <option value="4th Year">4th Year</option>
          <option value="Postgraduate/Other">Postgraduate/Other</option>
        </select>
      );
    } else if (studentType === "school") {
      return (
        <select
          value={yearOrExperience}
          onChange={(e) => setYearOrExperience(e.target.value)}
          className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black text-sm"
        >
          <option value="">Select your Class / Standard</option>
          {Array.from({ length: 8 }, (_, i) => i + 5).map((num) => (
            <option key={num} value={`Class ${num}th`}>Class {num}th</option>
          ))}
          <option value="Other">Other</option>
        </select>
      );
    } else if (studentType === "professional") {
      return (
        <select
          value={yearOrExperience}
          onChange={(e) => setYearOrExperience(e.target.value)}
          className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black text-sm"
        >
          <option value="">Select your Work Experience</option>
          <option value="Less than 1 year">Less than 1 year</option>
          <option value="1-2 years">1-2 years</option>
          <option value="3-5 years">3-5 years</option>
          <option value="5+ years">5+ years</option>
        </select>
      );
    }
    return (
      <input
        type="text"
        placeholder="Select career status first..."
        disabled
        className="w-full h-10 px-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm"
      />
    );
  };

  if (isLoadingStatus || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white text-slate-900 w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 border border-slate-100 max-h-[95dvh] sm:max-h-[calc(100dvh-32px)]">

        {/* Left branding panel — horizontal strip on mobile, full sidebar on md+ */}
        <div className="bg-gradient-to-br from-orange-600 to-amber-500 text-white md:w-1/3 flex md:flex-col md:justify-between relative overflow-hidden flex-row items-center gap-4 p-4 md:p-8">
          <div className="relative z-10 flex md:flex-col items-center md:items-start gap-3 md:gap-0">
            <div className="inline-flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm p-1.5 md:mb-6">
              <img src="/logo/guild-logo.png" alt="Guild Logo" className="h-full w-full object-contain invert brightness-0" />
            </div>
            <div>
              <h2 className="text-base md:text-2xl font-bold tracking-tight md:mb-2 font-display">Claim Your Identity</h2>
              <p className="text-white/85 text-[11px] leading-relaxed hidden md:block">
                Configure your profile parameters to adjust matching quest ranks and unlock custom recommendations.
              </p>
            </div>
          </div>

          <div className="relative z-10 md:pt-8 md:mt-auto flex flex-col gap-2 ml-auto md:ml-0">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-white' : 'bg-white/40'}`}></span>
              <span className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/40'}`}></span>
              <span className={`h-2 w-2 rounded-full ${step >= 3 ? 'bg-white' : 'bg-white/40'}`}></span>
              <span className="text-xs font-semibold uppercase tracking-wider ml-1">Step {step} of 3</span>
            </div>
          </div>
        </div>

        {/* Right form panel — scrollable content, pinned action buttons */}
        <div className="md:w-2/3 flex flex-col flex-1 min-h-0 bg-white overflow-hidden">

          {/* Scrollable form content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 min-h-0">

          {/* STEP 1: BACKGROUND */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-slate-800 font-display">Tell us about yourself</h3>
                <p className="text-xs text-slate-500">Provide details about your current academic or work standing.</p>
              </div>

              {/* Career Status selector */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">Career Status</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "college", label: "College Student" },
                    { id: "school", label: "School Student" },
                    { id: "professional", label: "Professional" }
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        setStudentType(type.id as any);
                        setYearOrExperience("");
                      }}
                      className={`py-3 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                        studentType === type.id
                          ? 'bg-orange-50 text-orange-600 border-orange-500 shadow-sm'
                          : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Institution / Place of work */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  {studentType === "professional" 
                    ? "Company / Workplace Name" 
                    : studentType === "school" 
                      ? "School Name" 
                      : "College / University Name"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    studentType === "professional" 
                      ? "e.g. Acme Tech Corporation" 
                      : "e.g. Stanford University"
                  }
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white text-black"
                />
              </div>

              {/* Year or Experience dropdown */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  {studentType === "professional" 
                    ? "Working Experience" 
                    : studentType === "school" 
                      ? "Class / Standard" 
                      : "Current Year"}
                </label>
                {renderYearOrExperienceSelect()}
              </div>
            </div>
          )}

          {/* STEP 2: SKILLS & INTERESTS */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-slate-800 font-display">Skills & Interests</h3>
                <p className="text-xs text-slate-500">Highlight your current capabilities and the tracks you want to explore.</p>
              </div>

              {/* Skills input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Your Skills</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a skill and hit enter"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill(skillInput);
                      }
                    }}
                    className="flex-1 h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white text-black"
                  />
                  <button
                    type="button"
                    onClick={() => addSkill(skillInput)}
                    className="h-10 px-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>

                {/* Preset skills list for quick add */}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {PRESET_SKILLS.filter(s => !skills.includes(s)).slice(0, 5).map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addSkill(skill)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 py-1 px-2.5 rounded-full font-medium transition-colors"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>

                {/* Skills tags list */}
                <div className="flex flex-wrap gap-2 mt-2 max-h-[80px] overflow-y-auto p-1.5 border border-slate-100 rounded-lg bg-slate-50/50">
                  {skills.length === 0 ? (
                    <p className="text-xs text-slate-400 p-1">No skills added yet.</p>
                  ) : (
                    skills.map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 border border-orange-100 text-xs font-semibold py-1 pl-2.5 pr-1.5 rounded-full">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="hover:bg-orange-100 rounded-full p-0.5 transition-colors">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Interests multi-select */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Fields of Interest</label>
                <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto p-1.5 border border-slate-100 rounded-lg">
                  {INTEREST_OPTIONS.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`text-left p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: LOGISTICS & EXPECTATIONS */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-slate-800 font-display">Logistics & Expectations</h3>
                <p className="text-xs text-slate-500">Help us understand your availability and career ambitions.</p>
              </div>

              {/* Daily commitment */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">How much can you work daily?</label>
                <select
                  required
                  value={dailyWorkHours}
                  onChange={(e) => setDailyWorkHours(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-black text-sm"
                >
                  <option value="">Select commitment</option>
                  <option value="1-2 hours">1-2 hours / day</option>
                  <option value="2-4 hours">2-4 hours / day</option>
                  <option value="4-6 hours">4-6 hours / day</option>
                  <option value="6+ hours">6+ hours / day</option>
                </select>
              </div>

              {/* Expectations textarea */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">What are your expectations from the Guild?</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us what you expect to achieve, build, or learn. Minimum 10 characters."
                  value={expectations}
                  onChange={(e) => setExpectations(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white text-black resize-none"
                />
              </div>
            </div>
          )}

          </div>{/* end scrollable form content */}

          {/* Action buttons — always visible, pinned at bottom */}
          <div className="flex gap-3 border-t border-slate-100 px-6 md:px-8 py-4 justify-between flex-shrink-0 bg-white">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                disabled={isSubmitting}
                className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors py-2 px-3.5 hover:bg-slate-50 rounded-lg"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-colors min-h-[44px]"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !dailyWorkHours || expectations.length < 10}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-colors disabled:opacity-50 inline-flex items-center justify-center min-w-[150px] min-h-[44px]"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  "Complete Onboarding"
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
