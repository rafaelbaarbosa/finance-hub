/**
 * @jest-environment node
 */
import { getDocumentProxy, extractText } from 'unpdf';
import Groq from 'groq-sdk';
import { POST } from '../route.js';

jest.mock('unpdf', () => ({
  getDocumentProxy: jest.fn(),
  extractText: jest.fn(),
}));

jest.mock('groq-sdk', () => {
  const mockCreate = jest.fn();
  const MockGroq = jest.fn().mockImplementation(() => ({
    chat: { completions: { create: mockCreate } },
  }));
  MockGroq._mockCreate = mockCreate;
  return { __esModule: true, default: MockGroq };
});

function buildRequest(file = null) {
  return {
    formData: jest.fn().mockResolvedValue({
      get: jest.fn().mockReturnValue(file),
    }),
  };
}

function buildMockFile() {
  return {
    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
  };
}

function groqResponse(data) {
  return {
    choices: [{ message: { content: JSON.stringify(data) } }],
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  getDocumentProxy.mockResolvedValue({ _proxy: true });
  extractText.mockResolvedValue({ text: 'Transação iFood R$ 50,00' });
});

describe('POST /api/analyze', () => {
  test('returns 400 when no file is provided', async () => {
    const response = await POST(buildRequest(null));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Nenhum arquivo enviado.');
  });

  test('returns 400 when PDF text is empty', async () => {
    extractText.mockResolvedValueOnce({ text: '   ' });

    const response = await POST(buildRequest(buildMockFile()));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/Não foi possível extrair texto/);
  });

  test('returns data when Groq includes categories', async () => {
    const mockData = {
      period: 'Março 2024',
      totalAmount: 50,
      transactions: [{ date: '01/03', description: 'iFood', amount: 50, category: 'Alimentação' }],
      categories: [{ name: 'Alimentação', total: 50, count: 1, percentage: 100 }],
    };
    Groq._mockCreate.mockResolvedValueOnce(groqResponse(mockData));

    const response = await POST(buildRequest(buildMockFile()));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.period).toBe('Março 2024');
    expect(body.categories).toHaveLength(1);
    expect(body.categories[0].name).toBe('Alimentação');
  });

  test('computes categories server-side when Groq omits the array', async () => {
    const mockData = {
      period: 'Março 2024',
      totalAmount: 150,
      transactions: [
        { date: '01/03', description: 'iFood', amount: 100, category: 'Alimentação' },
        { date: '02/03', description: 'Uber', amount: 50, category: 'Transporte' },
      ],
    };
    Groq._mockCreate.mockResolvedValueOnce(groqResponse(mockData));

    const response = await POST(buildRequest(buildMockFile()));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.categories).toHaveLength(2);
    expect(body.categories[0].name).toBe('Alimentação');
    expect(body.categories[0].total).toBe(100);
    expect(body.categories[0].percentage).toBe(66.67);
    expect(body.categories[1].name).toBe('Transporte');
    expect(body.categories[1].total).toBe(50);
  });

  test('returns 500 on Groq error', async () => {
    Groq._mockCreate.mockRejectedValueOnce(new Error('API timeout'));

    const response = await POST(buildRequest(buildMockFile()));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toMatch(/Erro ao processar/);
  });
});
