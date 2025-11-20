using CashCaddy.API.Models;
using CashCaddy.API.Protos;
using Grpc.Core;

namespace CashCaddy.API.Services;

public class ExpenseGrpcService : ExpenseService.ExpenseServiceBase
{
    private readonly IExpenseRepository _repository;
    private readonly ILogger<ExpenseGrpcService> _logger;

    public ExpenseGrpcService(IExpenseRepository repository, ILogger<ExpenseGrpcService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public override async Task<GetExpensesResponse> GetExpenses(GetExpensesRequest request, ServerCallContext context)
    {
        try
        {
            _logger.LogInformation("GetExpenses RPC called");
            
            var expenses = await _repository.GetAllExpensesAsync();
            var response = new GetExpensesResponse();
            
            foreach (var expense in expenses)
            {
                response.Expenses.Add(MapToExpenseMessage(expense));
            }
            
            _logger.LogInformation("Returning {Count} expenses", response.Expenses.Count);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetExpenses");
            throw new RpcException(new Status(StatusCode.Internal, "An error occurred while fetching expenses"));
        }
    }

    public override async Task<ExpenseResponse> GetExpense(GetExpenseRequest request, ServerCallContext context)
    {
        try
        {
            _logger.LogInformation("GetExpense RPC called for ID: {Id}", request.Id);
            
            if (!Guid.TryParse(request.Id, out var id))
            {
                throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid expense ID format"));
            }

            var expense = await _repository.GetExpenseByIdAsync(id);
            
            if (expense == null)
            {
                throw new RpcException(new Status(StatusCode.NotFound, $"Expense with ID {request.Id} not found"));
            }

            return new ExpenseResponse
            {
                Expense = MapToExpenseMessage(expense)
            };
        }
        catch (RpcException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetExpense");
            throw new RpcException(new Status(StatusCode.Internal, "An error occurred while fetching the expense"));
        }
    }

    public override async Task<ExpenseResponse> CreateExpense(CreateExpenseRequest request, ServerCallContext context)
    {
        try
        {
            _logger.LogInformation("CreateExpense RPC called");
            
            if (string.IsNullOrWhiteSpace(request.Description))
            {
                throw new RpcException(new Status(StatusCode.InvalidArgument, "Description is required"));
            }

            var expense = new Expense
            {
                Id = Guid.NewGuid(),
                Date = DateTime.Parse(request.Date),
                Amount = (decimal)request.Amount,
                Description = request.Description,
                Category = request.Category
            };

            await _repository.AddExpenseAsync(expense);
            
            _logger.LogInformation("Created expense with ID: {Id}", expense.Id);
            
            return new ExpenseResponse
            {
                Expense = MapToExpenseMessage(expense)
            };
        }
        catch (RpcException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in CreateExpense");
            throw new RpcException(new Status(StatusCode.Internal, "An error occurred while creating the expense"));
        }
    }

    public override async Task<ExpenseResponse> UpdateExpense(UpdateExpenseRequest request, ServerCallContext context)
    {
        try
        {
            _logger.LogInformation("UpdateExpense RPC called for ID: {Id}", request.Id);
            
            if (!Guid.TryParse(request.Id, out var id))
            {
                throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid expense ID format"));
            }

            var existing = await _repository.GetExpenseByIdAsync(id);
            if (existing == null)
            {
                throw new RpcException(new Status(StatusCode.NotFound, $"Expense with ID {request.Id} not found"));
            }

            var expense = new Expense
            {
                Id = id,
                Date = DateTime.Parse(request.Date),
                Amount = (decimal)request.Amount,
                Description = request.Description,
                Category = request.Category
            };

            await _repository.UpdateExpenseAsync(expense);
            
            _logger.LogInformation("Updated expense with ID: {Id}", expense.Id);
            
            return new ExpenseResponse
            {
                Expense = MapToExpenseMessage(expense)
            };
        }
        catch (RpcException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in UpdateExpense");
            throw new RpcException(new Status(StatusCode.Internal, "An error occurred while updating the expense"));
        }
    }

    public override async Task<DeleteExpenseResponse> DeleteExpense(DeleteExpenseRequest request, ServerCallContext context)
    {
        try
        {
            _logger.LogInformation("DeleteExpense RPC called for ID: {Id}", request.Id);
            
            if (!Guid.TryParse(request.Id, out var id))
            {
                throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid expense ID format"));
            }

            var existing = await _repository.GetExpenseByIdAsync(id);
            if (existing == null)
            {
                throw new RpcException(new Status(StatusCode.NotFound, $"Expense with ID {request.Id} not found"));
            }

            await _repository.DeleteExpenseAsync(id);
            
            _logger.LogInformation("Deleted expense with ID: {Id}", request.Id);
            
            return new DeleteExpenseResponse
            {
                Success = true,
                Message = "Expense deleted successfully"
            };
        }
        catch (RpcException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in DeleteExpense");
            throw new RpcException(new Status(StatusCode.Internal, "An error occurred while deleting the expense"));
        }
    }

    private ExpenseMessage MapToExpenseMessage(Expense expense)
    {
        return new ExpenseMessage
        {
            Id = expense.Id.ToString(),
            Date = expense.Date.ToString("yyyy-MM-dd"),
            Amount = (double)expense.Amount,
            Description = expense.Description ?? string.Empty,
            Category = expense.Category ?? string.Empty
        };
    }
}
