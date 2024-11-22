import React from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface CalculationResults {
  ebitdaMultiple: number;
  revenueMultiple: number;
  priceToEarnings: number;
  workingCapitalRatio: number;
  debtServiceCoverageRatio: number;
  returnOnInvestment: number;
  paybackPeriod: number;
  riskScore: number;
  growthPotential: number;
  marketPositionScore: number;
  competitiveThreat: number;
  projectedCashFlows: number[];
  netPresentValue: number;
  internalRateOfReturn: number;
}

interface DealAnalysis {
  recommendation: 'Strong Buy' | 'Buy' | 'Neutral' | 'Caution' | 'Pass';
  color: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface Props {
  results: CalculationResults;
  analysis: DealAnalysis;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

const formatRatio = (value: number): string => {
  return value.toFixed(2) + 'x';
};

const MetricCard = ({ title, value, icon: Icon }: { title: string; value: string; icon: any }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="metric-card"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="metric-label">{title}</p>
        <p className="metric-value">{value}</p>
      </div>
      <Icon className="h-6 w-6 text-indigo-400" />
    </div>
  </motion.div>
);

const AnalysisResults: React.FC<Props> = ({ results, analysis }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Recommendation */}
      <div className="glass-card">
        <h2 className="text-xl font-bold text-white mb-4">Deal Recommendation</h2>
        <div className={`text-2xl font-bold ${analysis.color} mb-4`}>
          {analysis.recommendation}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-2">Strengths</h3>
            <ul className="list-disc list-inside text-gray-300">
              {analysis.strengths.map((strength, i) => (
                <li key={i}>{strength}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-400 mb-2">Weaknesses</h3>
            <ul className="list-disc list-inside text-gray-300">
              {analysis.weaknesses.map((weakness, i) => (
                <li key={i}>{weakness}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-section">
        <h2 className="text-xl font-bold text-white mb-4">Key Metrics</h2>
        <div className="metrics-grid">
          <MetricCard
            title="EBITDA Multiple"
            value={formatRatio(results.ebitdaMultiple)}
            icon={ChartBarIcon}
          />
          <MetricCard
            title="Return on Investment"
            value={formatPercent(results.returnOnInvestment)}
            icon={CurrencyDollarIcon}
          />
          <MetricCard
            title="Risk Score"
            value={formatPercent(results.riskScore)}
            icon={ScaleIcon}
          />
          <MetricCard
            title="Growth Potential"
            value={formatPercent(results.growthPotential)}
            icon={ArrowTrendingUpIcon}
          />
        </div>
      </div>

      {/* Financial Health */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Financial Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-300">Working Capital Ratio</p>
            <p className="text-lg font-semibold text-white">
              {formatRatio(results.workingCapitalRatio)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-300">Debt Service Coverage</p>
            <p className="text-lg font-semibold text-white">
              {formatRatio(results.debtServiceCoverageRatio)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-300">Payback Period</p>
            <p className="text-lg font-semibold text-white">
              {results.paybackPeriod.toFixed(1)} years
            </p>
          </div>
        </div>
      </div>

      {/* Cash Flow Analysis */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Cash Flow Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-300">Net Present Value</p>
            <p className="text-lg font-semibold text-white">
              {formatCurrency(results.netPresentValue)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-300">Internal Rate of Return</p>
            <p className="text-lg font-semibold text-white">
              {formatPercent(results.internalRateOfReturn)}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-300 mb-2">Projected Cash Flows</p>
          <div className="grid grid-cols-6 gap-2">
            {results.projectedCashFlows.map((cf, i) => (
              <div key={i} className="text-center">
                <p className="text-xs text-gray-400">Year {i}</p>
                <p className="text-sm font-semibold text-white">
                  {formatCurrency(cf)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisResults;
