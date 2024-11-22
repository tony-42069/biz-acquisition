import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  BanknotesIcon,
  ScaleIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import AnalysisResults from './AnalysisResults';

interface FormValues {
  askingPrice: string;
  revenue: string;
  ebitda: string;
  ownerSalary: string;
  recurringRevenue: string;
  topCustomerRevenue: string;
  yearsInBusiness: string;
  downPayment: string;
  sellerNote: string;
  interestRate: string;
  loanTerm: string;
  industry: string;
}

interface CalculationResults {
  // Valuation Metrics
  ebitdaMultiple: number;
  revenueMultiple: number;
  priceToEarnings: number;
  
  // Financial Health
  workingCapitalRatio: number;
  debtServiceCoverageRatio: number;
  returnOnInvestment: number;
  paybackPeriod: number;
  
  // Growth & Risk
  riskScore: number;
  growthPotential: number;
  marketPositionScore: number;
  competitiveThreat: number;
  
  // Cash Flow
  projectedCashFlows: number[];
  netPresentValue: number;
  internalRateOfReturn: number;
  totalDebtService: number;
  bankLoan: number;
  sellerNote: number;

  // Additional Properties
  revenue?: string;
  recurringRevenue?: string;
  topCustomerRevenue?: string;
  yearsInBusiness?: string;
  industry?: string;
}

interface DealAnalysis {
  recommendation: 'Strong Buy' | 'Buy' | 'Neutral' | 'Caution' | 'Pass';
  color: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

const initialValues: FormValues = {
  askingPrice: '2,500,000',  // 2.5M typical for established HVAC
  revenue: '3,000,000',      // 3M revenue
  ebitda: '450,000',         // 15% EBITDA margin
  ownerSalary: '150,000',    // Typical owner salary
  recurringRevenue: '900,000', // 30% service contracts
  topCustomerRevenue: '300,000', // 10% concentration
  yearsInBusiness: '15',
  downPayment: '5',          // 5% down (SBA 7a minimum)
  sellerNote: '5',           // 5% seller note (SBA allowed)
  interestRate: '10.5',      // Prime (7%) + 3.5% spread
  loanTerm: '10',            // 10-year term
  industry: 'services'
};

const validationSchema = Yup.object({
  askingPrice: Yup.string().required('Required'),
  revenue: Yup.string().required('Required'),
  ebitda: Yup.string().required('Required'),
  ownerSalary: Yup.string().required('Required'),
  recurringRevenue: Yup.string().required('Required'),
  topCustomerRevenue: Yup.string().required('Required'),
  yearsInBusiness: Yup.string().required('Required'),
  downPayment: Yup.string().required('Required'),
  sellerNote: Yup.string().required('Required'),
  interestRate: Yup.string().required('Required'),
  loanTerm: Yup.string().required('Required'),
  industry: Yup.string().required('Required'),
});

const formatNumber = (value: string) => {
  const number = value.replace(/[^0-9]/g, '');
  if (number === '') return '';
  return new Intl.NumberFormat('en-US').format(parseInt(number));
};

const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: string) => void) => {
  const { name, value } = e.target;
  const formattedValue = formatNumber(value);
  setFieldValue(name, formattedValue);
};

