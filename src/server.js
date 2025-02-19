import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Função para validar os campos do funcionário
const validateEmployee = (employee) => {
  const { name, age, email, role, salary } = employee;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name || name.length < 3)
    return "O nome deve ter pelo menos 3 caracteres.";
  if (!email || !emailRegex.test(email)) return "E-mail inválido.";
  if (!age || age < 18) return "A idade deve ser maior ou igual a 18 anos.";
  if (!role || role.length < 3)
    return "O cargo deve ter pelo menos 3 caracteres.";
  if (salary == null || salary < 0) return "O salário não pode ser negativo.";

  return null;
};

// Criar um funcionário
app.post("/employees", async (req, res) => {
  try {
    const { name, age, email, role, salary } = req.body;

    // Validação dos dados
    const validationError = validateEmployee({
      name,
      age,
      email,
      role,
      salary,
    });
    if (validationError)
      return res.status(400).json({ error: validationError });

    const employee = await prisma.employee.create({
      data: { name, age: Number(age), email, role, salary: Number(salary) },
    });
    res.status(201).json(employee);
  } catch (error) {
    res
      .status(500)
      .json({ error: `Erro ao criar funcionário ${error.message}` });
  }
});

// Listar todos os funcionários
app.get("/employees", async (req, res) => {
  try {
    const employees = await prisma.employee.findMany();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar funcionários" });
  }
});

// Atualizar um funcionário
app.put("/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, email, role, salary } = req.body;

    // Validação dos dados
    const validationError = validateEmployee({
      name,
      age,
      email,
      role,
      salary,
    });
    if (validationError)
      return res.status(400).json({ error: validationError });

    const updatedEmployee = await prisma.employee.update({
      where: { id: Number(id) },
      data: { name, age: Number(age), email, role, salary: Number(salary) },
    });
    res.status(200).json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar funcionário" });
  }
});

// Remover um funcionário
app.delete("/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.employee.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar funcionário" });
  }
});

const PORT = 3001;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
