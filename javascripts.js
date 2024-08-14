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
    const dateInput = document.getElementById('date').value;
    const type = document.getElementById('type').value;

    // Create a date object in the local timezone
    const date = new Date(dateInput + 'T00:00:00');

    if (description && !isNaN(amount)) {
        const transaction = {
            id: Date.now(),
            description,
            amount,
            date: date.toISOString(),  // Store date as ISO string
            type
        };

        transactions.push(transaction);
        saveTransactions();
        updateUI();
        closeAddTransactionModal();
        showTransactions();  // Asegúrate de mostrar la vista de transacciones después de añadir una
        
   
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
    const balanceElement = document.getElementById('total');

    if (!transactionList) {
        console.error('Element with id "transactions" not found');
        return;
    }

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
                    <span class="amount ${transaction.type}">${transaction.type === 'income' ? '+' : '-'}$${Math.abs(parseFloat(transaction.amount)).toFixed(2)}</span>
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
            income += parseFloat(transaction.amount);
        } else {
            expense += parseFloat(transaction.amount);
        }
    });

    const balance = income - expense;

    if (incomeTotal) incomeTotal.textContent = `$${income.toFixed(2)}`;
    if (expenseTotal) expenseTotal.textContent = `$${expense.toFixed(2)}`;
    if (balanceElement) balanceElement.textContent = `$${balance.toFixed(2)}`;


}

// Initialize the application
function initApp() {
    loadTransactions();
    updateUI();
    showTransactions();
}

// Call initApp when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);


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

    // Get today's date in the format 'yyyy-mm-dd'
    const today = new Date().toLocaleDateString('en-CA'); // Formato 'yyyy-mm-dd'
    document.getElementById('date').value = today;
}



// Close the add transaction modal
function closeAddTransactionModal() {
    addTransactionModal.style.display = 'none';
    clearForm();
}

// Show transactions view
function showTransactions() {
    const transactionsView = document.getElementById('transactionsView');
    const statsView = document.getElementById('statsView');
    if (transactionsView && statsView) {
        transactionsView.style.display = 'block';
        statsView.style.display = 'none';
    }
    updateUI();
}

// Show the stats view
function showStats() {
    const transactionsView = document.getElementById('transactionsView');
    const statsView = document.getElementById('statsView');
    const showStatsBtn = document.getElementById('showStatsBtn');
    const showTransactionsBtn = document.getElementById('showTransactionsBtn');

    // Ocultar la vista de transacciones y mostrar la de estadísticas
    transactionsView.style.display = 'none';
    statsView.style.display = 'block';

    // Cambiar la clase active entre los botones
    showStatsBtn.classList.add('active');
    showTransactionsBtn.classList.remove('active');

    // Limpiar los gráficos existentes
    if (monthlyChartInstance) {
        monthlyChartInstance.destroy();
        monthlyChartInstance = null;
    }
    if (yearlyChartInstance) {
        yearlyChartInstance.destroy();
        yearlyChartInstance = null;
    }

    // Mostrar animación de carga
    const monthlyChartContainer = document.getElementById('monthlyChart').parentNode;
    const yearlyChartContainer = document.getElementById('yearlyChart').parentNode;
    monthlyChartContainer.innerHTML = '<div class="loading-animation">Cargando gráfico mensual...</div>';
    yearlyChartContainer.innerHTML = '<div class="loading-animation">Cargando gráfico anual...</div>';

    // Simular un retraso para la animación (puedes ajustar este tiempo)
    setTimeout(() => {
        // Recrear los canvas para los gráficos
        monthlyChartContainer.innerHTML = '<canvas id="monthlyChart"></canvas>';
        yearlyChartContainer.innerHTML = '<canvas id="yearlyChart"></canvas>';

        // Volver a crear los gráficos
        createChart('monthlyChart', 'Ingresos y Gastos por Mes', getMonthlyData(), 'monthly');
        createChart('yearlyChart', 'Ingresos y Gastos por Año', getYearlyData(), 'yearly');
    }, 1000); // 1 segundo de retraso, ajusta según sea necesario
}

