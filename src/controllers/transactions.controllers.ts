import { TransactionService } from "@services/transactions.services";
import { ApiError } from "@utils/apierror";
import { ApiResponse } from "@utils/apiresponse";
import { asyncHandler } from "@utils/asynchandler";
import { Context } from "hono";

export class TransactionController {
    private service: TransactionService;

    constructor(transactionService: TransactionService) {
        this.service = transactionService;
    }

    getUserTransactions = asyncHandler(async (c: Context) => {
        const user = c.get('user');

        if (!user) {
            throw new ApiError(404, 'User does not exists');
        }

        const transactions = this.service.getTransactionsByUserId(user.id);

        return c.json(new ApiResponse(201, transactions, `Transactions of user ${user.username}`));
    });

    getTransaction = asyncHandler(async (c: Context) => {
        const id = c.req.param('id');

        if (!id) {
            throw new ApiError(401, 'Transaction id did not found');
        }

        const transaction = await this.service.getTransactionById(id);

        return c.json(new ApiResponse(201, transaction, `Transaction of user`));
    });
}