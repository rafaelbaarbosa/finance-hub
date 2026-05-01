import { render, screen } from '@testing-library/react';
import CategoryCards from '../CategoryCards';

const mockCategories = [
  { name: 'Alimentação', total: 800, count: 5, percentage: 53.33 },
  { name: 'Transporte', total: 400, count: 3, percentage: 26.67 },
  { name: 'Outros', total: 300, count: 2, percentage: 20 },
];

test('renders one element per category', () => {
  render(<CategoryCards categories={mockCategories} />);

  expect(screen.getByText('Alimentação')).toBeInTheDocument();
  expect(screen.getByText('Transporte')).toBeInTheDocument();
  expect(screen.getByText('Outros')).toBeInTheDocument();
});

test('first card has bg-accent class', () => {
  const { container } = render(<CategoryCards categories={mockCategories} />);

  const accentCards = container.querySelectorAll('.bg-accent');
  expect(accentCards).toHaveLength(1);
});

test('only the first card has bg-accent', () => {
  const { container } = render(<CategoryCards categories={mockCategories} />);

  const allCards = container.querySelectorAll('[class*="rounded-sm"]');
  const accentCards = container.querySelectorAll('.bg-accent');

  expect(allCards.length).toBeGreaterThan(1);
  expect(accentCards).toHaveLength(1);
});

test('displays category totals formatted in BRL', () => {
  render(<CategoryCards categories={mockCategories} />);

  expect(screen.getByText(/800/)).toBeInTheDocument();
  expect(screen.getByText(/400/)).toBeInTheDocument();
  expect(screen.getByText(/300/)).toBeInTheDocument();
});
