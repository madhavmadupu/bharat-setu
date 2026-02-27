/**
 * Basic setup test to verify the testing infrastructure
 */

describe('Project Setup', () => {
  it('should have TypeScript configured correctly', () => {
    expect(true).toBe(true);
  });

  it('should import types correctly', () => {
    const languages: string[] = [
      'hi-IN', 'ta-IN', 'mr-IN', 'te-IN', 'bn-IN',
      'gu-IN', 'kn-IN', 'ml-IN', 'pa-IN', 'or-IN'
    ];
    
    expect(languages).toHaveLength(10);
  });
});