const calculateMetrics = (values: FormValues): CalculationResults => {
  // Parse values
  const askingPrice = parseInt(values.askingPrice.replace(/[^0-9]/g, ''));
  const revenue = parseInt(values.revenue.replace(/[^0-9]/g, ''));
  const ebitda = parseInt(values.ebitda.replace(/[^0-9]/g, ''));
  const downPaymentPercent = parseInt(values.downPayment) / 100;
  const sellerNotePercent = parseInt(values.sellerNote) / 100;
  const interestRate = parseInt(values.interestRate);
  const loanTerm = parseInt(values.loanTerm);

  // Calculate loan amounts
  const downPayment = askingPrice * downPaymentPercent;
  const sellerNote = askingPrice * sellerNotePercent;
  const bankLoan = askingPrice - downPayment - sellerNote;

  // Calculate debt service
  const bankDebtService = calculateAnnualDebtService(bankLoan, interestRate, loanTerm);
  const sellerDebtService = calculateAnnualDebtService(sellerNote, interestRate, loanTerm);
  const totalDebtService = bankDebtService + sellerDebtService;

  // Valuation Metrics
  const ebitdaMultiple = askingPrice / ebitda;
  const revenueMultiple = askingPrice / revenue;
  const priceToEarnings = askingPrice / (ebitda * 0.7); // Assuming 30% tax rate

  // Financial Health
  const debtServiceCoverageRatio = ebitda / totalDebtService;
  const returnOnInvestment = (ebitda / askingPrice) * 100;
  const paybackPeriod = askingPrice / ebitda;

  // Growth & Risk Assessment
  const riskScore = calculateRiskScore(values);
  const growthPotential = calculateGrowthPotential(values);
  const marketPositionScore = calculateMarketScore(values);
  const competitiveThreat = calculateCompetitiveThreat(values);

  // Cash Flow Analysis
  const projectedCashFlows = calculateProjectedCashFlows(values);
  const netPresentValue = calculateNPV(projectedCashFlows, 0.15); // 15% discount rate
  const internalRateOfReturn = calculateIRR(projectedCashFlows);

  return {
    ebitdaMultiple,
    revenueMultiple,
    priceToEarnings,
    workingCapitalRatio: 0,
    debtServiceCoverageRatio,
    returnOnInvestment,
    paybackPeriod,
    riskScore,
    growthPotential,
    marketPositionScore,
    competitiveThreat,
    projectedCashFlows,
    netPresentValue,
    internalRateOfReturn,
    totalDebtService,
    bankLoan,
    sellerNote,
    revenue: values.revenue,
    recurringRevenue: values.recurringRevenue,
    topCustomerRevenue: values.topCustomerRevenue,
    yearsInBusiness: values.yearsInBusiness,
    industry: values.industry
  };
};

const calculateRiskScore = (values: FormValues): number => {
  let score = 100;
  
  // Customer concentration risk
  if (parseInt(values.revenue.replace(/[^0-9]/g, '')) > 2000000) score -= (parseInt(values.revenue.replace(/[^0-9]/g, '')) - 2000000) * 1.5;
  
  // Employee risk
  if (parseInt(values.ebitda.replace(/[^0-9]/g, '')) / parseInt(values.askingPrice.replace(/[^0-9]/g, '')) > 0.3) score -= 10;
  
  // Market position risk
  switch (values.industry) {
    case 'tech': score += 10; break;
    case 'retail': score += 5; break;
    case 'manufacturing': score -= 10; break;
  }
  
  // Churn risk
  score -= parseInt(values.recurringRevenue.replace(/[^0-9]/g, '')) * 0.5;
  
  // Competition risk
  score -= Math.min(parseInt(values.askingPrice.replace(/[^0-9]/g, '')) * 2, 20);
  
  return Math.max(0, Math.min(100, score));
};

const calculateGrowthPotential = (values: FormValues): number => {
  const historicalWeight = 0.4;
  const industryWeight = 0.3;
  const marketPositionWeight = 0.3;
  
  let marketScore = 0;
  switch (values.industry) {
    case 'tech': marketScore = 10; break;
    case 'retail': marketScore = 7.5; break;
    case 'manufacturing': marketScore = 5; break;
  }
  
  return (parseInt(values.recurringRevenue.replace(/[^0-9]/g, '')) * historicalWeight) +
         (parseInt(values.recurringRevenue.replace(/[^0-9]/g, '')) * industryWeight) +
         (marketScore * marketPositionWeight);
};

const calculateMarketScore = (values: FormValues): number => {
  let score = 0;
  
  // Market position
  switch (values.industry) {
    case 'tech': score += 40; break;
    case 'retail': score += 30; break;
    case 'manufacturing': score += 20; break;
  }
  
  // Industry growth
  score += Math.min(parseInt(values.recurringRevenue.replace(/[^0-9]/g, '')) * 2, 30);
  
  // Competition
  score -= Math.min(parseInt(values.askingPrice.replace(/[^0-9]/g, '')) * 2, 20);
  
  return Math.max(0, Math.min(100, score));
};

