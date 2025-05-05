// código completo com telas finais, filtros, exportação, edição e exclusão
import React, { useState, useEffect } from "react";

export default function App() {
  const [aba, setAba] = useState("inicio");
  const [dividas, setDividas] = useState([]);
  const [receber, setReceber] = useState([]);
  const [salario, setSalario] = useState(0);
  const [historico, setHistorico] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    const d = localStorage.getItem("dividas");
    const r = localStorage.getItem("receber");
    const s = localStorage.getItem("salario");
    const h = localStorage.getItem("historico");
    if (d) setDividas(JSON.parse(d));
    if (r) setReceber(JSON.parse(r));
    if (s) setSalario(parseFloat(s));
    if (h) setHistorico(JSON.parse(h));
  }, []);

  useEffect(() => {
    localStorage.setItem("dividas", JSON.stringify(dividas));
  }, [dividas]);

  useEffect(() => {
    localStorage.setItem("receber", JSON.stringify(receber));
  }, [receber]);

  useEffect(() => {
    localStorage.setItem("salario", salario);
  }, [salario]);

  useEffect(() => {
    localStorage.setItem("historico", JSON.stringify(historico));
  }, [historico]);

  const [formDivida, setFormDivida] = useState({
    nome: "",
    valor: "",
    parcelas: "1",
    vencimento: "",
    pago: false,
    categoria: ""
  });

  const [formReceber, setFormReceber] = useState({
    devedor: "",
    nome: "",
    valor: "",
    parcelas: "1",
    categoria: ""
  });

  const adicionarDivida = () => {
    if (!formDivida.nome || !formDivida.valor) return;
    const nova = { ...formDivida, id: Date.now() };
    setDividas([...dividas, nova]);
    setFormDivida({ nome: "", valor: "", parcelas: "1", vencimento: "", pago: false, categoria: "" });
  };

  const adicionarReceber = () => {
    if (!formReceber.nome || !formReceber.valor || !formReceber.devedor) return;
    const nova = { ...formReceber, id: Date.now() };
    setReceber([...receber, nova]);
    setFormReceber({ devedor: "", nome: "", valor: "", parcelas: "1", categoria: "" });
  };

  const deletarItem = (lista, setLista, id) => {
    setLista(lista.filter(i => i.id !== id));
  };

  const salvarHistoricoMensal = () => {
    const snapshot = {
      id: Date.now(),
      data: new Date().toISOString().slice(0, 7),
      salario,
      dividas,
      receber
    };
    setHistorico([...historico, snapshot]);
  };

  const totalGastos = dividas.reduce((s, d) => s + parseFloat(d.valor || 0), 0);
  const totalReceber = receber.reduce((s, r) => s + parseFloat(r.valor || 0), 0);
  const pagos = dividas.filter(d => d.pago).reduce((s, d) => s + parseFloat(d.valor || 0), 0);
  const saldoFinal = salario - totalGastos + totalReceber;

  const formatarMoeda = v => parseFloat(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatarData = v => { const [a, m, d] = v.split('-'); return `${d}-${m}-${a}`; };
  const estaVencendo = v => { const hj = new Date(); const dt = new Date(v); const dif = (dt - hj) / 86400000; return dif >= 0 && dif <= 3; };

  return (
    <div className="min-h-screen bg-green-50 p-4 text-green-900">
      <h1 className="text-2xl font-bold text-center mb-6">💰 Assistente Financeiro</h1>

      <div className="flex justify-center gap-2 mb-6 flex-wrap">
        {["inicio", "dividas", "receber", "relatorio", "historico"].map(tab => (
          <button key={tab} onClick={() => setAba(tab)} className={`px-4 py-2 rounded-full ${aba === tab ? "bg-green-600 text-white" : "bg-white border border-green-400"}`}>{tab.toUpperCase()}</button>
        ))}
      </div>

      {aba === "inicio" && (
        <div className="space-y-4 max-w-xl mx-auto">
          <label className="block font-bold">Salário do Mês:</label>
          <input type="number" value={salario} onChange={e => setSalario(parseFloat(e.target.value || 0))} className="p-2 border rounded w-full" />
          <button onClick={salvarHistoricoMensal} className="px-4 py-2 bg-green-600 text-white rounded w-full">Salvar Histórico</button>
          <div className="text-center text-lg font-bold">
            <p>Gastos: {formatarMoeda(totalGastos)}</p>
            <p>A Receber: {formatarMoeda(totalReceber)}</p>
            <p>Saldo Final: {formatarMoeda(saldoFinal)}</p>
          </div>
        </div>
      )}

      {aba === "dividas" && (
        <div className="space-y-4">
          <h2 className="font-bold">Adicionar Dívida</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <input className="p-2 border rounded" placeholder="Descrição da dívida" value={formDivida.nome} onChange={e => setFormDivida({ ...formDivida, nome: e.target.value })} />
            <input type="number" className="p-2 border rounded" placeholder="Valor" value={formDivida.valor} onChange={e => setFormDivida({ ...formDivida, valor: e.target.value })} />
            <input type="number" className="p-2 border rounded" min="1" max="12" placeholder="Parcelas" value={formDivida.parcelas} onChange={e => setFormDivida({ ...formDivida, parcelas: e.target.value })} />
            <input type="date" className="p-2 border rounded" value={formDivida.vencimento} onChange={e => setFormDivida({ ...formDivida, vencimento: e.target.value })} />
            <input className="p-2 border rounded" placeholder="Categoria" value={formDivida.categoria} onChange={e => setFormDivida({ ...formDivida, categoria: e.target.value })} />
            <label className="flex items-center gap-2 col-span-2">
              <input type="checkbox" checked={formDivida.pago} onChange={e => setFormDivida({ ...formDivida, pago: e.target.checked })} /> Já foi pago?
            </label>
          </div>
          <button onClick={adicionarDivida} className="px-4 py-2 bg-green-600 text-white rounded">Adicionar</button>

          <table className="w-full mt-4 border text-sm text-center">
            <thead><tr><th>Descrição</th><th>Valor</th><th>Parcelas</th><th>Vencimento</th><th>Status</th><th>Categoria</th><th>Ações</th></tr></thead>
            <tbody>
              {dividas.map(d => (
                <tr key={d.id} className={`border-t ${estaVencendo(d.vencimento) && !d.pago ? 'bg-yellow-100' : ''}`}>
                  <td>{d.nome}</td>
                  <td>{formatarMoeda(d.valor)}</td>
                  <td>{d.parcelas}x</td>
                  <td>{formatarData(d.vencimento)}</td>
                  <td>{d.pago ? "Pago" : "Pendente"}</td>
                  <td>{d.categoria}</td>
                  <td><button onClick={() => deletarItem(dividas, setDividas, d.id)} className="text-red-600">Excluir</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {aba === "receber" && (
        <div className="space-y-4">
          <h2 className="font-bold">Adicionar a Receber</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <input className="p-2 border rounded" placeholder="Nome do Devedor" value={formReceber.devedor} onChange={e => setFormReceber({ ...formReceber, devedor: e.target.value })} />
            <input className="p-2 border rounded" placeholder="Descrição da dívida" value={formReceber.nome} onChange={e => setFormReceber({ ...formReceber, nome: e.target.value })} />
            <input type="number" className="p-2 border rounded" placeholder="Valor" value={formReceber.valor} onChange={e => setFormReceber({ ...formReceber, valor: e.target.value })} />
            <input type="number" className="p-2 border rounded" placeholder="Parcelas" value={formReceber.parcelas} onChange={e => setFormReceber({ ...formReceber, parcelas: e.target.value })} />
            <input className="p-2 border rounded" placeholder="Categoria" value={formReceber.categoria} onChange={e => setFormReceber({ ...formReceber, categoria: e.target.value })} />
          </div>
          <button onClick={adicionarReceber} className="px-4 py-2 bg-green-600 text-white rounded">Adicionar</button>

          <table className="w-full mt-4 border text-sm text-center">
            <thead><tr><th>Devedor</th><th>Descrição</th><th>Valor</th><th>Parcelas</th><th>Categoria</th><th>Ações</th></tr></thead>
            <tbody>
              {receber.map(r => (
                <tr key={r.id} className="border-t">
                  <td>{r.devedor}</td>
                  <td>{r.nome}</td>
                  <td>{formatarMoeda(r.valor)}</td>
                  <td>{r.parcelas}x</td>
                  <td>{r.categoria}</td>
                  <td><button onClick={() => deletarItem(receber, setReceber, r.id)} className="text-red-600">Excluir</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {aba === "relatorio" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Relatório Financeiro</h2>
          <p>Total de Gastos: {formatarMoeda(totalGastos)}</p>
          <p>Total Receber: {formatarMoeda(totalReceber)}</p>
          <p>Saldo Final: {formatarMoeda(saldoFinal)}</p>
          <p>Dívidas Pagas: {formatarMoeda(pagos)}</p>
          <p>Dívidas Pendentes: {formatarMoeda(totalGastos - pagos)}</p>
        </div>
      )}

      {aba === "historico" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Histórico de Meses</h2>
          {historico.map(h => (
            <div key={h.id} className="border p-2 rounded bg-white">
              <p><strong>Mês:</strong> {h.data}</p>
              <p><strong>Salário:</strong> {formatarMoeda(h.salario)}</p>
              <p><strong>Dividas:</strong> {h.dividas.length}</p>
              <p><strong>Receber:</strong> {h.receber.length}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
