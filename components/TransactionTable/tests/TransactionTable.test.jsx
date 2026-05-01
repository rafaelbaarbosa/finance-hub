import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionTable from '../TransactionTable';

const mockTransactions = [
  { date: '01/05', description: 'iFood', amount: 50, category: 'Alimentação' },
  { date: '02/05', description: 'Uber', amount: 30, category: 'Transporte' },
  { date: '03/05', description: 'Netflix', amount: 40, category: 'Entretenimento' },
];

test('shows all transactions by default', () => {
  render(<TransactionTable transactions={mockTransactions} />);

  expect(screen.getByText('iFood')).toBeInTheDocument();
  expect(screen.getByText('Uber')).toBeInTheDocument();
  expect(screen.getByText('Netflix')).toBeInTheDocument();
});

test('filters transactions by search term', async () => {
  const user = userEvent.setup();
  render(<TransactionTable transactions={mockTransactions} />);

  await user.type(screen.getByPlaceholderText('Buscar descrição...'), 'iFood');

  expect(screen.getByText('iFood')).toBeInTheDocument();
  expect(screen.queryByText('Uber')).not.toBeInTheDocument();
  expect(screen.queryByText('Netflix')).not.toBeInTheDocument();
});

test('shows empty state when search has no results', async () => {
  const user = userEvent.setup();
  render(<TransactionTable transactions={mockTransactions} />);

  await user.type(screen.getByPlaceholderText('Buscar descrição...'), 'xyz_nao_existe');

  expect(screen.getByText('Nenhuma transação encontrada.')).toBeInTheDocument();
});

test('filters transactions by category chip', async () => {
  const user = userEvent.setup();
  render(<TransactionTable transactions={mockTransactions} />);

  await user.click(screen.getByRole('button', { name: 'Alimentação' }));

  expect(screen.getByText('iFood')).toBeInTheDocument();
  expect(screen.queryByText('Uber')).not.toBeInTheDocument();
  expect(screen.queryByText('Netflix')).not.toBeInTheDocument();
});

test('"Todas" chip resets category filter', async () => {
  const user = userEvent.setup();
  render(<TransactionTable transactions={mockTransactions} />);

  await user.click(screen.getByRole('button', { name: 'Alimentação' }));
  await user.click(screen.getByRole('button', { name: 'Todas' }));

  expect(screen.getByText('iFood')).toBeInTheDocument();
  expect(screen.getByText('Uber')).toBeInTheDocument();
  expect(screen.getByText('Netflix')).toBeInTheDocument();
});

test('record counter reflects filtered results', async () => {
  const user = userEvent.setup();
  render(<TransactionTable transactions={mockTransactions} />);

  expect(screen.getByText('3 registros')).toBeInTheDocument();

  await user.type(screen.getByPlaceholderText('Buscar descrição...'), 'iFood');

  expect(screen.getByText('1 registro')).toBeInTheDocument();
});