const calculateCompetitiveThreat = (values: FormValues): number => {
  let threat = 0;
  
  // Number of competitors
  threat += parseInt(values.askingPrice.replace(/[^0-9]/g, '')) * 5;
  
  // Market position vulnerability
  switch (values.industry) {
    case 'tech': threat += 10; break;
    case 'retail': threat += 20; break;
    case 'manufacturing': threat += 30; break;
  }
  
  // Customer churn indicates competitive pressure
  threat += parseInt(values.recurringRevenue.replace(/[^0-9]/g, '')) * 2;
  
  return Math.min(100, threat);
};

const calculateProjectedCashFlows = (values: FormValues): number[] => {
  const projectedYears = 5;
  const cashFlows: number[] = [];
  
  // Parse values
  const askingPrice = parseInt(values.askingPrice.replace(/[^0-9]/g, ''));
  const downPaymentPercent = parseInt(values.downPayment) / 100;
  const sellerNotePercent = parseInt(values.sellerNote) / 100;
  const interestRate = parseInt(values.interestRate);
  const loanTerm = parseInt(values.loanTerm);
  const ebitda = parseInt(values.ebitda.replace(/[^0-9]/g, ''));
  const ownerSalary = parseInt(values.ownerSalary.replace(/[^0-9]/g, ''));

  // Calculate initial investment
  const downPayment = askingPrice * downPaymentPercent;
  cashFlows.push(-downPayment); // Only down payment is initial cash outflow

  // Calculate loan amounts and payments
  const sellerNote = askingPrice * sellerNotePercent;
  const bankLoan = askingPrice - downPayment - sellerNote;
  const totalDebtService = calculateAnnualDebtService(bankLoan + sellerNote, interestRate, loanTerm);

  // Project future cash flows
  let currentEbitda = ebitda;
  const growthRates = [0.15, 0.12, 0.10, 0.08, 0.06]; // Declining growth rates

  for (let year = 0; year < projectedYears; year++) {
    if (year > 0) { // Skip year 0 as it's our initial investment
      // Grow EBITDA
      currentEbitda *= (1 + growthRates[year - 1]);
      
      // Calculate free cash flow
      const freeCashFlow = currentEbitda - totalDebtService - ownerSalary;
      cashFlows.push(Math.round(freeCashFlow));
    }
  }
  
  return cashFlows;
};

const calculateNPV = (cashFlows: number[], discountRate: number): number => {
  return cashFlows.reduce((npv, cashFlow, year) => {
    return npv + (cashFlow / Math.pow(1 + discountRate, year));
  }, 0);
};

const calculateIRR = (cashFlows: number[]): number => {
  // Simple IRR approximation
  const totalInvestment = Math.abs(cashFlows[0]);
  const averageReturn = cashFlows.slice(1).reduce((sum, cf) => sum + cf, 0) / (cashFlows.length - 1);
  return (averageReturn / totalInvestment) * 100;
};

const calculateAnnualDebtService = (principal: number, rate: number, years: number): number => {
  const monthlyRate = rate / 1200; // Convert annual rate to monthly decimal
  const numberOfPayments = years * 12;
  
  // Standard amortization formula
  const monthlyPayment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
  return monthlyPayment * 12;
};

