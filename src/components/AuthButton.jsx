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
      <div className="flex items-center gap-2">
        <span className="text-xs text-notion-text-secondary">
          {user.email || 'Konto'}
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isWorking}
          className="notion-btn notion-btn-secondary text-xs disabled:opacity-60 disabled:cursor-not-allowed"
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
        className="notion-btn notion-btn-secondary text-xs disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Login
      </button>

      {showDialog && (
        <div className="fixed inset-0 bg-notion-bg/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="notion-card max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm uppercase tracking-widest text-notion-text">
                  Anmelden
                </h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="notion-btn notion-btn-secondary text-xs px-2 py-1"
                >
                  X
                </button>
              </div>

              {step === 'email' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-notion-text-secondary mb-2 uppercase tracking-wide">
                      E-Mail
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="notion-input"
                    />
                  </div>

                  {error && (
                    <div className="text-xs text-notion-error">{error}</div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 notion-btn notion-btn-secondary text-xs"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={isWorking}
                      className="flex-1 notion-btn notion-btn-primary text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Code senden
                    </button>
                  </div>
                </div>
              )}

              {step === 'code' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-notion-text-secondary mb-2 uppercase tracking-wide">
                      Code
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="123456"
                      className="notion-input"
                    />
                  </div>

                  {error && (
                    <div className="text-xs text-notion-error">{error}</div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="flex-1 notion-btn notion-btn-secondary text-xs"
                    >
                      Zurück
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={isWorking}
                      className="flex-1 notion-btn notion-btn-primary text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Einloggen
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={isWorking}
                    className="text-xs text-notion-text-secondary hover:text-notion-text transition-colors"
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
