export const truncateText = (text: string, maxLength: number = 200): string => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const getScoreColor = (score: number): string => {
  if (score >= 0.9) return 'bg-green-100 text-green-800';
  if (score >= 0.7) return 'bg-blue-100 text-blue-800';
  if (score >= 0.5) return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
};

export const getRuleOperatorSymbol = (operator: string): string => {
  const operatorMap: Record<string, string> = {
    '==': '=',
    '!=': '≠',
    '>': '>',
    '>=': '≥',
    '<': '<',
    '<=': '≤',
    'in': 'in',
    'not in': 'not in',
  };
  return operatorMap[operator] || operator;
};

export const formatRuleValue = (value: any, field?: string): string => {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  if (value === null || value === undefined) return 'Not specified';
  if (field === 'monthly_income' || field === 'income_annual') {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value));
  }
  if (field === 'land_area') {
    return `${value} acres`;
  }
  if (field === 'age') {
    return `${value} years`;
  }
  if (typeof value === 'string') {
    return value.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  if (typeof value === 'number') {
    return value.toLocaleString('en-IN');
  }
  return String(value);
};

export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-IN', options);
};
