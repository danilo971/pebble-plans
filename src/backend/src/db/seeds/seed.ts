import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import * as schema from "../schema.js";
import { logger } from "../../config/logger.js";
import { eq } from "drizzle-orm";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

const DEMO_PASSWORD = "Demo@12345";

async function seed(): Promise<void> {
  logger.info("Iniciando seed de dados de demonstração...");

  // Create demo user
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const [user] = await db
    .insert(schema.users)
    .values({
      name: "Marcus Silva",
      email: "marcus@cifra.app",
      passwordHash,
      avatarInitials: "MS",
      emailVerified: true,
    })
    .returning();

  if (!user) {
    logger.error("Falha ao criar usuário demo.");
    await pool.end();
    process.exit(1);
  }

  logger.info(`Usuário demo criado: ${user.id} (${user.email})`);

  // Create categories
  const categories = [
    { name: "Mercado", icon: "ShoppingBag", limit: "1200", spent: "812" },
    { name: "Alimentação", icon: "Utensils", limit: "800", spent: "640" },
    { name: "Transporte", icon: "Car", limit: "500", spent: "380" },
    { name: "Moradia", icon: "Home", limit: "2400", spent: "2400" },
    { name: "Streaming", icon: "Film", limit: "150", spent: "89" },
    { name: "Saúde", icon: "Heart", limit: "400", spent: "120" },
    { name: "Viagem", icon: "Plane", limit: "1000", spent: "0" },
    { name: "Energia", icon: "Zap", limit: "300", spent: "210" },
    { name: "Internet", icon: "Wifi", limit: "120", spent: "120" },
    { name: "Educação", icon: "GraduationCap", limit: "300", spent: "199" },
    { name: "Presentes", icon: "Gift", limit: "200", spent: "0" },
    { name: "Investimentos", icon: "TrendingUp", limit: "2000", spent: "1500" },
    { name: "Pet", icon: "Dog", limit: "250", spent: "145" },
  ];

  for (const cat of categories) {
    await db.insert(schema.categories).values({
      userId: user.id,
      name: cat.name,
      icon: cat.icon,
      spent: cat.spent,
      limit: cat.limit,
    });
  }
  logger.info(`${categories.length} categorias criadas.`);

  // Create accounts
  const accountsData = [
    { name: "Itaú Pessoal", kind: "Conta corrente", balance: "24560.40" },
    { name: "Nubank", kind: "Conta digital", balance: "4820.15" },
    { name: "XP Investimentos", kind: "Investimentos", balance: "88450.00" },
    { name: "Inter", kind: "Conta digital", balance: "1210.25" },
  ];

  for (const acc of accountsData) {
    await db.insert(schema.accounts).values({
      userId: user.id,
      name: acc.name,
      kind: acc.kind,
      balance: acc.balance,
    });
  }
  logger.info(`${accountsData.length} contas criadas.`);

  // Create cards
  const cardsData = [
    { name: "Nubank Ultravioleta", brand: "Mastercard", last4: "4021", limit: "15000", used: "4820", dueDay: 12, color: "from-violet-600/40 via-fuchsia-500/20 to-transparent" },
    { name: "XP Visa Infinite", brand: "Visa", last4: "8804", limit: "25000", used: "12340", dueDay: 22, color: "from-slate-500/40 via-slate-400/20 to-transparent" },
    { name: "Itaú Personnalité", brand: "Visa", last4: "1177", limit: "20000", used: "6210", dueDay: 5, color: "from-orange-600/40 via-amber-500/20 to-transparent" },
  ];

  for (const card of cardsData) {
    await db.insert(schema.cards).values({
      userId: user.id,
      ...card,
    });
  }
  logger.info(`${cardsData.length} cartões criados.`);

  // Create goals
  const goalsData = [
    { title: "Viagem Japão", saved: "8500", target: "18000" },
    { title: "Reserva Emergência", saved: "15000", target: "20000" },
    { title: "MacBook Pro", saved: "4200", target: "14000" },
  ];

  for (const goal of goalsData) {
    await db.insert(schema.goals).values({
      userId: user.id,
      ...goal,
    });
  }
  logger.info(`${goalsData.length} metas criadas.`);

  // Create transactions
  const transactions = [
    { merchant: "Pão de Açúcar", category: "Mercado", kind: "expense", amount: "412.50", date: new Date("2026-03-20T14:45:00"), account: "Nubank" },
    { merchant: "iFood", category: "Alimentação", kind: "expense", amount: "84.20", date: new Date("2026-03-20T12:30:00"), account: "Inter" },
    { merchant: "Netflix Premium", category: "Streaming", kind: "expense", amount: "55.90", date: new Date("2026-03-19"), account: "Cartão XP" },
    { merchant: "Projeto Freelance", category: "Investimentos", kind: "income", amount: "2800.00", date: new Date("2026-03-12"), account: "Itaú Pessoal" },
    { merchant: "Posto Ipiranga", category: "Transporte", kind: "expense", amount: "210.00", date: new Date("2026-03-11"), account: "Nubank" },
    { merchant: "Aluguel", category: "Moradia", kind: "expense", amount: "2400.00", date: new Date("2026-03-10"), account: "Itaú" },
    { merchant: "Salário", category: "Investimentos", kind: "income", amount: "9600.00", date: new Date("2026-03-05"), account: "Itaú Pessoal" },
    { merchant: "Uber", category: "Transporte", kind: "expense", amount: "35.50", date: new Date("2026-02-28"), account: "Nubank" },
    { merchant: "Spotify", category: "Streaming", kind: "expense", amount: "22.90", date: new Date("2026-02-25"), account: "Cartão XP" },
    { merchant: "Freelance Design", category: "Investimentos", kind: "income", amount: "3200.00", date: new Date("2026-02-20"), account: "Itaú Pessoal" },
    { merchant: "Academia", category: "Saúde", kind: "expense", amount: "120.00", date: new Date("2026-02-15"), account: "Nubank" },
    { merchant: "Supermercado", category: "Mercado", kind: "expense", amount: "580.00", date: new Date("2026-02-10"), account: "Itaú" },
    { merchant: "Salário", category: "Investimentos", kind: "income", amount: "9600.00", date: new Date("2026-02-05"), account: "Itaú Pessoal" },
    { merchant: "Netflix Premium", category: "Streaming", kind: "expense", amount: "55.90", date: new Date("2026-01-25"), account: "Cartão XP" },
    { merchant: "Restaurante", category: "Alimentação", kind: "expense", amount: "145.00", date: new Date("2026-01-20"), account: "Inter" },
    { merchant: "Freelance App", category: "Investimentos", kind: "income", amount: "4500.00", date: new Date("2026-01-15"), account: "Itaú Pessoal" },
    { merchant: "Salário", category: "Investimentos", kind: "income", amount: "9600.00", date: new Date("2026-01-05"), account: "Itaú Pessoal" },
    { merchant: "Plano de Saúde", category: "Saúde", kind: "expense", amount: "450.00", date: new Date("2026-01-03"), account: "Itaú" },
  ];

  for (const tx of transactions) {
    await db.insert(schema.transactions).values({
      userId: user.id,
      ...tx,
    });
  }
  logger.info(`${transactions.length} transações criadas.`);

  logger.info("Seed concluído com sucesso!");
  logger.info(`Usuário demo: marcus@cifra.app / ${DEMO_PASSWORD}`);
  await pool.end();
}

seed().catch((err) => {
  logger.fatal(err, "Erro durante o seed.");
  process.exit(1);
});
