export interface AgeCalculationResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  isEligible: boolean;
  statusMessage: string;
  maxAllowedAge: number;
  minAllowedAge: number;
}

export function calculateCandidateAge(
  dobStr: string,
  asOnStr: string = '2026-01-01',
  category: 'General' | 'OBC' | 'EWS' | 'MBC' | 'SC' | 'ST' = 'General',
  gender: 'Male' | 'Female' = 'Male',
  minAge: number = 18,
  baseMaxAge: number = 40
): AgeCalculationResult | null {
  if (!dobStr) return null;

  const dob = new Date(dobStr);
  const asOn = new Date(asOnStr);

  if (isNaN(dob.getTime()) || isNaN(asOn.getTime()) || dob > asOn) {
    return null;
  }

  let years = asOn.getFullYear() - dob.getFullYear();
  let months = asOn.getMonth() - dob.getMonth();
  let days = asOn.getDate() - dob.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = new Date(asOn.getFullYear(), asOn.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const diffTime = Math.abs(asOn.getTime() - dob.getTime());
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Rajasthan Govt DOP Age Relaxation Rules:
  // General Male: Base max age (usually 40)
  // General Female: +5 years (45)
  // Reserved Male (OBC/EWS/MBC/SC/ST of Rajasthan): +5 years (45)
  // Reserved Female (OBC/EWS/MBC/SC/ST of Rajasthan): +10 years (50)
  let relaxation = 0;
  if (category === 'General') {
    relaxation = gender === 'Female' ? 5 : 0;
  } else {
    relaxation = gender === 'Female' ? 10 : 5;
  }

  const maxAllowedAge = baseMaxAge + relaxation;
  const minAllowedAge = minAge;

  const isUnderAge = years < minAllowedAge;
  const isOverAge = years > maxAllowedAge || (years === maxAllowedAge && (months > 0 || days > 0));

  let isEligible = !isUnderAge && !isOverAge;
  let statusMessage = '';

  if (isUnderAge) {
    statusMessage = `Underage: Candidate will be ${years} years on cutoff date (Minimum required is ${minAllowedAge} years).`;
  } else if (isOverAge) {
    statusMessage = `Overage: Age (${years}y ${months}m ${days}d) exceeds maximum allowed age limit of ${maxAllowedAge} years (including ${relaxation} yrs relaxation for ${gender} ${category}).`;
  } else {
    statusMessage = `Eligible: Candidate is ${years} years ${months} months old (Allowed: ${minAllowedAge} - ${maxAllowedAge} years with relaxation).`;
  }

  return {
    years,
    months,
    days,
    totalDays,
    isEligible,
    statusMessage,
    maxAllowedAge,
    minAllowedAge
  };
}
