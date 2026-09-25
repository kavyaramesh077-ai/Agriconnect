import React, { useState, useEffect } from 'react';
import { X, Smartphone, KeyRound, CheckCircle2, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';
import { LanguageCode, FarmerProfile } from '../types';
import { TRANSLATIONS, LANGUAGES } from '../i18n/translations';
import { api } from '../services/api';

interface FarmerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  onLoginSuccess: (profile: FarmerProfile, token: string) => void;
  existingFarmer: FarmerProfile | null;
}

export const FarmerAuthModal: React.FC<FarmerAuthModalProps> = ({
  isOpen,
  onClose,
  language,
  onLoginSuccess,
  existingFarmer,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [step, setStep] = useState<'MOBILE' | 'OTP' | 'REGISTER'>('MOBILE');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [devOtpInfo, setDevOtpInfo] = useState<{ isDev: boolean; code?: string } | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Registration Form
  const [name, setName] = useState('');
  const [prefLang, setPrefLang] = useState<LanguageCode>(language);
  const [state, setState] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('Krishnagiri');
  const [village, setVillage] = useState('Rayakottai');
  const [fpoName, setFpoName] = useState('');
  const [primaryCrops, setPrimaryCrops] = useState<string[]>(['Tomato']);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.sendOtp(mobile.trim());
      if (res.success) {
        setDevOtpInfo({ isDev: !!res.devMode, code: res.devOtp });
        setStep('OTP');
        setCooldown(60);
      } else {
        setErrorMsg(res.message || 'Failed to send OTP.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (otp.length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP received.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.verifyOtp(mobile.trim(), otp.trim());
      if (res.success && res.token) {
        setSessionToken(res.token);
        if (res.isNewUser || !res.profile) {
          setStep('REGISTER');
        } else {
          onLoginSuccess(res.profile, res.token);
          onClose();
        }
      } else {
        setErrorMsg(res.message || 'Invalid OTP entered.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !village.trim()) {
      setErrorMsg('Please enter your Name and Village.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.registerFarmer({
        token: sessionToken,
        name: name.trim(),
        language: prefLang,
        state,
        district,
        village: village.trim(),
        fpoName: fpoName.trim() || undefined,
        primaryCrops,
      });

      if (res.success && res.profile) {
        onLoginSuccess(res.profile, sessionToken);
        onClose();
      } else {
        setErrorMsg(res.message || 'Registration failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration error.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCrop = (c: string) => {
    if (primaryCrops.includes(c)) {
      if (primaryCrops.length > 1) {
        setPrimaryCrops(primaryCrops.filter((item) => item !== c));
      }
    } else {
      setPrimaryCrops([...primaryCrops, c]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Smartphone className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              {step === 'REGISTER' ? t.registerTitle : t.loginTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-800 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Enter Mobile */}
        {step === 'MOBILE' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <p className="text-xs text-stone-600 leading-relaxed">
              {t.loginSubtitle}
            </p>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                {t.enterMobile}
              </label>
              <div className="flex gap-2">
                <span className="py-2.5 px-3 rounded-xl border border-stone-300 bg-stone-100 text-stone-700 font-bold text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  placeholder="98421 09876"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 text-base font-bold tracking-wider py-2.5 px-3.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || mobile.length !== 10}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-sm font-bold shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Sending...' : t.sendOtp}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {/* Development OTP Banner */}
            {devOtpInfo?.isDev && devOtpInfo.code && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <span>🛠️ DEVELOPMENT OTP MODE ACTIVE</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Real SMS provider unconfigured in dev environment. Use the server-generated OTP below:
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-lg font-black tracking-widest bg-white px-3 py-1 rounded-lg border border-amber-300 tabular-nums">
                    {devOtpInfo.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtp(devOtpInfo.code || '')}
                    className="text-xs font-bold text-emerald-800 hover:underline"
                  >
                    Auto-Fill
                  </button>
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-stone-700">{t.enterOtp}</label>
                <button
                  type="button"
                  onClick={() => setStep('MOBILE')}
                  className="text-xs text-stone-500 hover:text-stone-800"
                >
                  Change Number
                </button>
              </div>
              <input
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit OTP"
                className="w-full text-center text-2xl font-bold tracking-widest py-2.5 px-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>Mobile: +91 {mobile}</span>
              {cooldown > 0 ? (
                <span>Resend in {cooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-emerald-800 font-bold hover:underline"
                >
                  {t.resendOtp}
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-sm font-bold shadow-md transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : t.verifyOtp}
            </button>
          </form>
        )}

        {/* STEP 3: Complete Farmer Registration */}
        {step === 'REGISTER' && (
          <form onSubmit={handleCompleteRegistration} className="space-y-3 text-xs">
            <p className="text-stone-600 mb-1">
              Please enter your farming profile details to access personalized prices and buyer linkages:
            </p>

            <div>
              <label className="font-bold text-stone-700 block mb-1">{t.fullName}</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramasamy Kounder"
                className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {t.preferredLanguage}
                </label>
                <select
                  value={prefLang}
                  onChange={(e) => setPrefLang(e.target.value as LanguageCode)}
                  className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.nativeLabel} ({l.label})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">{t.state}</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-stone-700 block mb-1">{t.district}</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">{t.village}</label>
                <input
                  type="text"
                  required
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">{t.fpoOptional}</label>
              <input
                type="text"
                value={fpoName}
                onChange={(e) => setFpoName(e.target.value)}
                placeholder="e.g. Thenpennai Farmers Producer Co Ltd"
                className="w-full text-sm p-2.5 rounded-xl border border-stone-300 bg-stone-50"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1.5">
                {t.primaryCropsLabel}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['Tomato', 'Onion', 'Potato', 'Wheat', 'Paddy (Dhan)', 'Cotton', 'Turmeric'].map(
                  (c) => {
                    const isSelected = primaryCrops.includes(c);
                    return (
                      <button
                        type="button"
                        key={c}
                        onClick={() => toggleCrop(c)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isSelected
                            ? 'bg-emerald-800 text-white'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-sm font-bold shadow-md transition-colors"
              >
                {isLoading ? 'Saving...' : t.completeRegistration}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
