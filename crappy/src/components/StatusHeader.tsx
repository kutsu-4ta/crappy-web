import type { DashboardStats } from '../types/workData';
import { Gauge, Target, AlertTriangle } from 'lucide-react';

interface StatusHeaderProps {
    stats: DashboardStats;
}

export const StatusHeader = ({ stats }: StatusHeaderProps) => {
    const { estimatedTotal, requiredDailyHours, upperLimitWarning, remainingBusinessDays } = stats;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            padding: '0 15px',
            gap: '15px',
            color: 'black',
            whiteSpace: 'nowrap'
        }}>
            {/* ① 月末予測 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Gauge size={14} color="#22d3ee" />
                <span style={{ fontSize: '10px', fontWeight: '900' }}>EST.</span>
                <span style={{ fontSize: '14px', fontWeight: '900', fontFamily: 'monospace' }}>{estimatedTotal}h</span>
            </div>

            {/* ② ノルマ群 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid #334155', paddingLeft: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Target size={12} color="#22c55e" />
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{requiredDailyHours}h</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={12} color="#f43f5e" />
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{upperLimitWarning}h</span>
                </div>
            </div>

            {/* ③ 残り日数 */}
            <div style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: '900' }}>
                {remainingBusinessDays} DAYS
            </div>
        </div>
    );
};
