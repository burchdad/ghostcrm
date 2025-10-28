import { NextRequest } from "next/server";
import { ok, bad, oops } from "@/lib/http";
import { z } from "zod";


export const dynamic = 'force-dynamic';
// Use Node.js runtime to avoid Edge Runtime issues
export const runtime = 'nodejs';

const FinancingCalculatorRequest = z.object({
  vehicle_price: z.number().min(0),
  down_payment: z.number().min(0).optional(),
  trade_in_value: z.number().min(0).optional(),
  
  // Loan calculations
  loan_apr: z.number().min(0).max(50).optional(),
  loan_term_months: z.number().min(12).max(84).optional(),
  
  // Lease calculations  
  lease_term_months: z.number().min(12).max(60).optional(),
  lease_residual_percent: z.number().min(20).max(80).optional(),
  lease_money_factor: z.number().min(0).max(1).optional(),
  lease_miles_per_year: z.number().min(5000).max(25000).optional(),
  
  // Taxes and fees
  sales_tax_rate: z.number().min(0).max(15).optional(),
  title_fee: z.number().min(0).optional(),
  registration_fee: z.number().min(0).optional(),
  documentation_fee: z.number().min(0).optional(),
  dealer_prep_fee: z.number().min(0).optional(),
  
  // Additional products
  extended_warranty: z.number().min(0).optional(),
  gap_insurance: z.number().min(0).optional(),
  service_contract: z.number().min(0).optional(),
  
  calculation_type: z.enum(["loan", "lease", "both"]).optional()
});

// Calculate loan payment using standard loan formula
function calculateLoanPayment(principal: number, apr: number, termMonths: number): {
  monthly_payment: number;
  total_payments: number;
  total_interest: number;
} {
  if (apr === 0) {
    const monthlyPayment = principal / termMonths;
    return {
      monthly_payment: monthlyPayment,
      total_payments: principal,
      total_interest: 0
    };
  }
  
  const monthlyRate = apr / 100 / 12;
  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                        (Math.pow(1 + monthlyRate, termMonths) - 1);
  const totalPayments = monthlyPayment * termMonths;
  const totalInterest = totalPayments - principal;
  
  return {
    monthly_payment: Math.round(monthlyPayment * 100) / 100,
    total_payments: Math.round(totalPayments * 100) / 100,
    total_interest: Math.round(totalInterest * 100) / 100
  };
}

// Calculate lease payment using standard lease formula
function calculateLeasePayment(
  vehiclePrice: number, 
  residualPercent: number, 
  moneyFactor: number, 
  termMonths: number,
  downPayment: number = 0
): {
  monthly_payment: number;
  total_payments: number;
  residual_value: number;
  depreciation: number;
} {
  const residualValue = vehiclePrice * (residualPercent / 100);
  const depreciation = vehiclePrice - residualValue - downPayment;
  const depreciationPayment = depreciation / termMonths;
  const financePayment = (vehiclePrice + residualValue) * moneyFactor;
  const monthlyPayment = depreciationPayment + financePayment;
  const totalPayments = (monthlyPayment * termMonths) + downPayment;
  
  return {
    monthly_payment: Math.round(monthlyPayment * 100) / 100,
    total_payments: Math.round(totalPayments * 100) / 100,
    residual_value: Math.round(residualValue * 100) / 100,
    depreciation: Math.round(depreciation * 100) / 100
  };
}

