## Test-Driven Development (TDD) best practices

- **Red-Green-Refactor Cycle**: Follow TDD's core workflow:
  1. **Red**: Write a failing test that defines desired behavior
  2. **Green**: Write minimal code to make the test pass
  3. **Refactor**: Improve code quality while keeping tests green
- **Write Tests First**: Create tests before implementation to clarify requirements and drive design
- **One Test at a Time**: Focus on a single test case, make it pass, then move to the next
- **Test Behavior, Not Implementation**: Focus tests on what the code does, not how it does it, to reduce brittleness
- **Clear Test Names**: Use descriptive names that explain what's being tested and the expected outcome
- **Start Simple**: Begin with the simplest test case and progressively add complexity
- **Mock External Dependencies**: Isolate units by mocking databases, APIs, file systems, and other external services
- **Fast Execution**: Keep unit tests fast (milliseconds) so developers run them frequently during development
- **Test Core Flows First**: Prioritize tests for critical paths and primary user workflows before edge cases