// Función para actualizar los gráficos
function updateCharts() {
    const isDarkMode = document.body.classList.contains('dark-mode');

    if (monthlyChartInstance) {
        updateChartColors(monthlyChartInstance, isDarkMode);
    } else {
        createChart('monthlyChart', 'Ingresos y Gastos por Mes', getMonthlyData(), 'monthly');
    }

    if (yearlyChartInstance) {
        updateChartColors(yearlyChartInstance, isDarkMode);
    } else {
        createChart('yearlyChart', 'Ingresos y Gastos por Año', getYearlyData(), 'yearly');
    }
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
        .sort(([a], [b]) => {
            const [monthA, yearA] = a.split(' ');
            const [monthB, yearB] = b.split(' ');
            return new Date(yearB, monthNames.indexOf(monthB)) - new Date(yearA, monthNames.indexOf(monthA));
        })
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

// Aplicar el modo oscuro si estaba activo anteriormente
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
// Create a chart
// Modificar la función createChart para incluir la lógica de colores
function createChart(canvasId, title, data, chartType) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const isDarkMode = document.body.classList.contains('dark-mode');

    // Formatear etiquetas para el gráfico mensual
    const labels = data.map(([label]) => {
        if (chartType === 'monthly') {
            const [month] = label.split(' ');
            return month;  // Solo retorna el mes
        }
        return label;
    });

    const chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Ingresos',
                    data: data.map(([_, values]) => values.income),
                    backgroundColor: isDarkMode ? 'rgba(102, 187, 106, 0.6)' : 'rgba(75, 192, 192, 0.6)',
                    borderColor: isDarkMode ? 'rgba(102, 187, 106, 1)' : 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Gastos',
                    data: data.map(([_, values]) => values.expense),
                    backgroundColor: isDarkMode ? 'rgba(255, 82, 82, 0.6)' : 'rgba(255, 99, 132, 0.6)',
                    borderColor: isDarkMode ? 'rgba(255, 82, 82, 1)' : 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    },
                    ticks: {
                        color: isDarkMode ? '#fff' : '#666',
                    },
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    },
                    ticks: {
                        color: isDarkMode ? '#fff' : '#666',
                    },
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: title,
                    color: isDarkMode ? '#fff' : '#333'
                },
                legend: {
                    labels: {
                        color: isDarkMode ? '#fff' : '#666'
                    }
                }
            }
        }
    });

    // Guardar la instancia del gráfico
    if (chartType === 'monthly') {
        monthlyChartInstance = chartInstance;
    } else if (chartType === 'yearly') {
        yearlyChartInstance = chartInstance;
    }

    return chartInstance;
}






// Clear the form inputs
function clearForm() {
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('date').valueAsDate = new Date();
    document.getElementById('type').value = 'income';
}


// Format date to a more readable format with full date, using the local format of El Salvador
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/El_Salvador' };
    return new Date(dateString).toLocaleDateString('es-SV', options);
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

document.addEventListener('DOMContentLoaded', function() {
    const showTransactionsBtn = document.getElementById('showTransactionsBtn');
    const showStatsBtn = document.getElementById('showStatsBtn');
    const transactionsView = document.getElementById('transactionsView');
    const statsView = document.getElementById('statsView');

    showTransactionsBtn.addEventListener('click', function() {
        // Mostrar la vista de transacciones y ocultar la de estadísticas
        transactionsView.style.display = 'block';
        statsView.style.display = 'none';

        // Cambiar la clase active entre los botones
        showTransactionsBtn.classList.add('active');
        showStatsBtn.classList.remove('active');
    });

    showStatsBtn.addEventListener('click', function() {
        // Mostrar la vista de estadísticas y ocultar la de transacciones
        transactionsView.style.display = 'none';
        statsView.style.display = 'block';

        // Cambiar la clase active entre los botones
        showStatsBtn.classList.add('active');
        showTransactionsBtn.classList.remove('active');
    });
});


// Función para cambiar entre modos claro y oscuro
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    
    // Guardar la preferencia del usuario
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    // Actualizar los gráficos
    updateCharts();
}


// Evento para el botón de cambio de modo
document.getElementById('modeToggle').addEventListener('click', toggleDarkMode);

// Aplicar el modo oscuro si estaba activo anteriormente
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

// Llamar a updateCharts después de que la página se haya cargado completamente
document.addEventListener('DOMContentLoaded', () => {
    updateCharts();
});

// Función para actualizar los colores de los gráficos
function updateChartColors(chart, isDarkMode) {
    chart.options.scales.x.grid.color = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    chart.options.scales.y.grid.color = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    chart.options.scales.x.ticks.color = isDarkMode ? '#fff' : '#666';
    chart.options.scales.y.ticks.color = isDarkMode ? '#fff' : '#666';
    
    chart.data.datasets.forEach((dataset, i) => {
        if (i === 0) { // Ingresos
            dataset.backgroundColor = isDarkMode ? 'rgba(102, 187, 106, 0.6)' : 'rgba(75, 192, 192, 0.6)';
            dataset.borderColor = isDarkMode ? 'rgba(102, 187, 106, 1)' : 'rgba(75, 192, 192, 1)';
        } else { // Gastos
            dataset.backgroundColor = isDarkMode ? 'rgba(255, 82, 82, 0.6)' : 'rgba(255, 99, 132, 0.6)';
            dataset.borderColor = isDarkMode ? 'rgba(255, 82, 82, 1)' : 'rgba(255, 99, 132, 1)';
        }
    });
    
    chart.options.plugins.title.color = isDarkMode ? '#fff' : '#333';
    chart.options.plugins.legend.labels.color = isDarkMode ? '#fff' : '#666';
    
    chart.update();
}
