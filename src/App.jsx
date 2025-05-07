// App.jsx
import React, { useEffect, useState } from "react";

export default function App() {
  const [abaAtual, setAbaAtual] = useState("salario");
  const [salario, setSalario] = useState(localStorage.getItem("salario") || "");
  const [dividas, setDividas] = useState(JSON.parse(localStorage.getItem("dividas") || "[]"));
  const [receber, setReceber] = useState(JSON.parse(localStorage.getItem("receber") || "[]"));
  const [formDivida, setFormDivida] = useState({ nome: "", valor: "", parcelas: 1, vencimento: "", pago: false, categoria: "" });
  const [formReceber, setFormReceber] = useState({ pessoa: "", nome: "", valor: "", parcelas: 1, categoria: "" });
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  useEffect(() => {
    localStorage.setItem("salario", salario);
    localStorage.setItem("dividas", JSON.stringify(dividas));
    localStorage.setItem("receber", JSON.stringify(receber));
  }, [salario, dividas, receber]);

  const parseValor = (val) => parseFloat(val.replace(',', '.')) || 0;

  const adicionarDivida = () => {
    if (!formDivida.nome || !formDivida.valor) return;
    setDividas([...dividas, { ...formDivida, valor: parseValor(formDivida.valor) }]);
    setFormDivida({ nome: "", valor: "", parcelas: 1, vencimento: "", pago: false, categoria: "" });
  };

  const editarDivida = (index, campo, valor) => {
    const novas = [...dividas];
    novas[index][campo] = campo === 'valor' ? parseValor(valor) : valor;
    setDividas(novas);
  };

  const removerDivida = (index) => {
    const novas = [...dividas];
    novas.splice(index, 1);
    setDividas(novas);
  };

  const adicionarReceber = () => {
    if (!formReceber.nome || !formReceber.valor || !formReceber.pessoa) return;
    setReceber([...receber, { ...formReceber, valor: parseValor(formReceber.valor) }]);
    setFormReceber({ pessoa: "", nome: "", valor: "", parcelas: 1, categoria: "" });
  };

  const editarReceber = (index, campo, valor) => {
    const novos = [...receber];
    novos[index][campo] = campo === 'valor' ? parseValor(valor) : valor;
    setReceber(novos);
  };

  const removerReceber = (index) => {
    const novos = [...receber];
    novos.splice(index, 1);
    setReceber(novos);
  };

  const totalDividas = dividas.reduce((acc, d) => acc + parseFloat(d.valor), 0);
  const totalReceber = receber.reduce((acc, r) => acc + parseFloat(r.valor), 0);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Assistente Financeiro</h1>

      <div className="flex justify-center flex-wrap gap-2 mb-6">
        {['salario', 'dividas', 'receber', 'historico'].map(tab => (
          <button
            key={tab}
            onClick={() => setAbaAtual(tab)}
            className={`px-4 py-2 rounded ${abaAtual === tab ? "bg-green-600 text-white" : "bg-white"}`}
          >
            {tab === 'salario' ? 'Salário' : tab === 'dividas' ? 'Minhas Dívidas' : tab === 'receber' ? 'Quem Me Deve' : 'Histórico'}
          </button>
        ))}
      </div>

      {abaAtual === "salario" && (
        <div className="max-w-md mx-auto">
          <label className="block mb-2">Salário do mês:</label>
          <input
            type="text"
            value={salario}
            onChange={(e) => setSalario(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      )}

      {abaAtual === "dividas" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-2">
            <input placeholder="Descrição da dívida" value={formDivida.nome} onChange={e => setFormDivida({ ...formDivida, nome: e.target.value })} className="p-2 border rounded" />
            <input placeholder="Valor" value={formDivida.valor} onChange={e => setFormDivida({ ...formDivida, valor: e.target.value })} className="p-2 border rounded" />
            <input type="number" placeholder="Parcelas (1-12)" value={formDivida.parcelas} onChange={e => setFormDivida({ ...formDivida, parcelas: e.target.value })} className="p-2 border rounded" />
            <input type="date" value={formDivida.vencimento} onChange={e => setFormDivida({ ...formDivida, vencimento: e.target.value })} className="p-2 border rounded" />
            <select value={formDivida.categoria} onChange={e => setFormDivida({ ...formDivida, categoria: e.target.value })} className="p-2 border rounded">
              <option value="">Categoria</option>
              <option value="Aluguel">Aluguel</option>
              <option value="Comida">Comida</option>
              <option value="Lazer">Lazer</option>
            </select>
            <label className="flex items-center">
              <input type="checkbox" checked={formDivida.pago} onChange={e => setFormDivida({ ...formDivida, pago: e.target.checked })} className="mr-2" /> Pago
            </label>
          </div>
          <button onClick={adicionarDivida} className="px-4 py-2 bg-green-600 text-white rounded">Adicionar Dívida</button>

          <table className="w-full mt-6 text-center text-sm border border-gray-300">
            <thead className="bg-green-100">
              <tr>
                <th>Descrição</th><th>Valor</th><th>Parcelas</th><th>Vencimento</th><th>Pago</th><th>Categoria</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {dividas.map((d, i) => {
                const diasParaVencer = (new Date(d.vencimento) - new Date()) / (1000 * 60 * 60 * 24);
                const destaque = diasParaVencer <= 3 && !d.pago ? "bg-red-100" : "";
                return (
                  <tr key={i} className={`${destaque} border-t`}> 
                    <td>{d.nome}</td>
                    <td>{parseFloat(d.valor).toFixed(2)}</td>
                    <td>{d.parcelas}</td>
                    <td>{new Date(d.vencimento).toLocaleDateString("pt-BR")}</td>
                    <td>{d.pago ? "Sim" : "Não"}</td>
                    <td>{d.categoria}</td>
                    <td className="space-x-2">
                      <button onClick={() => removerDivida(i)} className="text-red-500">Apagar</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {abaAtual === "receber" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-2">
            <input placeholder="Nome da pessoa" value={formReceber.pessoa} onChange={e => setFormReceber({ ...formReceber, pessoa: e.target.value })} className="p-2 border rounded" />
            <input placeholder="Descrição da dívida" value={formReceber.nome} onChange={e => setFormReceber({ ...formReceber, nome: e.target.value })} className="p-2 border rounded" />
            <input placeholder="Valor" value={formReceber.valor} onChange={e => setFormReceber({ ...formReceber, valor: e.target.value })} className="p-2 border rounded" />
            <input type="number" placeholder="Parcelas" value={formReceber.parcelas} onChange={e => setFormReceber({ ...formReceber, parcelas: e.target.value })} className="p-2 border rounded" />
            <select value={formReceber.categoria} onChange={e => setFormReceber({ ...formReceber, categoria: e.target.value })} className="p-2 border rounded">
              <option value="">Categoria</option>
              <option value="Aluguel">Aluguel</option>
              <option value="Comida">Comida</option>
              <option value="Lazer">Lazer</option>
            </select>
          </div>
          <button onClick={adicionarReceber} className="px-4 py-2 bg-green-600 text-white rounded">Adicionar</button>

          <table className="w-full mt-6 text-center text-sm border border-gray-300">
            <thead className="bg-green-100">
              <tr>
                <th>Pessoa</th><th>Descrição</th><th>Valor</th><th>Parcelas</th><th>Categoria</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {receber.map((r, i) => (
                <tr key={i} className="border-t">
                  <td>{r.pessoa}</td>
                  <td>{r.nome}</td>
                  <td>{parseFloat(r.valor).toFixed(2)}</td>
                  <td>{r.parcelas}</td>
                  <td>{r.categoria}</td>
                  <td className="space-x-2">
                    <button onClick={() => removerReceber(i)} className="text-red-500">Apagar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {abaAtual === "historico" && (
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Resumo</h2>
          <p>Salário: R$ {parseValor(salario).toFixed(2)}</p>
          <p>Total de Dívidas: R$ {totalDividas.toFixed(2)}</p>
          <p>Total a Receber: R$ {totalReceber.toFixed(2)}</p>
          <p>Saldo Final: R$ {(parseValor(salario) - totalDividas + totalReceber).toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}
