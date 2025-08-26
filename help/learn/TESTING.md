# Testing Documentation

This document provides guidelines and best practices for testing The Adventurers Guild platform.

## Testing Strategy

Our testing approach follows the testing pyramid principle with a focus on:

1. **Unit Tests** (70%) - Testing individual functions and components
2. **Integration Tests** (20%) - Testing how components and services work together
3. **End-to-End Tests** (10%) - Testing complete user workflows

## Testing Tools

### Unit & Integration Testing
- **Jest** - JavaScript testing framework
- **React Testing Library** - For testing React components
- **Supertest** - For testing API routes

### End-to-End Testing
- **Cypress** - For browser-based E2E testing
- **Playwright** - Alternative E2E testing framework

### Mocking & Fixtures
- **Mock Service Worker (MSW)** - For API mocking
- **Factory bots** - For generating test data

## Test Structure

```
__tests__/
├── unit/              # Unit tests
│   ├── components/    # Component unit tests
│   ├── lib/           # Utility function tests
│   ├── hooks/         # Custom hook tests
│   └── services/      # Service function tests
├── integration/       # Integration tests
│   ├── api/          # API route tests
│   ├── auth/         # Authentication flow tests
│   └── database/     # Database integration tests
├── e2e/              # End-to-end tests
│   ├── auth/         # Authentication E2E tests
│   ├── quests/       # Quest management E2E tests
│   └── profile/      # Profile management E2E tests
└── fixtures/         # Test data fixtures
    ├── users.ts      # User test data
    ├── quests.ts     # Quest test data
    └── skills.ts     # Skill test data
```

## Unit Testing Guidelines

### Component Testing

1. **Test Props**: Test component behavior with different prop values
2. **Test User Interactions**: Simulate user actions (clicks, inputs)
3. **Test State Changes**: Verify state updates after interactions
4. **Test Edge Cases**: Empty states, loading states, error states

Example:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Hook Testing

1. **Test Return Values**: Verify hook returns expected values
2. **Test Side Effects**: Test hook behavior with dependencies
3. **Test Updates**: Verify hook updates with changing dependencies

Example:
```typescript
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

describe('useAuth', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
  });
});
```

### Utility Function Testing

1. **Test All Branches**: Cover all code paths
2. **Test Edge Cases**: Empty inputs, invalid inputs
3. **Test Return Values**: Verify correct outputs

Example:
```typescript
import { formatDate } from '@/lib/utils';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2023-01-01');
    expect(formatDate(date)).toBe('January 1, 2023');
  });

  it('handles invalid date', () => {
    expect(formatDate(null)).toBe('Invalid Date');
  });
});
```

## Integration Testing Guidelines

### API Route Testing

1. **Test All HTTP Methods**: GET, POST, PUT, DELETE
2. **Test Authentication**: Verify auth requirements
3. **Test Validation**: Test input validation
4. **Test Error Cases**: Database errors, validation errors

Example:
```typescript
import { createMocks } from 'node-mocks-http';
import { POST as createQuest } from '@/app/api/quests/route';

describe('POST /api/quests', () => {
  it('creates a quest successfully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        title: 'Test Quest',
        description: 'Test Description'
      },
      headers: {
        'authorization': 'Bearer valid-token'
      }
    });

    await createQuest(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toHaveProperty('success', true);
  });
});
```

### Database Integration Testing

1. **Test CRUD Operations**: Create, Read, Update, Delete
2. **Test Relationships**: Foreign key constraints
3. **Test Constraints**: Unique constraints, validation
4. **Test Performance**: Query performance with large datasets

Example:
```typescript
import { createQuest, getQuestById } from '@/lib/quests';

describe('Quest Database Operations', () => {
  it('creates and retrieves a quest', async () => {
    const questData = {
      title: 'Test Quest',
      description: 'Test Description',
      difficulty: 'B'
    };

    const createdQuest = await createQuest(questData);
    const retrievedQuest = await getQuestById(createdQuest.id);

    expect(retrievedQuest.title).toBe(questData.title);
    expect(retrievedQuest.description).toBe(questData.description);
  });
});
```

## End-to-End Testing Guidelines

### Authentication Flows

1. **Sign Up Flow**: Test complete registration process
2. **Sign In Flow**: Test login with valid credentials
3. **Sign Out Flow**: Test logout functionality
4. **OAuth Flow**: Test Google/GitHub authentication

Example:
```typescript
describe('Authentication', () => {
  it('allows user to sign up and sign in', () => {
    cy.visit('/signup');
    
    cy.get('[data-testid="name-input"]').type('Test User');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="signup-button"]').click();
    
    cy.url().should('include', '/dashboard');
    
    cy.get('[data-testid="user-menu"]').should('contain', 'Test User');
  });
});
```

### Quest Management

