import { useState } from "react";

export default function App() {
  const [formReceber, setFormReceber] = useState({
    nome: "",
    valor: "",
    parcelas: 1,
    vencimento: "",
    status: false,
    categoria: "",
  });

  const [dividas, setDividas] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [salario, setSalario] = useState(0);
  const [filtro, setFiltro] = useState({
    mes: "",
    status: "",
  });

  const adicionarDivida = () => {
    setDividas([
      ...dividas,
      {
        ...formReceber,
        vencimento: formReceber.vencimento.replace("-", "/"),
      },
    ]);
    setFormReceber({
      nome: "",
      valor: "",
      parcelas: 1,
      vencimento: "",
      status: false,
      categoria: "",
    });
  };

  const salvarHistorico = () => {
    setHistorico([
      ...historico,
      {
        salario,
        dividas,
        receber: [],
        data: new Date().toLocaleDateString("pt-BR"),
      },
    ]);
    setDividas([]);
    setSalario(0);
  };

  const exportarHistoricoParaCSV = () => {
    const cabecalho = ["Mês", "Salário", "Total Dívidas", "Total a Receber"];
    const linhas = historico.map((h) => [
      h.data,
      h.salario,
      h.dividas.length,
      h.receber.length,
    ]);

    const conteudo = [cabecalho, ...linhas]
      .map((linha) => linha.join(";"))
      .join("\n");

    const blob = new Blob(["\uFEFF" + conteudo], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "historico_financeiro.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Assistente Financeiro</h1>
      
      {/* Tela de Salário */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
        <div className="w-full md:w-1/2 p-4 bg-white shadow rounded">
          <label htmlFor="salario" className="block text-sm font-medium">Salário do mês</label>
          <input
            id="salario"
            className="w-full p-2 border rounded mt-2"
            type="number"
            placeholder="Digite o salário"
            value={salario}
            onChange={(e) => setSalario(e.target.value)}
          />
        </div>

        <div className="w-full md:w-1/2 p-4 bg-white shadow rounded">
          <button
            onClick={salvarHistorico}
            className="w-full bg-blue-600 text-white p-2 rounded"
          >
            Salvar Histórico
          </button>
        </div>
      </div>

      {/* Formulário de Dívida */}
      <div className="w-full p-4 bg-white shadow rounded mb-8">
        <h2 className="text-2xl font-semibold mb-4">Adicionar Dívida</h2>
        <div className="space-y-4">
          <input
            className="w-full p-2 border rounded"
            placeholder="Descrição da dívida"
            value={formReceber.nome}
            onChange={(e) => setFormReceber({ ...formReceber, nome: e.target.value })}
          />
          <input
            className="w-full p-2 border rounded"
            placeholder="Valor"
            type="number"
            value={formReceber.valor}
            onChange={(e) => setFormReceber({ ...formReceber, valor: e.target.value })}
          />
          <input
            className="w-full p-2 border rounded"
            placeholder="Parcelas (1-12)"
            type="number"
            value={formReceber.parcelas}
            onChange={(e) => setFormReceber({ ...formReceber, parcelas: e.target.value })}
            min={1}
            max={12}
          />
          <input
            className="w-full p-2 border rounded"
            type="date"
            placeholder="Data de Vencimento"
            value={formReceber.vencimento}
            onChange={(e) => setFormReceber({ ...formReceber, vencimento: e.target.value })}
          />
          <select
            className="w-full p-2 border rounded"
            value={formReceber.categoria}
            onChange={(e) => setFormReceber({ ...formReceber, categoria: e.target.value })}
          >
            <option value="">Categoria</option>
            <option value="Aluguel">Aluguel</option>
            <option value="Comida">Comida</option>
            <option value="Lazer">Lazer</option>
          </select>
          <button
            onClick={adicionarDivida}
            className="w-full bg-green-600 text-white p-2 rounded"
          >
            Adicionar Dívida
          </button>
        </div>
      </div>

      {/* Tabela de Dívidas */}
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full table-auto bg-white shadow rounded">
          <thead>
            <tr>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Valor</th>
              <th className="px-4 py-2">Parcelamento</th>
              <th className="px-4 py-2">Data Vencimento</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {dividas.map((divida, index) => (
              <tr key={index}>
                <td className="px-4 py-2">{divida.nome}</td>
                <td className="px-4 py-2">{divida.valor}</td>
                <td className="px-4 py-2">{divida.parcelas}</td>
                <td className="px-4 py-2">{divida.vencimento}</td>
                <td className="px-4 py-2">{divida.status ? "Pago" : "Pendente"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Exportar Histórico */}
      <div className="w-full p-4 bg-white shadow rounded mb-8">
        <button
          onClick={exportarHistoricoParaCSV}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          📤 Exportar Histórico (CSV)
        </button>
      </div>
    </div>
  );
}
