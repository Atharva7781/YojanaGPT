export const truncateText = (text: string, maxLength: number = 200): string => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const getScoreColor = (score: number): string => {
  if (score >= 0.8) return 'bg-green-100 text-green-800';
  if (score >= 0.5) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
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

export const formatRuleValue = (value: any): string => {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  return String(value);
};