const analyzeDeal = (metrics: CalculationResults): DealAnalysis => {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const opportunities: string[] = [];
  const threats: string[] = [];
  
  // Analyze EBITDA Multiple
  if (metrics.ebitdaMultiple <= 4) {
    strengths.push("Below market valuation (EBITDA multiple < 4x)");
  } else if (metrics.ebitdaMultiple >= 7) {
    weaknesses.push("Premium valuation (EBITDA multiple > 7x)");
  }

  // Always add some areas of improvement/opportunity
  weaknesses.push("Technology systems could be modernized");
  weaknesses.push("Marketing strategy needs enhancement");
  
  if (metrics.debtServiceCoverageRatio >= 1.5) {
    strengths.push(`Strong debt coverage (${metrics.debtServiceCoverageRatio.toFixed(2)}x DSCR)`);
  } else if (metrics.debtServiceCoverageRatio < 1.25) {
    weaknesses.push(`Tight debt coverage (${metrics.debtServiceCoverageRatio.toFixed(2)}x DSCR)`);
  }

  // Analyze recurring revenue
  const recurringRevenue = parseInt(metrics.recurringRevenue?.toString().replace(/[^0-9]/g, '') || '0');
  const totalRevenue = parseInt(metrics.revenue?.toString().replace(/[^0-9]/g, '') || '1');
  const recurringRevenuePercent = (recurringRevenue / totalRevenue) * 100;
  
  if (recurringRevenuePercent >= 30) {
    strengths.push(`High recurring revenue (${recurringRevenuePercent.toFixed(0)}%)`);
  } else {
    weaknesses.push(`Low recurring revenue (${recurringRevenuePercent.toFixed(0)}%)`);
    opportunities.push("Opportunity to increase service contracts");
  }

  // Customer concentration
  const topCustomerRevenue = parseInt(metrics.topCustomerRevenue?.toString().replace(/[^0-9]/g, '') || '0');
  const customerConcentration = (topCustomerRevenue / totalRevenue) * 100;
  
  if (customerConcentration > 20) {
    threats.push(`High customer concentration (${customerConcentration.toFixed(0)}% from top customer)`);
    weaknesses.push("Customer diversification needed");
  } else {
    strengths.push("Well-diversified customer base");
  }

  // Business maturity
  const yearsInBusiness = parseInt(metrics.yearsInBusiness?.toString() || '0');
  if (yearsInBusiness >= 10) {
    strengths.push(`Established business (${yearsInBusiness} years operating)`);
  } else {
    weaknesses.push(`Limited operating history (${yearsInBusiness} years)`);
    opportunities.push("Room for operational improvements");
  }

  // Industry specific
  if (metrics.industry === 'services') {
    opportunities.push("Growing demand for HVAC services");
    opportunities.push("Energy efficiency upgrade opportunities");
    threats.push("Labor market challenges");
    threats.push("Equipment supply chain risks");
    weaknesses.push("Seasonal revenue fluctuations");
  }

  // Determine recommendation
  let recommendation: 'Strong Buy' | 'Buy' | 'Neutral' | 'Caution' | 'Pass';
  let color: string;

  const score = calculateDealScore(metrics, strengths.length, weaknesses.length);
  
  if (score >= 85) {
    recommendation = 'Strong Buy';
    color = 'text-green-500';
  } else if (score >= 70) {
    recommendation = 'Buy';
    color = 'text-green-400';
  } else if (score >= 50) {
    recommendation = 'Neutral';
    color = 'text-yellow-500';
  } else if (score >= 30) {
    recommendation = 'Caution';
    color = 'text-orange-500';
  } else {
    recommendation = 'Pass';
    color = 'text-red-500';
  }

  return {
    recommendation,
    color,
    strengths,
    weaknesses,
    opportunities,
    threats
  };
};

const calculateDealScore = (metrics: CalculationResults, strengthCount: number, weaknessCount: number): number => {
  let score = 70; // Start at neutral

  // Adjust for DSCR
  if (metrics.debtServiceCoverageRatio >= 2) score += 10;
  else if (metrics.debtServiceCoverageRatio >= 1.5) score += 5;
  else if (metrics.debtServiceCoverageRatio < 1.25) score -= 10;

  // Adjust for valuation
  if (metrics.ebitdaMultiple <= 4) score += 10;
  else if (metrics.ebitdaMultiple >= 7) score -= 10;

  // Adjust for strengths and weaknesses
  score += (strengthCount * 3);
  score -= (weaknessCount * 3);

  // Cap the score
  return Math.min(100, Math.max(0, score));
};

