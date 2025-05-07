// App.jsx
import React, { useState, useEffect } from "react";

export default function App() {
  const [abaAtual, setAbaAtual] = useState("salario");
  const [salario, setSalario] = useState(() => localStorage.getItem("salario") || "");
  const [dividas, setDividas] = useState(() => JSON.parse(localStorage.getItem("dividas") || "[]"));
  const [receber, setReceber] = useState(() => JSON.parse(localStorage.getItem("receber") || "[]"));

  const [formDivida, setFormDivida] = useState({ descricao: "", valor: "", parcelas: "1", vencimento: "", pago: false, categoria: "" });
  const [formReceber, setFormReceber] = useState({ pessoa: "", descricao: "", valor: "", parcelas: "1", categoria: "" });

  useEffect(() => {
    localStorage.setItem("salario", salario);
    localStorage.setItem("dividas", JSON.stringify(dividas));
    localStorage.setItem("receber", JSON.stringify(receber));
  }, [salario, dividas, receber]);

  const handleAddDivida = () => {
    setDividas([...dividas, formDivida]);
    setFormDivida({ descricao: "", valor: "", parcelas: "1", vencimento: "", pago: false, categoria: "" });
  };

  const handleAddReceber = () => {
    setReceber([...receber, formReceber]);
    setFormReceber({ pessoa: "", descricao: "", valor: "", parcelas: "1", categoria: "" });
  };

  const saldoFinal = Number(salario) - dividas.reduce((acc, d) => acc + Number(d.valor), 0) + receber.reduce((acc, r) => acc + Number(r.valor), 0);

  const vencendoEm3Dias = dividas.filter(d => {
    const hoje = new Date();
    const venc = new Date(d.vencimento);
    const diff = (venc - hoje) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 3;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Assistente Financeiro</h1>

      <div className="flex justify-center space-x-2 mb-6">
        <button onClick={() => setAbaAtual("salario")} className={`px-4 py-2 rounded ${abaAtual === "salario" ? "bg-green-600 text-white" : "bg-white"}`}>Salário</button>
        <button onClick={() => setAbaAtual("dividas")} className={`px-4 py-2 rounded ${abaAtual === "dividas" ? "bg-green-600 text-white" : "bg-white"}`}>Minhas Dívidas</button>
        <button onClick={() => setAbaAtual("receber")} className={`px-4 py-2 rounded ${abaAtual === "receber" ? "bg-green-600 text-white" : "bg-white"}`}>Quem Me Deve</button>
        <button onClick={() => setAbaAtual("historico")} className={`px-4 py-2 rounded ${abaAtual === "historico" ? "bg-green-600 text-white" : "bg-white"}`}>Histórico</button>
      </div>

      {abaAtual === "salario" && (
        <div className="max-w-md mx-auto bg-white p-4 rounded shadow">
          <label className="block mb-2 font-medium">Salário do Mês:</label>
          <input type="number" className="w-full p-2 border rounded" value={salario} onChange={e => setSalario(e.target.value)} />
          <div className="mt-4 text-center font-bold">Saldo final: R$ {saldoFinal.toFixed(2)}</div>
        </div>
      )}

      {abaAtual === "dividas" && (
        <div className="max-w-md mx-auto">
          <input className="w-full p-2 mb-2 border rounded" placeholder="Descrição da dívida" value={formDivida.descricao} onChange={e => setFormDivida({ ...formDivida, descricao: e.target.value })} />
          <input type="number" className="w-full p-2 mb-2 border rounded" placeholder="Valor" value={formDivida.valor} onChange={e => setFormDivida({ ...formDivida, valor: e.target.value })} />
          <select className="w-full p-2 mb-2 border rounded" value={formDivida.parcelas} onChange={e => setFormDivida({ ...formDivida, parcelas: e.target.value })}>
            {[...Array(12)].map((_, i) => (<option key={i + 1} value={i + 1}>{i + 1}x</option>))}
          </select>
          <input type="date" className="w-full p-2 mb-2 border rounded" value={formDivida.vencimento} onChange={e => setFormDivida({ ...formDivida, vencimento: e.target.value })} />
          <input className="w-full p-2 mb-2 border rounded" placeholder="Categoria" value={formDivida.categoria} onChange={e => setFormDivida({ ...formDivida, categoria: e.target.value })} />
          <label className="block mb-2"><input type="checkbox" checked={formDivida.pago} onChange={e => setFormDivida({ ...formDivida, pago: e.target.checked })} /> Já foi pago?</label>
          <button className="bg-green-600 text-white w-full p-2 rounded" onClick={handleAddDivida}>Adicionar Dívida</button>

          <table className="w-full mt-4 text-center border">
            <thead className="bg-green-200">
              <tr>
                <th>Descrição</th><th>Valor</th><th>Parcelas</th><th>Vencimento</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dividas.map((d, i) => (
                <tr key={i} className={`${vencendoEm3Dias.includes(d) ? "bg-red-100" : ""}`}>
                  <td>{d.descricao}</td><td>R$ {d.valor}</td><td>{d.parcelas}x</td><td>{new Date(d.vencimento).toLocaleDateString()}</td><td>{d.pago ? "Pago" : "Pendente"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {abaAtual === "receber" && (
        <div className="max-w-md mx-auto">
          <input className="w-full p-2 mb-2 border rounded" placeholder="Nome da Pessoa" value={formReceber.pessoa} onChange={e => setFormReceber({ ...formReceber, pessoa: e.target.value })} />
          <input className="w-full p-2 mb-2 border rounded" placeholder="Descrição da dívida" value={formReceber.descricao} onChange={e => setFormReceber({ ...formReceber, descricao: e.target.value })} />
          <input type="number" className="w-full p-2 mb-2 border rounded" placeholder="Valor" value={formReceber.valor} onChange={e => setFormReceber({ ...formReceber, valor: e.target.value })} />
          <select className="w-full p-2 mb-2 border rounded" value={formReceber.parcelas} onChange={e => setFormReceber({ ...formReceber, parcelas: e.target.value })}>
            {[...Array(12)].map((_, i) => (<option key={i + 1} value={i + 1}>{i + 1}x</option>))}
          </select>
          <input className="w-full p-2 mb-2 border rounded" placeholder="Categoria" value={formReceber.categoria} onChange={e => setFormReceber({ ...formReceber, categoria: e.target.value })} />
          <button className="bg-green-600 text-white w-full p-2 rounded" onClick={handleAddReceber}>Adicionar</button>

          <table className="w-full mt-4 text-center border">
            <thead className="bg-green-200">
              <tr><th>Pessoa</th><th>Descrição</th><th>Valor</th><th>Parcelas</th></tr>
            </thead>
            <tbody>
              {receber.map((r, i) => (
                <tr key={i}>
                  <td>{r.pessoa}</td><td>{r.descricao}</td><td>R$ {r.valor}</td><td>{r.parcelas}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {abaAtual === "historico" && (
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-2">Resumo</h2>
          <p>Salário: R$ {salario}</p>
          <p>Total Dívidas: R$ {dividas.reduce((acc, d) => acc + Number(d.valor), 0)}</p>
          <p>Total a Receber: R$ {receber.reduce((acc, r) => acc + Number(r.valor), 0)}</p>
          <p className="font-bold">Saldo Final: R$ {saldoFinal.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}
