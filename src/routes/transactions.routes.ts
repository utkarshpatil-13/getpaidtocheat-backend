import { Hono } from "hono";
import { TransactionRepository } from "../repositories/transactions.repositories";
import { PrismaClient } from "@prisma/client";
import { TransactionService } from "@services/transactions.services";
import { TransactionController } from "@controllers/transactions.controllers";
import { verifyUser } from "@controllers/auth.controllers";

const router = new Hono();

const prisma = new PrismaClient();
const transactionRespository = new TransactionRepository(prisma);
const transactionService = new TransactionService(transactionRespository);
const transactionController = new TransactionController(transactionService);

router.get('/:id', verifyUser, transactionController.getTransaction);
router.get('/', verifyUser, transactionController.getUserTransactions);

export default router;