1. **Create Quest**: Test quest creation form
2. **Browse Quests**: Test quest listing and filtering
3. **Apply for Quest**: Test application process
4. **Submit Quest**: Test submission workflow

Example:
```typescript
describe('Quest Management', () => {
  beforeEach(() => {
    cy.loginAsCompany();
    cy.visit('/company/dashboard');
  });

  it('allows company to create a quest', () => {
    cy.get('[data-testid="create-quest-button"]').click();
    
    cy.get('[data-testid="title-input"]').type('Test Quest');
    cy.get('[data-testid="description-input"]').type('Test Description');
    cy.get('[data-testid="difficulty-select"]').select('B');
    cy.get('[data-testid="xp-input"]').type('150');
    
    cy.get('[data-testid="submit-button"]').click();
    
    cy.get('[data-testid="success-message"]').should('be.visible');
    cy.get('[data-testid="quest-list"]').should('contain', 'Test Quest');
  });
});
```

## Test Data Management

### Fixtures

Use fixtures for consistent test data:

```typescript
// __tests__/fixtures/users.ts
export const testUsers = {
  student: {
    id: 'student-1',
    email: 'student@example.com',
    name: 'Test Student',
    role: 'student',
    rank: 'F',
    xp: 0
  },
  company: {
    id: 'company-1',
    email: 'company@example.com',
    name: 'Test Company',
    role: 'company',
    rank: 'F',
    xp: 0
  }
};
```

### Factories

Use factories for dynamic test data:

```typescript
// __tests__/factories/questFactory.ts
import { faker } from '@faker-js/faker';

export const createQuest = (overrides = {}) => ({
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  difficulty: faker.helpers.arrayElement(['F', 'D', 'C', 'B', 'A', 'S']),
  xp_reward: faker.number.int({ min: 50, max: 500 }),
  ...overrides
});
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
```

### Test Commands

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest __tests__/unit",
    "test:integration": "jest __tests__/integration",
    "test:e2e": "cypress run",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## Test Coverage

### Target Coverage
- **Unit Tests**: 80% coverage
- **Integration Tests**: 70% coverage
- **E2E Tests**: 60% coverage for critical paths

### Coverage Reports

Generate coverage reports with:
```bash
npm run test:coverage
```

This creates detailed reports in the `coverage/` directory.

## Mocking Strategy

### API Mocking

Use MSW for API mocking in tests:

```typescript
// __mocks__/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/user', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com'
        }
      })
    );
  })
];
```

### Database Mocking

Use in-memory databases for integration tests:

```typescript
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';

global.prisma = mockDeep<PrismaClient>();

beforeEach(() => {
  mockReset(global.prisma);
});
```

## Performance Testing

### Load Testing

Use tools like Artillery for load testing:

```yaml
# load-test.yml
config:
  target: 'https://adventurersguild.vercel.app'
  phases:
    - duration: 60
      arrivalRate: 20
scenarios:
  - flow:
    - get:
        url: '/api/quests'
```

Run with:
```bash
artillery run load-test.yml
```

## Accessibility Testing

### Automated Testing

Use axe-core for accessibility testing:

```typescript
import { axe } from 'jest-axe';

it('has no accessibility violations', async () => {
  const { container } = render(<QuestList />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Testing

Regular manual testing with:
- Screen readers (NVDA, VoiceOver)
- Keyboard navigation
- High contrast mode
- Zoom functionality

## Security Testing

### Input Validation

Test for:
- SQL injection
- XSS attacks
- CSRF protection
- Rate limiting

### Authentication Testing

Test for:
- Session fixation
- Password strength
- OAuth security
- JWT security

## Monitoring & Reporting

### Test Reporting

Generate detailed test reports:
```bash
npm run test -- --reporters="default" --reporters="jest-junit"
```

### Test Analytics

Track test performance over time:
- Test execution time
- Failure rates
- Coverage trends
- Flaky test detection

## Best Practices

### Test Writing

1. **Use Descriptive Test Names**: Clearly describe what is being tested
2. **Follow AAA Pattern**: Arrange, Act, Assert
3. **Keep Tests Independent**: Tests should not depend on each other
4. **Use Test Data Factories**: Generate consistent test data
5. **Mock External Dependencies**: Isolate the code under test

### Test Maintenance

1. **Regular Test Reviews**: Review and update tests with code changes
2. **Remove Flaky Tests**: Identify and fix unreliable tests
3. **Update Test Data**: Keep fixtures and factories current
4. **Monitor Coverage**: Track and maintain coverage levels

### Test Performance

1. **Parallel Test Execution**: Run tests in parallel when possible
2. **Database Cleanup**: Clean up test data between tests
3. **Mock Heavy Operations**: Avoid slow operations in tests
4. **Use Snapshots Sparingly**: Only for UI structure, not content

This testing strategy ensures code quality, prevents regressions, and maintains confidence in deployments.