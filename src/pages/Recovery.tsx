import { useState, useMemo } from 'react';
import {
  Moon,
  Battery,
  Activity,
  Brain,
  Save,
  Calendar,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatDateDisplay, getToday, addDays } from '@/utils/date';
import type { RecoveryRecord } from '@/types';

function calculateRecoveryScore(record: RecoveryRecord): number {
  const sleepScore = Math.min((record.sleepHours / 9) * 30, 30);
  const fatigueScore = (5 - record.fatigueLevel) * 20;
  const sorenessScore = (5 - record.sorenessLevel) * 25;
  const stressScore = (5 - record.stressLevel) * 25;
  return Math.round(sleepScore + fatigueScore + sorenessScore + stressScore);
}

function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: '恢复极佳', color: 'text-green-400' };
  if (score >= 60) return { label: '恢复良好', color: 'text-accent' };
  if (score >= 40) return { label: '恢复一般', color: 'text-gold' };
  if (score >= 20) return { label: '恢复较差', color: 'text-yellow-500' };
  return { label: '急需休息', color: 'text-red-400' };
}

interface RatingSliderProps {
  value: number;
  onChange: (v: number) => void;
  label: string;
  icon: React.ElementType;
  color: string;
}

function RatingSlider({
  value,
  onChange,
  label,
  icon: Icon,
  color,
}: RatingSliderProps) {
  const labels = ['无', '轻微', '轻度', '中度', '较重', '严重'];
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <label className="label mb-0">{label}</label>
        </div>
        <span className={`text-sm font-medium ${color}`}>
          {value > 0 ? `${value} - ${labels[value]}` : '未记录'}
        </span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(value === num ? 0 : num)}
            className={`flex-1 h-10 rounded-lg transition-all duration-200 text-sm font-medium ${
              value >= num
                ? color === 'text-accent'
                  ? 'bg-accent text-white'
                  : color === 'text-gold'
                  ? 'bg-gold text-bg'
                  : 'bg-red-500 text-white'
                : 'bg-bg-tertiary text-text-muted hover:bg-bg-tertiary/80'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Recovery() {
  const today = getToday();
  const addRecoveryRecord = useStore((s) => s.addRecoveryRecord);
  const getRecoveryRecordByDate = useStore((s) => s.getRecoveryRecordByDate);
  const recoveryRecords = useStore((s) => s.recoveryRecords);

  const existingRecord = getRecoveryRecordByDate(today);

  const [selectedDate, setSelectedDate] = useState(today);
  const [formData, setFormData] = useState({
    sleepHours: existingRecord?.sleepHours ?? 7,
    fatigueLevel: existingRecord?.fatigueLevel ?? 0,
    sorenessLevel: existingRecord?.sorenessLevel ?? 0,
    stressLevel: existingRecord?.stressLevel ?? 0,
    notes: existingRecord?.notes ?? '',
  });

  const currentScore = useMemo(() => {
    return calculateRecoveryScore({
      ...formData,
      id: '',
      date: selectedDate,
      createdAt: '',
    });
  }, [formData, selectedDate]);

  const scoreInfo = getScoreLabel(currentScore);

  const recentRecords = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => addDays(today, -6 + i));
    return last7Days.map((date) => {
      const record = getRecoveryRecordByDate(date);
      const score = record ? calculateRecoveryScore(record) : 0;
      return { date, score, record };
    });
  }, [today, getRecoveryRecordByDate]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const record = getRecoveryRecordByDate(date);
    if (record) {
      setFormData({
        sleepHours: record.sleepHours,
        fatigueLevel: record.fatigueLevel,
        sorenessLevel: record.sorenessLevel,
        stressLevel: record.stressLevel,
        notes: record.notes,
      });
    } else {
      setFormData({
        sleepHours: 7,
        fatigueLevel: 0,
        sorenessLevel: 0,
        stressLevel: 0,
        notes: '',
      });
    }
  };

  const handleSleepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, sleepHours: Number(e.target.value) }));
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, notes: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRecoveryRecord({
      date: selectedDate,
      ...formData,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 text-text-muted mb-1">
          <Moon className="w-4 h-4" />
          <span className="text-sm">恢复管理</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-display tracking-wide text-text">
          恢复状态
        </h1>
        <p className="text-text-muted mt-1">
          记录睡眠、疲劳和压力，科学管理训练负荷
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {recentRecords.map(({ date, score, record }) => {
          const isSelected = date === selectedDate;
          const isToday = date === today;
          return (
            <button
              key={date}
              type="button"
              onClick={() => handleDateChange(date)}
              className={`card p-4 text-left transition-all duration-200 ${
                isSelected ? 'border-accent/50 shadow-glow' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-muted">
                  {formatDateDisplay(date)}
                  {isToday && (
                    <span className="ml-2 badge bg-accent/10 text-accent">今天</span>
                  )}
                </span>
                {score > 0 ? (
                  score >= 60 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )
                ) : null}
              </div>
              {score > 0 ? (
                <>
                  <div className="text-3xl font-display gradient-text">{score}</div>
                  <p className="text-sm text-text-muted mt-1">
                    {getScoreLabel(score).label}
                  </p>
                  {record?.sleepHours > 0 && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
                      <Moon className="w-3 h-3" />
                      <span>{record.sleepHours}h 睡眠</span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-text-dim text-sm">暂无记录</p>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text">
                {selectedDate === today
                  ? '今日恢复记录'
                  : `${formatDateDisplay(selectedDate)} 恢复记录`}
              </h2>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="input-field max-w-xs"
              />
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-accent/10 to-gold/5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-gold/20 flex items-center justify-center">
                <span className="text-2xl font-display gradient-text">{currentScore}</span>
              </div>
              <div>
                <p className={`text-lg font-semibold ${scoreInfo.color}`}>
                  {scoreInfo.label}
                </p>
                <p className="text-sm text-text-muted">
                  {currentScore >= 60
                    ? '身体状态良好，可以正常训练'
                    : currentScore >= 40
                    ? '身体状态一般，注意调整训练强度'
                    : '身体状态较差，建议降低训练强度或安排休息'}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-accent" />
                  <label className="label mb-0">睡眠时长</label>
                </div>
                <span className="text-sm font-medium text-accent">
                  {formData.sleepHours} 小时
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={formData.sleepHours}
                  onChange={handleSleepChange}
                  className="flex-1 h-2 bg-bg-tertiary rounded-full appearance-none cursor-pointer accent-accent"
                />
              </div>
              <div className="flex justify-between text-xs text-text-muted mt-1">
                <span>0h</span>
                <span>6h</span>
                <span>12h</span>
              </div>
            </div>

            <RatingSlider
              value={formData.fatigueLevel}
              onChange={(v) => setFormData((prev) => ({ ...prev, fatigueLevel: v }))}
              label="疲劳程度"
              icon={Battery}
              color="text-accent"
            />

            <RatingSlider
              value={formData.sorenessLevel}
              onChange={(v) => setFormData((prev) => ({ ...prev, sorenessLevel: v }))}
              label="酸痛程度"
              icon={Activity}
              color="text-gold"
            />

            <RatingSlider
              value={formData.stressLevel}
              onChange={(v) => setFormData((prev) => ({ ...prev, stressLevel: v }))}
              label="压力水平"
              icon={Brain}
              color="text-red-400"
            />

            <div>
              <label className="label">恢复备注</label>
              <textarea
                value={formData.notes}
                onChange={handleNotesChange}
                placeholder="记录睡眠质量、饮食情况、情绪状态等..."
                rows={2}
                className="input-field resize-none"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full inline-flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存恢复记录
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="card p-6">
            <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-text-muted" />
              恢复小贴士
            </h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-bg-tertiary/50">
                <p className="font-medium text-text">睡眠 7-9 小时</p>
                <p className="text-text-muted mt-1">
                  肌肉修复和生长主要在睡眠中进行
                </p>
              </div>
              <div className="p-3 rounded-lg bg-bg-tertiary/50">
                <p className="font-medium text-text">蛋白质摄入</p>
                <p className="text-text-muted mt-1">训练后30分钟内补充蛋白质</p>
              </div>
              <div className="p-3 rounded-lg bg-bg-tertiary/50">
                <p className="font-medium text-text">主动恢复</p>
                <p className="text-text-muted mt-1">
                  休息日可进行轻量活动促进血液循环
                </p>
              </div>
              <div className="p-3 rounded-lg bg-bg-tertiary/50">
                <p className="font-medium text-text">倾听身体</p>
                <p className="text-text-muted mt-1">疼痛是信号，不是挑战</p>
              </div>
            </div>
          </div>

          {recoveryRecords.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold text-text mb-4">历史记录</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {[...recoveryRecords]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .slice(0, 10)
                  .map((record) => {
                    const score = calculateRecoveryScore(record);
                    const info = getScoreLabel(score);
                    return (
                      <div
                        key={record.id}
                        onClick={() => handleDateChange(record.date)}
                        className="flex items-center justify-between p-3 rounded-lg bg-bg-tertiary/50 hover:bg-bg-tertiary cursor-pointer transition-all"
                      >
                        <div>
                          <p className="text-sm font-medium text-text">
                            {formatDateDisplay(record.date)}
                          </p>
                          <p className="text-xs text-text-muted">
                            {record.sleepHours}h 睡眠
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${info.color}`}>
                            {score}
                          </p>
                          <p className="text-xs text-text-muted">{info.label}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