// POST - Calculate financing options
export async function POST(req: NextRequest) {
  try {
    const parsed = FinancingCalculatorRequest.safeParse(await req.json());
    if (!parsed.success) {
      return bad(`Validation error: ${parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }

    const data = parsed.data;
    const calculationType = data.calculation_type || "both";
    
    // Calculate base amounts
    const vehiclePrice = data.vehicle_price;
    const downPayment = data.down_payment || 0;
    const tradeInValue = data.trade_in_value || 0;
    
    // Calculate taxes and fees
    const salesTaxRate = data.sales_tax_rate || 8.25; // Default TX rate
    const salesTaxAmount = vehiclePrice * (salesTaxRate / 100);
    const titleFee = data.title_fee || 33;
    const registrationFee = data.registration_fee || 75;
    const documentationFee = data.documentation_fee || 299;
    const dealerPrepFee = data.dealer_prep_fee || 0;
    
    const additionalProducts = (data.extended_warranty || 0) + (data.gap_insurance || 0) + (data.service_contract || 0);
    const totalFees = titleFee + registrationFee + documentationFee + dealerPrepFee;
    const totalTaxesFees = salesTaxAmount + totalFees;
    
    // Calculate net amount to finance
    const grossAmount = vehiclePrice + totalTaxesFees + additionalProducts;
    const netAmountToFinance = grossAmount - downPayment - tradeInValue;
    
    const results: any = {
      vehicle_details: {
        vehicle_price: vehiclePrice,
        down_payment: downPayment,
        trade_in_value: tradeInValue,
        net_trade_position: tradeInValue - downPayment
      },
      taxes_and_fees: {
        sales_tax_rate: salesTaxRate,
        sales_tax_amount: Math.round(salesTaxAmount * 100) / 100,
        title_fee: titleFee,
        registration_fee: registrationFee,
        documentation_fee: documentationFee,
        dealer_prep_fee: dealerPrepFee,
        extended_warranty: data.extended_warranty || 0,
        gap_insurance: data.gap_insurance || 0,
        service_contract: data.service_contract || 0,
        total_taxes_fees: Math.round(totalTaxesFees * 100) / 100,
        additional_products: additionalProducts,
        total_additional_costs: Math.round((totalTaxesFees + additionalProducts) * 100) / 100
      },
      financing_summary: {
        gross_amount: Math.round(grossAmount * 100) / 100,
        total_down_trade: Math.round((downPayment + tradeInValue) * 100) / 100,
        net_amount_to_finance: Math.round(netAmountToFinance * 100) / 100
      }
    };
    
    // Calculate loan options if requested
    if (calculationType === "loan" || calculationType === "both") {
      const loanOptions = [];
      
      // Multiple APR and term options for comparison
      const aprOptions = data.loan_apr ? [data.loan_apr] : [2.9, 3.9, 4.9, 5.9, 6.9, 7.9];
      const termOptions = data.loan_term_months ? [data.loan_term_months] : [36, 48, 60, 72, 84];
      
      for (const apr of aprOptions) {
        for (const term of termOptions) {
          const loanCalc = calculateLoanPayment(netAmountToFinance, apr, term);
          loanOptions.push({
            apr: apr,
            term_months: term,
            monthly_payment: loanCalc.monthly_payment,
            total_payments: loanCalc.total_payments,
            total_interest: loanCalc.total_interest,
            total_cost: Math.round((loanCalc.total_payments + downPayment + tradeInValue) * 100) / 100
          });
        }
      }
      
      results.loan_options = loanOptions;
    }
    
    // Calculate lease options if requested
    if (calculationType === "lease" || calculationType === "both") {
      const leaseOptions = [];
      
      // Multiple lease scenarios
      const termOptions = data.lease_term_months ? [data.lease_term_months] : [24, 36, 48];
      const residualOptions = data.lease_residual_percent ? [data.lease_residual_percent] : [50, 55, 60, 65];
      const moneyFactorOptions = data.lease_money_factor ? [data.lease_money_factor] : [0.00125, 0.00150, 0.00175, 0.00200]; // Equivalent to ~3-5% APR
      
      for (const term of termOptions) {
        for (const residual of residualOptions) {
          for (const moneyFactor of moneyFactorOptions) {
            const leaseCalc = calculateLeasePayment(vehiclePrice, residual, moneyFactor, term, downPayment);
            const totalLeasePayments = leaseCalc.total_payments;
            const totalCostWithFees = totalLeasePayments + totalTaxesFees;
            
            leaseOptions.push({
              term_months: term,
              residual_percent: residual,
              money_factor: moneyFactor,
              equivalent_apr: Math.round((moneyFactor * 2400) * 100) / 100, // Approximate conversion
              monthly_payment: leaseCalc.monthly_payment,
              total_payments: leaseCalc.total_payments,
              residual_value: leaseCalc.residual_value,
              depreciation: leaseCalc.depreciation,
              miles_per_year: data.lease_miles_per_year || 12000,
              total_cost_with_fees: Math.round(totalCostWithFees * 100) / 100
            });
          }
        }
      }
      
      results.lease_options = leaseOptions;
    }
    
    // Add comparison summary
    if (calculationType === "both" && results.loan_options && results.lease_options) {
      const bestLoan = results.loan_options.reduce((best: any, current: any) => 
        current.monthly_payment < best.monthly_payment ? current : best
      );
      const bestLease = results.lease_options.reduce((best: any, current: any) => 
        current.monthly_payment < best.monthly_payment ? current : best
      );
      
      results.comparison = {
        loan: {
          best_monthly_payment: bestLoan.monthly_payment,
          best_apr: bestLoan.apr,
          best_term: bestLoan.term_months,
          total_cost: bestLoan.total_cost,
          ownership: "You own the vehicle"
        },
        lease: {
          best_monthly_payment: bestLease.monthly_payment,
          best_term: bestLease.term_months,
          total_cost: bestLease.total_cost_with_fees,
          residual_value: bestLease.residual_value,
          ownership: "Return or purchase at lease end"
        },
        savings: {
          monthly_difference: Math.round((bestLoan.monthly_payment - bestLease.monthly_payment) * 100) / 100,
          total_cost_difference: Math.round((bestLoan.total_cost - bestLease.total_cost_with_fees) * 100) / 100,
          recommendation: bestLoan.monthly_payment < bestLease.monthly_payment ? "Loan offers better value" : "Lease offers lower payments"
        }
      };
    }
    
    // Add payment breakdown for transparency
    results.payment_breakdown = {
      cash_due_at_signing: Math.round((downPayment + totalFees + (data.extended_warranty || 0)) * 100) / 100,
      first_payment: calculationType === "lease" && results.lease_options 
        ? results.lease_options[0]?.monthly_payment 
        : results.loan_options?.[0]?.monthly_payment || 0,
      monthly_payment_includes: [
        "Principal and Interest (loan) or Depreciation (lease)",
        "Applicable taxes may be included in payment",
        calculationType === "lease" ? "GAP coverage typically included" : "GAP insurance optional"
      ]
    };
    
    return ok({
      calculation_type: calculationType,
      timestamp: new Date().toISOString(),
      ...results
    });
    
  } catch (e: any) {
    console.error("Financing calculation error:", e);
    return oops(e?.message || "Unknown error during financing calculation");
  }
}

// GET - Get financing rate information
export async function GET(req: NextRequest) {
  try {
    // Return current market rates and financing information
    const marketRates = {
      current_rates: {
        new_vehicle_loans: {
          excellent_credit: { min_apr: 2.9, max_apr: 4.9, terms: [36, 48, 60, 72] },
          good_credit: { min_apr: 4.9, max_apr: 6.9, terms: [36, 48, 60, 72] },
          fair_credit: { min_apr: 6.9, max_apr: 9.9, terms: [36, 48, 60, 72] },
          poor_credit: { min_apr: 9.9, max_apr: 15.9, terms: [36, 48, 60] }
        },
        used_vehicle_loans: {
          excellent_credit: { min_apr: 3.9, max_apr: 5.9, terms: [36, 48, 60, 72] },
          good_credit: { min_apr: 5.9, max_apr: 7.9, terms: [36, 48, 60, 72] },
          fair_credit: { min_apr: 7.9, max_apr: 11.9, terms: [36, 48, 60] },
          poor_credit: { min_apr: 11.9, max_apr: 18.9, terms: [36, 48, 60] }
        },
        lease_rates: {
          luxury_brands: { money_factor_range: "0.00100 - 0.00200", residual_range: "55-65%" },
          mainstream_brands: { money_factor_range: "0.00125 - 0.00250", residual_range: "50-60%" },
          electric_vehicles: { money_factor_range: "0.00050 - 0.00150", residual_range: "45-55%" }
        }
      },
      standard_fees: {
        texas: {
          sales_tax_rate: 6.25,
          local_tax_max: 2.0,
          title_fee: 33,
          registration_fee: 75,
          inspection_fee: 25
        },
        typical_dealer_fees: {
          documentation_fee: { min: 150, max: 299, average: 225 },
          dealer_prep_fee: { min: 0, max: 500, average: 200 },
          extended_warranty: { min: 1200, max: 4000, average: 2500 },
          gap_insurance: { min: 400, max: 800, average: 600 }
        }
      },
      calculation_notes: [
        "All rates subject to credit approval",
        "Actual APR may vary based on creditworthiness",
        "Lease calculations assume standard wear and tear",
        "Additional fees may apply based on location",
        "Payment estimates do not include insurance"
      ],
      last_updated: new Date().toISOString()
    };
    
    return ok(marketRates);
  } catch (e: any) {
    console.error("Rate information error:", e);
    return oops(e?.message || "Unknown error retrieving rate information");
  }
}
