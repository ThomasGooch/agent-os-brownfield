import React, { useState } from 'react';
import { createExpense, updateExpense, type Expense } from '../services/api-factory';
import './ExpenseForm.css';

interface ExpenseFormProps {
  expense?: Expense;
  onSave: (newExpense: Expense) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, onSave }) => {
  const [formData, setFormData] = useState({
    date: expense?.date || '',
    amount: expense?.amount || '',
    description: expense?.description || '',
    category: expense?.category || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Remove commas and other formatting from amount input
    const sanitizedValue = name === 'amount' ? value.replace(/,/g, '') : value;
    setFormData({ ...formData, [name]: sanitizedValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const expenseData = {
      date: formData.date,
      amount: Number(formData.amount),
      description: formData.description,
      category: formData.category,
    };
    let newExpense;
    if (expense) {
      newExpense = await updateExpense(expense.id, expenseData);
    } else {
      newExpense = await createExpense(expenseData);
    }
    onSave(newExpense);
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <div>
        <label>Date</label>
        <input type="date" name="date" value={formData.date} onChange={handleChange} />
      </div>
      <div>
        <label>Amount</label>
        <input 
          type="number" 
          name="amount" 
          value={formData.amount} 
          onChange={handleChange} 
          step="0.01"
          min="0"
          placeholder="0.00"
        />
      </div>
      <div>
        <label>Description</label>
        <input type="text" name="description" value={formData.description} onChange={handleChange} />
      </div>
      <div>
        <label>Category</label>
        <input type="text" name="category" value={formData.category} onChange={handleChange} />
      </div>
      <button type="submit">Save</button>
    </form>
  );
};

export default ExpenseForm;