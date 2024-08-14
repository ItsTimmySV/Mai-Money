let transactions = [];
let editingId = null;
let monthlyChartInstance = null;
let yearlyChartInstance = null;

// DOM Elements
const transactionsView = document.getElementById('transactionsView');
const statsView = document.getElementById('statsView');
const showTransactionsBtn = document.getElementById('showTransactionsBtn');
const showStatsBtn = document.getElementById('showStatsBtn');
const addTransactionBtn = document.getElementById('addTransactionBtn');
const addTransactionModal = document.getElementById('addTransactionModal');
const editModal = document.getElementById('editModal');
const addTransactionForm = document.getElementById('addTransactionForm');
const editTransactionForm = document.getElementById('editTransactionForm');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// Event Listeners
showTransactionsBtn.addEventListener('click', showTransactions);
showStatsBtn.addEventListener('click', showStats);
addTransactionBtn.addEventListener('click', openAddTransactionModal);
cancelAddBtn.addEventListener('click', closeAddTransactionModal);
cancelEditBtn.addEventListener('click', closeEditModal);
addTransactionForm.addEventListener('submit', handleAddTransaction);
editTransactionForm.addEventListener('submit', handleEditTransaction);

// Load transactions from local storage
function loadTransactions() {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
    }
}

// Save transactions to local storage
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Handle adding a new transaction
function handleAddTransaction(e) {
    e.preventDefault();
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value || new Date().toISOString().split('T')[0];
    const type = document.getElementById('type').value;

    if (description && amount) {
        const transaction = {
            id: Date.now(),
            description,
            amount,
            date,
            type
        };

        transactions.push(transaction);
        saveTransactions();
        updateUI();
        closeAddTransactionModal();
    }
}

// Handle editing a transaction
function handleEditTransaction(e) {
    e.preventDefault();
    const description = document.getElementById('editDescription').value;
    const amount = parseFloat(document.getElementById('editAmount').value);
    const date = document.getElementById('editDate').value;
    const type = document.getElementById('editType').value;

    if (description && amount && date) {
        const index = transactions.findIndex(t => t.id === editingId);
        if (index !== -1) {
            transactions[index] = { ...transactions[index], description, amount, date, type };
            saveTransactions();
            updateUI();
            closeEditModal();
        }
    }
}

// Update UI with current transactions
function updateUI() {
    const transactionList = document.getElementById('transactions');
    const incomeTotal = document.getElementById('income-total');
    const expenseTotal = document.getElementById('expense-total');
    const total = document.getElementById('total');

    transactionList.innerHTML = '';
    let income = 0;
    let expense = 0;

    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    transactions.forEach(transaction => {
        const li = document.createElement('li');
        li.classList.add(transaction.type === 'income' ? 'income-item' : 'expense-item', 'transaction-item');
        li.innerHTML = `
            <div class="transaction-info">
                <strong>${transaction.description}</strong>
                <small>${formatDate(transaction.date)}</small>
            </div>
            <div class="transaction-details">
                <div class="transaction-amount">
                    <span class="amount ${transaction.type}">${transaction.type === 'income' ? '+' : '-'}$${Math.abs(transaction.amount).toFixed(2)}</span>
                </div>
                <div class="transaction-actions">
                    <button class="edit-btn" onclick="editTransaction(${transaction.id})">Editar</button>
                    <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">Eliminar</button>
                </div>
            </div>
        `;
        li.addEventListener('click', function() {
            const amount = this.querySelector('.transaction-amount');
            const actions = this.querySelector('.transaction-actions');

            if (actions.classList.contains('show')) {
                actions.classList.remove('show');
                amount.classList.remove('hidden');
            } else {
                actions.classList.add('show');
                amount.classList.add('hidden');
            }
        });
        transactionList.appendChild(li);

        if (transaction.type === 'income') {
            income += transaction.amount;
        } else {
            expense += transaction.amount;
        }
    });

    incomeTotal.textContent = `$${income.toFixed(2)}`;
    expenseTotal.textContent = `$${expense.toFixed(2)}`;
    total.textContent = `$${(income - expense).toFixed(2)}`;
}


