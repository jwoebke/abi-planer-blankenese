import { useEffect, useState } from 'react';
import { db } from '../lib/instantdb';

export default function AuthButton() {
  const { user, isLoading } = db.useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && showDialog) {
      setShowDialog(false);
    }
  }, [user, showDialog]);

  const resetDialog = () => {
    setStep('email');
    setEmail('');
    setCode('');
    setError('');
    setIsWorking(false);
  };

  const handleOpen = () => {
    setError('');
    setShowDialog(true);
  };

  const handleClose = () => {
    setShowDialog(false);
    resetDialog();
  };

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError('Bitte gib deine E-Mail-Adresse ein.');
      return;
    }

    setIsWorking(true);
    setError('');

    try {
      await db.auth.sendMagicCode({ email: email.trim() });
      setStep('code');
    } catch (err) {
      setError(err?.body?.message || err?.message || 'Fehler beim Senden des Codes.');
    } finally {
      setIsWorking(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!email.trim() || !code.trim()) {
      setError('Bitte gib die E-Mail-Adresse und den Code ein.');
      return;
    }

    setIsWorking(true);
    setError('');

    try {
      await db.auth.signInWithMagicCode({ email: email.trim(), code: code.trim() });
      handleClose();
    } catch (err) {
      setError(err?.body?.message || err?.message || 'Fehler beim Anmelden.');
    } finally {
      setIsWorking(false);
    }
  };

  const handleSignOut = async () => {
    setIsWorking(true);
    try {
      await db.auth.signOut();
    } finally {
      setIsWorking(false);
    }
  };

  if (user) {
    return (
      <div className="flex gap-px bg-tatami">
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-washi text-sumi text-xs uppercase tracking-wider font-light"
        >
          {user.email || 'Konto'}
        </button>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isWorking}
          className="flex items-center gap-2 px-4 py-2 bg-washi text-sumi hover:bg-white transition-colors text-xs uppercase tracking-wider font-light disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Abmelden
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-washi text-sumi hover:bg-white transition-colors text-xs uppercase tracking-wider font-light disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Login
      </button>

      {showDialog && (
        <div className="fixed inset-0 bg-sumi/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-washi border border-tatami max-w-md w-full">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm uppercase tracking-widest text-sumi font-light">Anmelden</h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-sumi/40 hover:text-sumi transition-colors"
                >
                  X
                </button>
              </div>

              {step === 'email' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-sumi/60 mb-2 uppercase tracking-wide font-light">
                      E-Mail
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-0 py-2 border-0 border-b border-tatami bg-transparent focus:outline-none focus:border-indigo-dye transition-colors text-sumi"
                    />
                  </div>

                  {error && (
                    <div className="text-xs text-benizakura">{error}</div>
                  )}

                  <div className="flex gap-px bg-tatami">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 px-4 py-3 bg-washi text-sumi hover:bg-white transition-colors text-xs uppercase tracking-wider font-light"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={isWorking}
                      className="flex-1 px-4 py-3 bg-indigo-dye text-white hover:bg-indigo-dye/90 transition-colors text-xs uppercase tracking-wider font-light disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Code senden
                    </button>
                  </div>
                </div>
              )}

              {step === 'code' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-sumi/60 mb-2 uppercase tracking-wide font-light">
                      Code
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="123456"
                      className="w-full px-0 py-2 border-0 border-b border-tatami bg-transparent focus:outline-none focus:border-indigo-dye transition-colors text-sumi"
                    />
                  </div>

                  {error && (
                    <div className="text-xs text-benizakura">{error}</div>
                  )}

                  <div className="flex gap-px bg-tatami">
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="flex-1 px-4 py-3 bg-washi text-sumi hover:bg-white transition-colors text-xs uppercase tracking-wider font-light"
                    >
                      Zurück
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={isWorking}
                      className="flex-1 px-4 py-3 bg-indigo-dye text-white hover:bg-indigo-dye/90 transition-colors text-xs uppercase tracking-wider font-light disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Einloggen
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={isWorking}
                    className="text-xs text-sumi/60 hover:text-sumi transition-colors"
                  >
                    Code erneut senden
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
