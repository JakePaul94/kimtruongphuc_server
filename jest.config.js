// jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'], // Mặc định
    // moduleNameMapper: { // Có thể cần nếu bạn dùng paths alias
    //   '^@/(.*)$': '<rootDir>/src/$1',
    // },
    clearMocks: true, 
  };