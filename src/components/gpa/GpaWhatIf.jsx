import { useState, useEffect, useCallback } from 'react';
import { Button, Input } from '../../components/common';
import gpaApi from '../../api/gpaApi';
import { useTranslation } from 'react-i18next';

const GRADE_OPTIONS = ['A','A-','B+','B','B-','C+','C','C-','D+','D','F'];

export default function GpaWhatIf({ currentGpaFromProfile }){
  const { t } = useTranslation();
  const [rows, setRows] = useState([{ id: Date.now(), creditHours: 3, grade: 'A' }]);
  const [simulatedGpa, setSimulatedGpa] = useState(null);
  const [loading, setLoading] = useState(false);

  const callSimulate = useCallback(async (payload) => {
    setLoading(true);
    try {
      const res = await gpaApi.simulate(payload);
      setSimulatedGpa(res.data);
    } catch (err) {
      console.error(err);
      setSimulatedGpa(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // debounce effect: call API when rows change
  useEffect(() => {
    const dtoCourses = rows
      .filter(r => r.grade && r.creditHours > 0)
      .map(r => ({ creditHours: Number(r.creditHours), grade: r.grade }));

    const t = setTimeout(() => callSimulate(dtoCourses), 300);
    return () => clearTimeout(t);
  }, [rows, callSimulate]);

  const updateRow = (id, patch) => {
    setRows(rs => rs.map(r => r.id === id ? { ...r, ...patch } : r));
  };

  const addRow = () => setRows(rs => [...rs, { id: Date.now(), creditHours: 3, grade: 'A' }]);
  const removeRow = (id) => setRows(rs => rs.filter(r => r.id !== id));

  const difference = simulatedGpa ? (simulatedGpa.simulatedGPA - (simulatedGpa.currentGPA ?? currentGpaFromProfile)) : 0;

  return (
    <div className="mt-4 p-4 border rounded bg-white dark:bg-gray-800">
      <h4 className="font-semibold mb-3">{t('gpa.whatIfTitle')}</h4>

      <div className="space-y-3">
        {rows.map(r => (
          <div key={r.id} className="flex gap-2 items-end">
            <div className="w-28">
              <label className="text-xs text-gray-500">{t('gpa.credits')}</label>
              <Input type="number" min={1} value={r.creditHours} onChange={e => updateRow(r.id, { creditHours: e.target.value })} />
            </div>

            <div className="w-36">
              <label className="text-xs text-gray-500">{t('gpa.grade')}</label>
              <select className="w-full px-3 py-2 border rounded" value={r.grade} onChange={e => updateRow(r.id, { grade: e.target.value })}>
                {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <Button variant="outline" size="sm" onClick={() => removeRow(r.id)}>{t('common.remove')}</Button>
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <Button onClick={addRow} size="sm">{t('gpa.addCourse')}</Button>
          <Button variant="ghost" size="sm" onClick={() => setRows([{ id: Date.now(), creditHours: 3, grade: 'A' }])}>{t('common.reset')}</Button>
        </div>

        <div className="mt-3 border-t pt-3 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">{t('gpa.currentGpa')}</div>
            <div className="text-xl font-bold">{(simulatedGpa?.currentGPA ?? currentGpaFromProfile ?? 0).toFixed(2)}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">{t('gpa.simulatedGpa')}</div>
            <div className="text-xl font-bold">{loading ? t('common.loading') : (simulatedGpa?.simulatedGPA ?? t('common.notAvailable'))}</div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500">{t('gpa.difference')}</div>
            <div className={`text-xl font-bold ${difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : 'text-gray-700'}`}>
              {loading
                ? t('common.loading')
                : (simulatedGpa
                    ? (difference > 0 ? `+${difference.toFixed(2)}` : difference.toFixed(2))
                    : t('common.notAvailable'))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
