import { useMemo, useState } from 'react';
import { Save, FolderOpen, Trash2, Edit2, X, Clock, Award } from 'lucide-react';
import { db } from '../lib/instantdb';
import { saveCalculation, deleteCalculation, renameCalculation, parseCalculation } from '../utils/persistence';

export default function SaveLoadManager({
  currentCalculation,
  onLoad,
  onSaveComplete,
}) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const { user, isLoading: authLoading } = db.useAuth();
  const canUseStorage = !!user && !authLoading;

  const userId = user?.id ?? null;

  const calculationsQuery = useMemo(() => {
    if (!userId) {
      return { calculations: { $: { where: { userId: '__none__' } } } };
    }

    return {
      calculations: {
        $: {
          where: {
            or: [{ userId }, { userId: null }],
          },
        },
      },
    };
  }, [userId]);

  // Query all saved calculations
  const { isLoading, error, data } = db.useQuery(calculationsQuery);
  const calculations = data?.calculations || [];

  const handleSave = async () => {
    if (!canUseStorage) {
      alert('Bitte melde dich an, um Berechnungen zu speichern.');
      return;
    }
    if (!saveName.trim()) {
      alert('Bitte gib einen Namen für die Berechnung ein.');
      return;
    }

    const result = await saveCalculation({
      ...currentCalculation,
      name: saveName,
      userId: user.id,
      userEmail: user.email || null,
    });

    if (result.success) {
      setSaveName('');
      setShowSaveDialog(false);
      if (onSaveComplete) {
        onSaveComplete(result.id);
      }
    } else {
      alert(`Fehler beim Speichern: ${result.error}`);
    }
  };

  const handleLoad = (savedCalc) => {
    const parsed = parseCalculation(savedCalc);
    if (parsed && onLoad) {
      onLoad(parsed);
      setShowLoadDialog(false);
    } else {
      alert('Fehler beim Laden der Berechnung.');
    }
  };

  const handleDelete = async (calculationId, event) => {
    event.stopPropagation();

    if (!confirm('Möchtest du diese Berechnung wirklich löschen?')) {
      return;
    }

    const result = await deleteCalculation(calculationId);
    if (!result.success) {
      alert(`Fehler beim Löschen: ${result.error}`);
    }
  };

  const handleRename = async (calculationId, event) => {
    event.stopPropagation();
    setEditingId(calculationId);
    const calc = calculations.find(c => c.id === calculationId);
    setEditingName(calc?.name || '');
  };

  const confirmRename = async (calculationId, event) => {
    event.stopPropagation();

    if (!editingName.trim()) {
      alert('Name darf nicht leer sein.');
      return;
    }

    const result = await renameCalculation(calculationId, editingName);
    if (result.success) {
      setEditingId(null);
      setEditingName('');
    } else {
      alert(`Fehler beim Umbenennen: ${result.error}`);
    }
  };

  const cancelRename = (event) => {
    event.stopPropagation();
    setEditingId(null);
    setEditingName('');
  };

  return (
    <div className="flex items-center gap-2">
      {/* Save Button */}
      {currentCalculation && (
        <button
          onClick={() => setShowSaveDialog(true)}
          disabled={!canUseStorage}
          title={!canUseStorage ? 'Bitte anmelden, um zu speichern.' : 'Speichern'}
          className="notion-btn notion-btn-secondary text-xs disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="w-3.5 h-3.5" strokeWidth={1.5} />
          Speichern
        </button>
      )}

      {/* Load Button */}
      <button
        onClick={() => setShowLoadDialog(true)}
        disabled={!canUseStorage}
        title={!canUseStorage ? 'Bitte anmelden, um zu laden.' : 'Laden'}
        className="notion-btn notion-btn-secondary text-xs disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <FolderOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
        {canUseStorage ? `Laden (${calculations.length})` : 'Laden'}
      </button>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-notion-bg/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="notion-card max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm uppercase tracking-widest text-notion-text">Speichern</h3>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="notion-btn notion-btn-secondary text-xs px-2 py-1"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-xs text-notion-text-secondary mb-2 uppercase tracking-wide">
                  Name
                </label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder={`${currentCalculation?.profile?.name || 'Berechnung'} - ${new Date().toLocaleDateString('de-DE')}`}
                  className="notion-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 notion-btn notion-btn-secondary text-xs"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 notion-btn notion-btn-primary text-xs"
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-notion-bg/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="notion-card max-w-3xl w-full min-w-[20rem] max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-notion-border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm uppercase tracking-widest text-notion-text">
                  Gespeicherte Berechnungen ({calculations.length})
                </h3>
                <button
                  onClick={() => setShowLoadDialog(false)}
                  className="notion-btn notion-btn-secondary text-xs px-2 py-1"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">

            {isLoading && (
              <div className="text-center py-12 text-sumi/40 text-xs uppercase tracking-wider">
                Laden...
              </div>
            )}

            {error && (
              <div className="text-center py-12 text-benizakura text-xs">
                Fehler: {error.message}
              </div>
            )}

            {!isLoading && !error && calculations.length === 0 && (
              <div className="text-center py-12 text-sumi/40 text-xs uppercase tracking-wider">
                Keine Berechnungen vorhanden
              </div>
            )}

            {!isLoading && !error && calculations.length > 0 && (
              <div className="space-y-px bg-notion-border">
                {calculations
                  .sort((a, b) => b.updatedAt - a.updatedAt)
                  .map((calc) => (
                    <div
                      key={calc.id}
                      onClick={() => handleLoad(calc)}
                      className="bg-notion-bg p-4 hover:bg-notion-bg-tertiary cursor-pointer transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {editingId === calc.id ? (
                            <div className="flex items-center gap-2 mb-2">
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 px-2 py-1 border border-notion-border rounded focus:ring-2 focus:ring-notion-accent"
                                onKeyPress={(e) => e.key === 'Enter' && confirmRename(calc.id, e)}
                              />
                              <button
                                onClick={(e) => confirmRename(calc.id, e)}
                                className="p-1 text-notion-success hover:bg-notion-success-bg rounded"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelRename}
                                className="p-1 text-notion-text-secondary hover:bg-notion-bg-tertiary rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <h4 className="text-sm font-medium text-notion-text mb-3 tracking-wide">{calc.name}</h4>
                        )}

                          <div className="space-y-1.5 text-xs text-notion-text-secondary">
                            <div className="flex items-center justify-between">
                              <span className="text-notion-text-secondary">{calc.profileName}</span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3" strokeWidth={1.5} />
                                {new Date(calc.updatedAt).toLocaleDateString('de-DE')}
                              </span>
                            </div>
                            <div className="pt-1 border-t border-notion-border">
                              {calc.coreEA1}, {calc.coreEA2}, {calc.coreGA}
                            </div>
                            {calc.finalGrade && (
                              <div className="flex items-center gap-1.5 text-notion-accent pt-1">
                                <Award className="w-3 h-3" strokeWidth={1.5} />
                                <span className="font-medium text-notion-text">{calc.finalGrade.toFixed(1)}</span>
                                <span className="text-notion-text-tertiary">·</span>
                                <span>{calc.totalPoints} Pkt.</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-1 ml-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleRename(calc.id, e)}
                            className="p-2 text-notion-text-tertiary hover:text-notion-text transition-colors"
                            title="Umbenennen"
                          >
                            <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(calc.id, e)}
                            className="p-2 text-notion-text-tertiary hover:text-notion-error transition-colors"
                            title="Löschen"
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
