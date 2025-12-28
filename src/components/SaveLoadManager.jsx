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
    <div className="flex gap-2">
      {/* Save Button */}
      {currentCalculation && (
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
        >
          <Save className="w-4 h-4" />
          Speichern
        </button>
      )}

      {/* Load Button */}
      <button
        onClick={() => setShowLoadDialog(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
      >
        <FolderOpen className="w-4 h-4" />
        Laden ({calculations.length})
      </button>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Berechnung speichern</h3>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Name der Berechnung
              </label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder={`${currentCalculation?.profile?.name || 'Berechnung'} - ${new Date().toLocaleDateString('de-DE')}`}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">
                Gespeicherte Berechnungen ({calculations.length})
              </h3>
              <button
                onClick={() => setShowLoadDialog(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {isLoading && (
              <div className="text-center py-8 text-slate-600">
                Lade gespeicherte Berechnungen...
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-red-600">
                Fehler beim Laden: {error.message}
              </div>
            )}

            {!isLoading && !error && calculations.length === 0 && (
              <div className="text-center py-8 text-slate-600">
                Keine gespeicherten Berechnungen vorhanden.
              </div>
            )}

            {!isLoading && !error && calculations.length > 0 && (
              <div className="space-y-3">
                {calculations
                  .sort((a, b) => b.updatedAt - a.updatedAt)
                  .map((calc) => (
                    <div
                      key={calc.id}
                      onClick={() => handleLoad(calc)}
                      className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors"
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
                            <h4 className="font-semibold text-slate-900 mb-2">{calc.name}</h4>
                          )}

                          <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                            <div>Profil: {calc.profileName}</div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(calc.updatedAt).toLocaleDateString('de-DE')}
                            </div>
                            <div>
                              Kernfächer: {calc.coreEA1}, {calc.coreEA2}, {calc.coreGA}
                            </div>
                            {calc.finalGrade && (
                              <div className="flex items-center gap-1 font-semibold text-blue-600">
                                <Award className="w-3 h-3" />
                                Note: {calc.finalGrade.toFixed(1)} ({calc.totalPoints} Pkt.)
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-1 ml-4">
                          <button
                            onClick={(e) => handleRename(calc.id, e)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Umbenennen"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(calc.id, e)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
