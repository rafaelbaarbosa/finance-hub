import Groq from "groq-sdk";
import { extractText, getDocumentProxy } from "unpdf";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const PROMPT = `Você é um analisador de extratos de cartão de crédito. Analise o texto abaixo e identifique todas as transações de débito/compras (ignore créditos, estornos e pagamentos da fatura).

Categorize cada transação em uma dessas categorias:
- Alimentação (restaurantes, delivery, supermercados, padarias, cafés)
- Transporte (Uber, 99, gasolina, estacionamento, pedágio, transporte público)
- Entretenimento (streaming, cinema, shows, jogos, bares)
- Saúde (farmácias, clínicas, hospitais, academias, planos de saúde)
- Compras (roupas, eletrônicos, lojas, e-commerce)
- Educação (cursos, livros, assinaturas educacionais)
- Serviços (internet, telefone, energia, água, assinaturas diversas)
- Viagem (hotéis, passagens aéreas, Airbnb)
- Outros (tudo que não se encaixar acima)

Retorne um JSON com esta estrutura:
{
  "period": "período do extrato (ex: Março 2024)",
  "totalAmount": número com o total de todas as transações,
  "transactions": [
    {
      "date": "data como aparece no extrato",
      "description": "descrição da transação",
      "amount": valor numérico positivo,
      "category": "uma das categorias listadas acima"
    }
  ],
  "categories": [
    {
      "name": "nome da categoria",
      "total": total gasto na categoria,
      "count": número de transações,
      "percentage": percentual do total (0-100, duas casas decimais)
    }
  ]
}

As categories devem incluir apenas categorias com pelo menos uma transação, ordenadas por total (maior para menor).

Texto do extrato:
`;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json(
        { error: "Nenhum arquivo enviado." },
        { status: 400 }
      );
    }

    const buffer = new Uint8Array(await file.arrayBuffer());
    const pdf = await getDocumentProxy(buffer);
    const { text } = await extractText(pdf, { mergePages: true });

    if (!text?.trim()) {
      return Response.json(
        {
          error:
            "Não foi possível extrair texto do PDF. O arquivo pode estar protegido ou ser uma imagem.",
        },
        { status: 400 }
      );
    }

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: PROMPT + text }],
      response_format: { type: "json_object" },
    });

    const data = JSON.parse(completion.choices[0].message.content);

    if (!Array.isArray(data.categories) || data.categories.length === 0) {
      const total = data.totalAmount || data.transactions.reduce((sum, t) => sum + t.amount, 0);
      const categoryMap = {};
      for (const t of data.transactions) {
        if (!categoryMap[t.category]) {
          categoryMap[t.category] = { name: t.category, total: 0, count: 0 };
        }
        categoryMap[t.category].total += t.amount;
        categoryMap[t.category].count += 1;
      }
      data.categories = Object.values(categoryMap)
        .map((cat) => ({
          ...cat,
          total: Math.round(cat.total * 100) / 100,
          percentage: Math.round((cat.total / total) * 10000) / 100,
        }))
        .sort((a, b) => b.total - a.total);
    }

    return Response.json(data);
  } catch (err) {
    console.error("Analyze error:", err);

    if (err instanceof SyntaxError) {
      return Response.json(
        { error: "Não foi possível interpretar o extrato. Tente novamente." },
        { status: 500 }
      );
    }

    return Response.json(
      { error: "Erro ao processar o extrato. Tente novamente." },
      { status: 500 }
    );
  }
}