// Delete a transaction
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    updateUI();
}

// Edit a transaction
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
        editingId = id;
        document.getElementById('editDescription').value = transaction.description;
        document.getElementById('editAmount').value = transaction.amount;
        document.getElementById('editDate').value = transaction.date;
        document.getElementById('editType').value = transaction.type;
        editModal.style.display = 'block';
    }
}

// Close the edit modal
function closeEditModal() {
    editModal.style.display = 'none';
    editingId = null;
}

// Open the add transaction modal
function openAddTransactionModal() {
    addTransactionModal.style.display = 'block';
    document.getElementById('date').valueAsDate = new Date();
}

// Close the add transaction modal
function closeAddTransactionModal() {
    addTransactionModal.style.display = 'none';
    clearForm();
}

// Show the transactions view
function showTransactions() {
    transactionsView.style.display = 'block';
    statsView.style.display = 'none';
    showTransactionsBtn.classList.add('active');
    showStatsBtn.classList.remove('active');
}

// Show the stats view
function showStats() {
    transactionsView.style.display = 'none';
    statsView.style.display = 'block';
    showStatsBtn.classList.add('active');
    showTransactionsBtn.classList.remove('active');
    updateCharts();
}

// Update the charts with monthly and yearly data
function updateCharts() {
    const monthlyData = getMonthlyData();
    const yearlyData = getYearlyData();

    createChart('monthlyChart', 'Ingresos y Gastos por Mes', monthlyData, 'monthly');
    createChart('yearlyChart', 'Ingresos y Gastos por Año', yearlyData, 'yearly');
}

// Get monthly data for the charts
function getMonthlyData() {
    const data = {};
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        if (!data[monthYear]) {
            data[monthYear] = { income: 0, expense: 0 };
        }
        if (transaction.type === 'income') {
            data[monthYear].income += transaction.amount;
        } else {
            data[monthYear].expense += transaction.amount;
        }
    });

    return Object.entries(data)
        .sort(([a], [b]) => new Date(b.split(' ')[1], monthNames.indexOf(b.split(' ')[0])) - new Date(a.split(' ')[1], monthNames.indexOf(a.split(' ')[0])))
        .slice(-12);  // Últimos 12 meses
}



// Get yearly data for the charts
function getYearlyData() {
    const data = {};
    transactions.forEach(transaction => {
        const year = new Date(transaction.date).getFullYear();
        if (!data[year]) {
            data[year] = { income: 0, expense: 0 };
        }
        if (transaction.type === 'income') {
            data[year].income += transaction.amount;
        } else {
            data[year].expense += transaction.amount;
        }
    });
    return Object.entries(data)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-5);  // Últimos 5 años
}

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
// Create a chart
function createChart(canvasId, title, data, chartType) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    // Destroy the existing chart if it exists
    if (chartType === 'monthly' && monthlyChartInstance) {
        monthlyChartInstance.destroy();
    }
    if (chartType === 'yearly' && yearlyChartInstance) {
        yearlyChartInstance.destroy();
    }

    // Format labels for monthly chart
    const labels = data.map(([label]) => {
        if (chartType === 'monthly') {
            const [year, month] = label.split(' ');
            return `${month} ${year}`;
        }
        return label;
    });

    // Create a new chart
    const chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Ingresos',
                    data: data.map(([_, values]) => values.income),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Gastos',
                    data: data.map(([_, values]) => values.expense),
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: title
                }
            }
        }
    });

    // Save the chart instance
    if (chartType === 'monthly') {
        monthlyChartInstance = chartInstance;
    }
    if (chartType === 'yearly') {
        yearlyChartInstance = chartInstance;
    }
}




// Clear the form inputs
function clearForm() {
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('date').valueAsDate = new Date();
    document.getElementById('type').value = 'income';
}


// Format date to a more readable format with full date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}


// Get month name
function getMonthName(monthIndex) {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[monthIndex];
}

// Initialize the application
loadTransactions();
updateUI();
showTransactions();
