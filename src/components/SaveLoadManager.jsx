import { useState } from 'react';
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

  // Query all saved calculations
  const { isLoading, error, data } = db.useQuery({ calculations: {} });
  const calculations = data?.calculations || [];

  const handleSave = async () => {
    if (!saveName.trim()) {
      alert('Bitte gib einen Namen für die Berechnung ein.');
      return;
    }

    const result = await saveCalculation({
      ...currentCalculation,
      name: saveName,
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

  const handleUpdate = async (calculationId) => {
    const result = await saveCalculation({
      ...currentCalculation,
      calculationId,
    });

    if (result.success) {
      if (onSaveComplete) {
        onSaveComplete(result.id);
      }
    } else {
      alert(`Fehler beim Aktualisieren: ${result.error}`);
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
    <div className="flex gap-px bg-tatami">
      {/* Save Button */}
      {currentCalculation && (
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-washi text-sumi hover:bg-white transition-colors text-xs uppercase tracking-wider font-light"
        >
          <Save className="w-3.5 h-3.5" strokeWidth={1.5} />
          Speichern
        </button>
      )}

      {/* Load Button */}
      <button
        onClick={() => setShowLoadDialog(true)}
        className="flex items-center gap-2 px-4 py-2 bg-washi text-sumi hover:bg-white transition-colors text-xs uppercase tracking-wider font-light"
      >
        <FolderOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
        Laden ({calculations.length})
      </button>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-sumi/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-washi border border-tatami max-w-md w-full">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm uppercase tracking-widest text-sumi font-light">Speichern</h3>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="text-sumi/40 hover:text-sumi transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              <div className="mb-8">
                <label className="block text-xs text-sumi/60 mb-3 uppercase tracking-wide font-light">
                  Name
                </label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder={`${currentCalculation?.profile?.name || 'Berechnung'} - ${new Date().toLocaleDateString('de-DE')}`}
                  className="w-full px-0 py-2 border-0 border-b border-tatami bg-transparent focus:outline-none focus:border-indigo-dye transition-colors text-sumi"
                  onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>

              <div className="flex gap-px bg-tatami">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 px-4 py-3 bg-washi text-sumi hover:bg-white transition-colors text-xs uppercase tracking-wider font-light"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-3 bg-indigo-dye text-white hover:bg-indigo-dye/90 transition-colors text-xs uppercase tracking-wider font-light"
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
        <div className="fixed inset-0 bg-sumi/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-washi border border-tatami max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-8 border-b border-tatami">
              <div className="flex items-center justify-between">
                <h3 className="text-sm uppercase tracking-widest text-sumi font-light">
                  Gespeicherte Berechnungen ({calculations.length})
                </h3>
                <button
                  onClick={() => setShowLoadDialog(false)}
                  className="text-sumi/40 hover:text-sumi transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(80vh-120px)]">

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
              <div className="space-y-px bg-tatami">
                {calculations
                  .sort((a, b) => b.updatedAt - a.updatedAt)
                  .map((calc) => (
                    <div
                      key={calc.id}
                      onClick={() => handleLoad(calc)}
                      className="bg-washi p-6 hover:bg-white cursor-pointer transition-colors group"
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
                                className="flex-1 px-2 py-1 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                                onKeyPress={(e) => e.key === 'Enter' && confirmRename(calc.id, e)}
                              />
                              <button
                                onClick={(e) => confirmRename(calc.id, e)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelRename}
                                className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <h4 className="text-sm font-medium text-sumi mb-4 tracking-wide">{calc.name}</h4>
                          )}

                          <div className="space-y-2 text-xs text-sumi/50 font-light">
                            <div className="flex items-center justify-between">
                              <span>{calc.profileName}</span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3" strokeWidth={1.5} />
                                {new Date(calc.updatedAt).toLocaleDateString('de-DE')}
                              </span>
                            </div>
                            <div className="pt-1 border-t border-tatami">
                              {calc.coreEA1}, {calc.coreEA2}, {calc.coreGA}
                            </div>
                            {calc.finalGrade && (
                              <div className="flex items-center gap-1.5 text-indigo-dye pt-1">
                                <Award className="w-3 h-3" strokeWidth={1.5} />
                                <span className="font-medium">{calc.finalGrade.toFixed(1)}</span>
                                <span className="text-sumi/30">·</span>
                                <span>{calc.totalPoints} Pkt.</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-1 ml-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleRename(calc.id, e)}
                            className="p-2 text-sumi/40 hover:text-sumi transition-colors"
                            title="Umbenennen"
                          >
                            <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(calc.id, e)}
                            className="p-2 text-sumi/40 hover:text-benizakura transition-colors"
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
