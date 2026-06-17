import { useEffect, useState } from "react";

type Order = {
  id: string;
  customerName: string;
  items: string[];
  priority: "STANDARD" | "FAST_TRACK";
  status: "CREATED" | "PREPARING" | "READY";
  createdAt: string;
};

type KitchenTicket = {
  orderId: string;
  customerName: string;
  items: string[];
  priority: "STANDARD" | "FAST_TRACK";
  status: "CREATED" | "PREPARING" | "READY";
  createdAt: string;
};

const orderServiceUrl = import.meta.env.VITE_ORDER_SERVICE_URL ?? "http://localhost:3001";
const kitchenServiceUrl = import.meta.env.VITE_KITCHEN_SERVICE_URL ?? "http://localhost:3002";

export function App() {
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState("Cafe, Pao de queijo");
  const [orders, setOrders] = useState<Order[]>([]);
  const [kitchenQueue, setKitchenQueue] = useState<KitchenTicket[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDashboard() {
    const [ordersResponse, kitchenResponse] = await Promise.all([
      fetch(`${orderServiceUrl}/orders`),
      fetch(`${kitchenServiceUrl}/kitchen/tickets`)
    ]);

    setOrders(await ordersResponse.json());
    setKitchenQueue(await kitchenResponse.json());
  }

  useEffect(() => {
    void loadDashboard();
    const intervalId = window.setInterval(() => {
      void loadDashboard();
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, []);

  async function handleCreateOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const response = await fetch(`${orderServiceUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        customerName,
        items: items.split(",").map((item) => item.trim()).filter(Boolean)
      })
    });

    if (!response.ok) {
      const data = await response.json();
      setErrorMessage(data.message ?? "Nao foi possivel criar o pedido.");
      return;
    }

    setCustomerName("");
    setItems("Cafe, Pao de queijo");
    await loadDashboard();
  }

  async function advanceOrderStatus(orderId: string) {
    await fetch(`${orderServiceUrl}/orders/${orderId}/status`, {
      method: "PATCH"
    });

    await loadDashboard();
  }

  return (
    <main className="min-h-screen bg-mist px-4 py-8 font-body text-ink md:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(255,107,53,0.28),_transparent_35%),linear-gradient(135deg,_#224936,_#101418)] p-8 text-white shadow-panel md:p-12">
          <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm tracking-[0.2em] uppercase">
            Prova P2 • Engenharia de Software
          </p>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <h1 className="font-display text-4xl leading-tight md:text-6xl">
                Campus Order Hub
              </h1>
              <p className="mt-4 max-w-2xl text-base text-white/80 md:text-lg">
                Sistema ficticio para gerenciar pedidos da cantina universitaria com separacao em microservicos, arquitetura limpa e comunicacao entre dominios.
              </p>
            </div>
            <form className="rounded-[1.5rem] bg-white p-6 text-ink" onSubmit={handleCreateOrder}>
              <h2 className="font-display text-2xl">Novo pedido</h2>
              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.2em] text-pine">
                    Cliente
                  </span>
                  <input
                    className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none transition focus:border-ember"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Nome do aluno"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.2em] text-pine">
                    Itens
                  </span>
                  <input
                    className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none transition focus:border-ember"
                    value={items}
                    onChange={(event) => setItems(event.target.value)}
                    placeholder="Cafe, Pao de queijo"
                  />
                </label>
              </div>
              {errorMessage ? <p className="mt-3 text-sm text-red-600">{errorMessage}</p> : null}
              <button className="mt-5 w-full rounded-2xl bg-ember px-4 py-3 font-semibold text-white transition hover:translate-y-[-1px] hover:shadow-lg">
                Criar pedido
              </button>
            </form>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <DashboardPanel
            title="Pedidos registrados"
            subtitle="order-service"
            items={orders.map((order) => ({
              id: order.id,
              title: `${order.customerName} • ${order.priority}`,
              detail: `${order.items.join(", ")} • ${order.status}`,
              action: order.status === "READY"
                ? undefined
                : {
                    label: "Avancar status",
                    onClick: () => void advanceOrderStatus(order.id)
                  }
            }))}
          />
          <DashboardPanel
            title="Fila da cozinha"
            subtitle="kitchen-service"
            items={kitchenQueue.map((ticket) => ({
              id: ticket.orderId,
              title: `${ticket.customerName} • ${ticket.priority}`,
              detail: `${ticket.items.join(", ")} • ${new Date(ticket.createdAt).toLocaleTimeString("pt-BR")}`
            }))}
          />
        </section>
      </div>
    </main>
  );
}

type DashboardItem = {
  id: string;
  title: string;
  detail: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

function DashboardPanel(props: {
  title: string;
  subtitle: string;
  items: DashboardItem[];
}) {
  return (
    <article className="rounded-[2rem] bg-white p-6 shadow-panel">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pine">
            {props.subtitle}
          </p>
          <h2 className="mt-2 font-display text-3xl">{props.title}</h2>
        </div>
        <div className="rounded-full bg-sand px-4 py-2 text-sm font-semibold text-ink">
          {props.items.length} itens
        </div>
      </div>
      <div className="space-y-4">
        {props.items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-black/10 px-4 py-8 text-center text-black/60">
            Nenhum registro ainda.
          </p>
        ) : (
          props.items.map((item) => (
            <div key={item.id} className="rounded-[1.5rem] border border-black/10 bg-mist/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-black/65">{item.detail}</p>
                </div>
                {item.action ? (
                  <button
                    className="rounded-full bg-pine px-4 py-2 text-sm font-semibold text-white"
                    onClick={item.action.onClick}
                  >
                    {item.action.label}
                  </button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </article>
  );
}