export default function BusinessCalculator() {
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [analysis, setAnalysis] = useState<DealAnalysis | null>(null);

  return (
    <div className="container py-8">
      <div className="glass-card">
        <h1 className="title">
          Will My Buy Fly? <span className="title-emoji">✈️</span>
        </h1>
        
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            const metrics = calculateMetrics(values);
            setResults(metrics);
            setAnalysis(analyzeDeal(metrics));
          }}
        >
          {({ setFieldValue }) => (
            <Form>
              <div className="input-section">
                <div className="input-group">
                  <label htmlFor="askingPrice" className="input-label">
                    Asking Price ($)
                  </label>
                  <Field
                    type="text"
                    id="askingPrice"
                    name="askingPrice"
                    className="input-field"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNumberChange(e, setFieldValue)}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="revenue" className="input-label">
                    Annual Revenue ($)
                  </label>
                  <Field
                    type="text"
                    id="revenue"
                    name="revenue"
                    className="input-field"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNumberChange(e, setFieldValue)}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="ebitda" className="input-label">
                    EBITDA ($)
                  </label>
                  <Field
                    type="text"
                    id="ebitda"
                    name="ebitda"
                    className="input-field"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNumberChange(e, setFieldValue)}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="ownerSalary" className="input-label">
                    Owner's Salary ($)
                  </label>
                  <Field
                    type="text"
                    id="ownerSalary"
                    name="ownerSalary"
                    className="input-field"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNumberChange(e, setFieldValue)}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="recurringRevenue" className="input-label">
                    Recurring Revenue ($)
                  </label>
                  <Field
                    type="text"
                    id="recurringRevenue"
                    name="recurringRevenue"
                    className="input-field"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNumberChange(e, setFieldValue)}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="topCustomerRevenue" className="input-label">
                    Top Customer Revenue ($)
                  </label>
                  <Field
                    type="text"
                    id="topCustomerRevenue"
                    name="topCustomerRevenue"
                    className="input-field"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNumberChange(e, setFieldValue)}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="yearsInBusiness" className="input-label">
                    Years in Business
                  </label>
                  <Field
                    type="text"
                    id="yearsInBusiness"
                    name="yearsInBusiness"
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="downPayment" className="input-label">
                    Down Payment (%)
                  </label>
                  <Field
                    type="text"
                    id="downPayment"
                    name="downPayment"
                    className="input-field"
                    placeholder="e.g. 20"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="sellerNote" className="input-label">
                    Seller Note (%)
                  </label>
                  <Field
                    type="text"
                    id="sellerNote"
                    name="sellerNote"
                    className="input-field"
                    placeholder="e.g. 80"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="interestRate" className="input-label">
                    Interest Rate (%)
                  </label>
                  <Field
                    type="text"
                    id="interestRate"
                    name="interestRate"
                    className="input-field"
                    placeholder="e.g. 7"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="loanTerm" className="input-label">
                    Loan Term (Years)
                  </label>
                  <Field
                    type="text"
                    id="loanTerm"
                    name="loanTerm"
                    className="input-field"
                    placeholder="e.g. 10"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="industry" className="input-label">
                    Industry
                  </label>
                  <Field
                    as="select"
                    id="industry"
                    name="industry"
                    className="input-field"
                  >
                    <option value="">Select Industry</option>
                    <option value="tech">Technology</option>
                    <option value="services">Services (HVAC, Plumbing, etc.)</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="construction">Construction</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="food">Food & Beverage</option>
                    <option value="other">Other</option>
                  </Field>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-400 to-emerald-400 text-white px-6 py-2 rounded-lg 
                           hover:from-blue-500 hover:to-emerald-500 transition-all duration-200 font-medium"
                >
                  Analyze Deal
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      {/* Analysis Results */}
      {results && analysis && (
        <AnalysisResults results={results} analysis={analysis} />
      )}
    </div>
  );
}
