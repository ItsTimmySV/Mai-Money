let transactions = [];
let editingId = null;
let monthlyChartInstance = null;
let yearlyChartInstance = null;
let categoryChartInstance = null;
let categories = ['Comida', 'Transporte', 'Entretenimiento', 'Servicios', 'Otros'];
let calendarInstance = null;
let archivedMonths = {};
let isImporting = false; // Flag para evitar ejecuciones múltiples





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
document.getElementById('addCategoryForm').addEventListener('submit', addCategory);
showTransactionsBtn.addEventListener('click', showTransactions);
showStatsBtn.addEventListener('click', showStats);
addTransactionBtn.addEventListener('click', openAddTransactionModal);
cancelAddBtn.addEventListener('click', closeAddTransactionModal);
cancelEditBtn.addEventListener('click', closeEditModal);
addTransactionForm.addEventListener('submit', handleAddTransaction);
editTransactionForm.addEventListener('submit', handleEditTransaction);



// Funciones de carga y guardado
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
    const amount = parseFloat(document.getElementById('amount').value);
    const dateInput = document.getElementById('date').value;
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const comment = document.getElementById('comment').value;

    const date = new Date(dateInput + 'T00:00:00');

    if (!isNaN(amount) && category) {
        const transaction = {
            id: Date.now(),
            amount,
            date: date.toISOString(),
            type,
            category,
            comment
        };

        transactions.push(transaction);
        saveTransactions();
        updateUI();
        closeAddTransactionModal();
        showTransactions();
        clearForm();
    }
}


// Handle editing a transaction
function handleEditTransaction(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('editAmount').value);
    const dateInput = document.getElementById('editDate').value;
    const type = document.getElementById('editType').value;
    const category = document.getElementById('editCategory').value;
    const comment = document.getElementById('editComment').value;

    if (amount && dateInput && category) {
        const date = new Date(dateInput + 'T00:00:00'); // Asegúrate de que la fecha esté en formato UTC

        const index = transactions.findIndex(t => t.id === editingId);
        if (index !== -1) {
            transactions[index] = { 
                ...transactions[index], 
                amount, 
                date: date.toISOString(), // Asegúrate de que la fecha esté en formato UTC
                type, 
                category, 
                comment 
            };
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
                <strong>${transaction.category}</strong>
                <small>${formatDate(transaction.date)}${transaction.comment ? ' - ' + transaction.comment : ''}</small>
            </div>
            <div class="transaction-details">
                <div class="transaction-amount">
                    <span class="amount ${transaction.type}">${transaction.type === 'income' ? '+' : '-'}$${Math.abs(parseFloat(transaction.amount)).toFixed(2)}</span>
                </div>
                <div class="transaction-actions">
                    <button class="edit-btn" onclick="editTransaction(${transaction.id})">Editar</button>
                    <button class="delete-btn" onclick="deleteTransaction1(${transaction.id})">Eliminar</button>
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

// Asegurarse de que initApp llama a clearForm
function initApp() {
    loadTransactions();
    updateUI();
    showTransactions();
    clearForm(); // Esto establecerá la fecha de hoy en el formulario al cargar la aplicación
}

// Llamar a initApp cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', initApp);


// Delete a transaction
function deleteTransaction1(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    updateUI();
}

// Edit a transaction
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
        editingId = id;
        document.getElementById('editAmount').value = transaction.amount;
        document.getElementById('editDate').value = transaction.date.split('T')[0];
        document.getElementById('editType').value = transaction.type;
        document.getElementById('editCategory').value = transaction.category;
        document.getElementById('editComment').value = transaction.comment || '';
        document.getElementById('editModal').style.display = 'block';
    }
}
// Close the edit modal
function closeEditModal() {
    editModal.style.display = 'none';
    editingId = null;
}


// Asegurarse de que la fecha se establece correctamente al abrir el modal de agregar transacción
function openAddTransactionModal() {
    addTransactionModal.style.display = 'block';
    clearForm(); // Esto establecerá la fecha de hoy y limpiará los otros campos
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
    const calendarView = document.getElementById('calendarView');
    
    transactionsView.style.display = 'block';
    statsView.style.display = 'none';
    calendarView.style.display = 'none';
    
    document.getElementById('showTransactionsBtn').classList.add('active');
    document.getElementById('showStatsBtn').classList.remove('active');
    document.getElementById('showCalendarBtn').classList.remove('active');
    
    updateUI();
}

// Show the stats view
function showStats() {
    const transactionsView = document.getElementById('transactionsView');
    const statsView = document.getElementById('statsView');
    const calendarView = document.getElementById('calendarView');
    
    transactionsView.style.display = 'none';
    statsView.style.display = 'block';
    calendarView.style.display = 'none';
    
    document.getElementById('showTransactionsBtn').classList.remove('active');
    document.getElementById('showStatsBtn').classList.add('active');
    document.getElementById('showCalendarBtn').classList.remove('active');

        // Mostrar animación de carga
        const monthlyChartContainer = document.getElementById('monthlyChart').parentNode;
        const yearlyChartContainer = document.getElementById('yearlyChart').parentNode;
        const categoryChartContainer = document.getElementById('categoryChart').parentNode;
        
        monthlyChartContainer.innerHTML = '<div class="loading-animation">Cargando gráfico mensual...</div>';
        yearlyChartContainer.innerHTML = '<div class="loading-animation">Cargando gráfico anual...</div>';
        categoryChartContainer.innerHTML = '<div class="loading-animation">Cargando gráfico de categorías...</div>';
    
        // Simular un retraso para la animación (puedes ajustar este tiempo)
        setTimeout(() => {
            // Recrear los canvas para los gráficos
            monthlyChartContainer.innerHTML = '<canvas id="monthlyChart"></canvas>';
            yearlyChartContainer.innerHTML = '<canvas id="yearlyChart"></canvas>';
            categoryChartContainer.innerHTML = '<canvas id="categoryChart"></canvas>';
    
            // Volver a crear los gráficos
            createChart('monthlyChart', 'Ingresos y Gastos por Mes', getMonthlyData(), 'monthly');
            createChart('yearlyChart', 'Ingresos y Gastos por Año', getYearlyData(), 'yearly');
            createCategoryChart(); // Actualiza o crea el gráfico de categorías
        }, 10); // 1 segundo de retraso, ajusta según sea necesario
    
    
    // Actualizar todos los gráficos
    updateCharts();
}

// Crear o actualizar el gráfico de categorías
function createCategoryChart() {
    const ctx = document.getElementById('categoryChart')?.getContext('2d');
    if (!ctx) {
        console.error('El canvas para el gráfico de categoría no está disponible.');
        return;
    }
    const isDarkMode = document.body.classList.contains('dark-mode');

    const categoryData = categories.map(category => {
        return transactions
            .filter(transaction => transaction.category === category)
            .reduce((sum, transaction) => sum + transaction.amount, 0);
    });

    categoryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: categoryData,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)'
                ],
                borderColor: isDarkMode ? '#fff' : '#666',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: isDarkMode ? '#fff' : '#666'
                    }
                }
            }
        }
    });
}


// Función para actualizar los gráficos
function updateCharts() {
    createCategoryChart(); // Asegúrate de que esta función esté actualizando el gráfico correctamente
    
    const isDarkMode = document.body.classList.contains('dark-mode');

    if (monthlyChartInstance) {
        updateChartColors(monthlyChartInstance, isDarkMode);
        monthlyChartInstance.update(); // Asegúrate de actualizar el gráfico mensual
    } else {
        createChart('monthlyChart', 'Ingresos y Gastos por Mes', getMonthlyData(), 'monthly');
    }

    if (yearlyChartInstance) {
        updateChartColors(yearlyChartInstance, isDarkMode);
        yearlyChartInstance.update(); // Asegúrate de actualizar el gráfico anual
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







// Función para limpiar el formulario después de agregar una transacción
function clearForm() {
    document.getElementById('amount').value = '';
    document.getElementById('category').value = '';
    document.getElementById('type').value = 'income';
    document.getElementById('comment').value = '';
    
    // Establecer la fecha de hoy
    const today = new Date().toISOString().split('T')[0];
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

// Función para detectar si es un dispositivo móvil
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('settingsBtn').addEventListener('click', toggleSettingsPopup);

    loadCategories();

    if (isMobileDevice()) {
        document.body.classList.add('mobile-device');
        console.log('Usuario en dispositivo móvil');
        // Aquí puedes añadir cualquier código específico para dispositivos móviles
    } else {
        document.body.classList.add('desktop-device');
        console.log('Usuario en PC');
        // Aquí puedes añadir cualquier código específico para PC
    }

    const closeDailySummaryBtn = document.getElementById('closeDailySummary');
    if (closeDailySummaryBtn) {
        closeDailySummaryBtn.addEventListener('click', function() {
            const dailyTransactionsSummary = document.getElementById('dailyTransactionsSummary');
            if (dailyTransactionsSummary) {
                dailyTransactionsSummary.style.display = 'none';
            }
        });
    } else {
        console.error("Elemento con id 'closeDailySummary' no encontrado");
    }

        // Set up event listeners
        const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
        if (manageCategoriesBtn) {
            manageCategoriesBtn.addEventListener('click', showCategoryManagementModal);
        } else {
            console.error("Element with id 'manageCategoriesBtn' not found");
        }
    
        const closeCategoryManagementBtn = document.getElementById('closeCategoryManagementBtn');
        if (closeCategoryManagementBtn) {
            closeCategoryManagementBtn.addEventListener('click', () => {
                document.getElementById('categoryManagementModal').style.display = 'none';
            });
        } else {
            console.error("Element with id 'closeCategoryManagementBtn' not found");
        }
    
        const addCategoryForm = document.getElementById('addCategoryForm');
        if (addCategoryForm) {
            addCategoryForm.addEventListener('submit', addCategory);
        } else {
            console.error("Element with id 'addCategoryForm' not found");
        }

    const showCalendarBtn = document.getElementById('showCalendarBtn');
    const calendarView = document.getElementById('calendarView');

    showCalendarBtn.addEventListener('click', function() {
        transactionsView.style.display = 'none';
        statsView.style.display = 'none';
        calendarView.style.display = 'block';

        showTransactionsBtn.classList.remove('active');
        showStatsBtn.classList.remove('active');
        showCalendarBtn.classList.add('active');

        initializeCalendar();
    });

    let currentDate = new Date();

    function initializeCalendar() {
        updateCalendarHeader();
        renderCalendar();
        
        document.getElementById('prevMonth').addEventListener('click', () => {
          currentDate.setMonth(currentDate.getMonth() - 1);
          renderCalendar();
        });
        
        document.getElementById('nextMonth').addEventListener('click', () => {
          currentDate.setMonth(currentDate.getMonth() + 1);
          renderCalendar();
        });
        
        document.getElementById('closeDailySummary').addEventListener('click', () => {
          document.getElementById('dailyTransactionsSummary').style.display = 'none';
        });
      }

      function updateCalendarHeader() {
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];
        document.getElementById('currentMonthYear').textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      }

      function renderCalendar() {
        const calendarEl = document.getElementById('calendar');
        calendarEl.innerHTML = '';
        
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        // Días de la semana abreviados
        const daysOfWeek = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
        
        const calendarGreen = 'rgb(102, 187, 106)'; // Define el color verde constante

        daysOfWeek.forEach(day => {
          const dayHeader = document.createElement('div');
          dayHeader.className = 'calendar-day-header';
          dayHeader.textContent = day;
          dayHeader.style.color = calendarGreen; // Usa el color verde constante
          calendarEl.appendChild(dayHeader);
        });
        
        for (let i = 0; i < firstDay.getDay(); i++) {
          calendarEl.appendChild(document.createElement('div'));
        }
        
        for (let i = 1; i <= lastDay.getDate(); i++) {
          const dayEl = document.createElement('div');
          dayEl.className = 'calendar-day';
          dayEl.innerHTML = `<span class="day-number">${i}</span>`;
          
          const currentDayTransactions = getTransactionsForDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
          if (currentDayTransactions.length > 0) {
            const summary = document.createElement('div');
            summary.className = 'transaction-summary';
            summary.textContent = `${currentDayTransactions.length}`;
            dayEl.appendChild(summary);
          }
          
          dayEl.addEventListener('click', () => showDailyTransactions(new Date(currentDate.getFullYear(), currentDate.getMonth(), i)));
          calendarEl.appendChild(dayEl);
        }
        
        updateCalendarHeader();
        
      }

      function getTransactionsForDay(date) {
        return transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getDate() === date.getDate() &&
                 transactionDate.getMonth() === date.getMonth() &&
                 transactionDate.getFullYear() === date.getFullYear();
        });
      }





    function generateCalendarEvents() {
        return transactions.map(transaction => ({
            title: `${transaction.type === 'income' ? '+' : '-'}$${transaction.amount}`,
            start: transaction.date,
            allDay: true,
            color: transaction.type === 'income' ? '#4CAF50' : '#f44336'
        }));
    }
    
    function showDailyTransactions(date) {
        const dailyTransactions = getTransactionsForDay(date);
        const dailyTransactionsList = document.getElementById('dailyTransactionsList');
        const selectedDateEl = document.getElementById('selectedDate');
        const dailyTotalEl = document.getElementById('dailyTotal');
        
        selectedDateEl.textContent = `Transacciones del ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        dailyTransactionsList.innerHTML = '';
        
        let dailyTotal = 0;
        
        dailyTransactions.forEach(t => {
          const transactionEl = document.createElement('div');
          transactionEl.className = `transaction-item ${t.type}`;
          transactionEl.innerHTML = `
            <span>${t.category}</span>
            <span>${t.type === 'income' ? '+' : '-'}$${Math.abs(t.amount).toFixed(2)}</span>
          `;
          dailyTransactionsList.appendChild(transactionEl);
          
          dailyTotal += t.type === 'income' ? t.amount : -t.amount;
        });
        
        dailyTotalEl.textContent = `Total del día: $${dailyTotal.toFixed(2)}`;
        document.getElementById('dailyTransactionsSummary').style.display = 'block';
      }

      // Asegúrate de llamar a esta función cuando se cargue la página
document.addEventListener('DOMContentLoaded', initializeCalendar);


// Modifica la función existente showCalendar para usar la nueva vista
function showCalendar() {
    document.getElementById('transactionsView').style.display = 'none';
    document.getElementById('statsView').style.display = 'none';
    document.getElementById('calendarView').style.display = 'block';
    
    document.getElementById('showTransactionsBtn').classList.remove('active');
    document.getElementById('showStatsBtn').classList.remove('active');
    document.getElementById('showCalendarBtn').classList.add('active');
    
    renderCalendar();
  }

  
  
  // Asegúrate de que el botón del calendario llame a esta función
  document.getElementById('showCalendarBtn').addEventListener('click', showCalendar);
    
    document.getElementById('closeDailyTransactions').addEventListener('click', function() {
        document.getElementById('dailyTransactions').style.display = 'none';
    });
    
    function updateArchivedMonths() {
        const currentDate = moment();
        archivedMonths = {};
    
        transactions.forEach(transaction => {
            const transactionDate = moment(transaction.date);
            if (transactionDate.isBefore(currentDate, 'month')) {
                const key = transactionDate.format('YYYY-MM');
                if (!archivedMonths[key]) {
                    archivedMonths[key] = { income: 0, expense: 0 };
                }
                if (transaction.type === 'income') {
                    archivedMonths[key].income += transaction.amount;
                } else {
                    archivedMonths[key].expense += transaction.amount;
                }
            }
        });
    
        const archivedMonthsList = document.getElementById('archivedMonthsList');
        archivedMonthsList.innerHTML = '';
    
        Object.entries(archivedMonths).forEach(([key, data]) => {
            const li = document.createElement('li');
            li.textContent = `${moment(key, 'YYYY-MM').format('MMMM YYYY')}: Ingresos: $${data.income.toFixed(2)}, Gastos: $${data.expense.toFixed(2)}`;
            archivedMonthsList.appendChild(li);
        });
    }

    // Cargar datos
    loadTransactions();
    loadCategories();

        // Actualizar UI
        updateUI();
        updateCategoryOptions();

        
        

            // Configurar event listeners
    document.getElementById('manageCategoriesBtn').addEventListener('click', showCategoryManagementModal);
    document.getElementById('closeCategoryManagementBtn').addEventListener('click', () => {
        document.getElementById('categoryManagementModal').style.display = 'none';
    });
    document.getElementById('addCategoryForm').addEventListener('submit', addCategory);

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

        updateCharts(); // Recargar los gráficos después de agregar una transacción
        


        
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



// Cargar categorías desde el almacenamiento local
function loadCategories() {
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
        categories = JSON.parse(savedCategories);
    } else {
        // Si no hay categorías guardadas, usar las predeterminadas
        categories = ['Comida', 'Transporte', 'Entretenimiento', 'Servicios', 'Otros'];
        saveCategories();
    }
    updateCategoryOptions();
}

// Guardar categorías en el almacenamiento local
function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(categories));
    updateCategoryOptions();
}

// Actualizar las opciones de categoría en los formularios
function updateCategoryOptions() {
    const categorySelects = document.querySelectorAll('#category, #editCategory');
    categorySelects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Seleccione una categoría</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
        select.value = currentValue;
    });
}

// Mostrar el modal de gestión de categorías
function showCategoryManagementModal() {
    const modal = document.getElementById('categoryManagementModal');
    if (modal) {
        updateCategoryList();
        modal.style.display = 'block';
    } else {
        console.error("Element with id 'categoryManagementModal' not found");
    }
}

// Actualizar la lista de categorías en el modal
function updateCategoryList() {
    const categoryList = document.getElementById('categoryList');
    if (categoryList) {
        categoryList.innerHTML = '';
        categories.forEach(category => {
            const categoryItem = document.createElement('div');
            categoryItem.classList.add('category-item');
            categoryItem.innerHTML = `
                <span>${category}</span>
                <button onclick="deleteCategory('${category}')">Eliminar</button>
            `;
            categoryList.appendChild(categoryItem);
        });
    } else {
        console.error("Element with id 'categoryList' not found");
    }
}
// Añadir una nueva categoría
function addCategory(e) {
    e.preventDefault();
    const newCategoryInput = document.getElementById('newCategoryName');
    if (newCategoryInput) {
        const newCategory = newCategoryInput.value.trim();
        if (newCategory && !categories.includes(newCategory)) {
            categories.push(newCategory);
            saveCategories();
            updateCategoryList();
            newCategoryInput.value = '';
        }
    } else {
        console.error("Element with id 'newCategoryName' not found");
    }
}

// Eliminar una categoría
function deleteCategory(category) {
    categories = categories.filter(c => c !== category);
    saveCategories();
    updateCategoryList();
    updateUI();
}


// Crear gráfico de categorías
function createCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    const categoryData = getCategoryData();
    
    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }

    categoryChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categoryData.map(d => d.category),
            datasets: [{
                data: categoryData.map(d => d.total),
                backgroundColor: getRandomColors(categoryData.length)
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Gastos por Categoría'
            }
        }
    });
}

// Obtener datos de categorías para el gráfico
function getCategoryData() {
    const categoryData = {};
    transactions.forEach(transaction => {
        if (transaction.type === 'expense') {
            if (!categoryData[transaction.category]) {
                categoryData[transaction.category] = 0;
            }
            categoryData[transaction.category] += transaction.amount;
        }
    });
    return Object.entries(categoryData).map(([category, total]) => ({ category, total }));
}

// Generar colores aleatorios para el gráfico
function getRandomColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(`hsl(${Math.random() * 360}, 70%, 50%)`);
    }
    return colors;
}


//Credit card section

document.getElementById('addCreditCardForm').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('toggleCardFormBtn').style.display = 'none';
        // Guardar el estado en localStorage
        localStorage.setItem('cardAdded', 'true');
    let cardName = document.getElementById('cardName').value;
    let cardLastDigits = document.getElementById('cardLastDigits').value;
    let interestRate = parseFloat(document.getElementById('interestRate').value);
    let creditLimit = parseFloat(document.getElementById('creditLimit').value);
    let cutoffDate = document.getElementById('cutoffDate').value;
    let paymentDate = document.getElementById('paymentDate').value;
    
    if(cardLastDigits.length !== 4) {
        alert("Los últimos 4 dígitos deben tener exactamente 4 números.");
        return;
    }

    let creditCard = {
        cardName,
        cardLastDigits,
        interestRate,
        creditLimit,
        cutoffDate,
        paymentDate,
        currentBalance: creditLimit
    };

    localStorage.setItem('creditCard', JSON.stringify(creditCard));

    displayCardInfo();
    displayDebtInfo();
    
    // Ocultar el formulario y limpiar los campos
    this.style.display = 'none';
    this.reset();
});


function updateCardExpensesChart() {
    var ctx = document.getElementById('cardExpensesChart').getContext('2d');
    var cardExpensesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
            datasets: [{
                label: 'Gastos Mensuales',
                data: [100, 200, 150, 300, 250],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

document.getElementById('showCreditCardBtn').addEventListener('click', function() {
    document.getElementById('transactionsView').style.display = 'none';
    document.getElementById('statsView').style.display = 'none';
    document.getElementById('calendarView').style.display = 'none';
    document.getElementById('creditCardView').style.display = 'block';
    document.getElementById('addTransactionBtn').style.display = 'none';
    document.getElementById('manageCategoriesBtn').style.display = 'none';
    document.getElementById('addCreditCardForm').style.display = 'none';
    document.getElementById('showFloatingMenuBtn').style.display = 'none';
    document.getElementById('settingsBtn').style.display = 'none';
});

window.addEventListener('load', function() {
    // Verificar si la tarjeta ya ha sido agregada
    const cardAdded = localStorage.getItem('cardAdded');
    
    if (cardAdded) {
        // Ocultar el botón "Agregar Tarjeta"
        document.getElementById('toggleCardFormBtn').style.display = 'none';
    } else {
        // Mostrar el botón "Agregar Tarjeta"
        document.getElementById('toggleCardFormBtn').style.display = 'block';
    }
});



function displayCardInfo() {
    let creditCard = JSON.parse(localStorage.getItem('creditCard'));

    if (creditCard) {
        let debt = creditCard.creditLimit - creditCard.currentBalance;
        let usagePercentage = (debt / creditCard.creditLimit) * 100;

        // Función para extraer solo el día de una fecha
        function getDayOnly(dateString) {
            const date = new Date(dateString);
            return date.getDate(); // Devuelve solo el día del mes
        }

        document.getElementById('cardInfo').innerHTML = `
            <p>Tarjeta: ${creditCard.cardName} ****${creditCard.cardLastDigits}</p>
            <p>Crédito Total: $${creditCard.creditLimit}</p>
            <p>Balance Disponible: $${creditCard.currentBalance}</p>
            <p>Deuda Actual: $${debt}</p>
            <p>Fecha de Corte: ${getDayOnly(creditCard.cutoffDate)}</p>
            <p>Fecha de Pago: ${getDayOnly(creditCard.paymentDate)}</p>
            <br>
            <button id="deleteCardBtn" class="delete-btn">Eliminar Tarjeta</button>
        `;
        
        // Actualizar la barra de progreso
        document.getElementById('usageBar').style.width = `${usagePercentage}%`;
        document.getElementById('usagePercentage').textContent = `Uso: ${usagePercentage.toFixed(2)}%`;
        
        // Color de la barra basado en el porcentaje de uso
        let barColor = usagePercentage < 30 ? '#4CAF50' : // Verde
                       usagePercentage < 70 ? '#FFA500' : // Naranja
                       '#FF0000'; // Rojo
        document.getElementById('usageBar').style.backgroundColor = barColor;
        
        // Volver a agregar el evento al botón de eliminar
        document.getElementById('deleteCardBtn').addEventListener('click', function() {
            if (confirm('¿Estás seguro de que quieres eliminar los datos de la tarjeta?')) {
                localStorage.removeItem('creditCard');
                document.getElementById('cardInfo').innerHTML = '<p>No hay tarjeta registrada</p>';
                document.getElementById('addCreditCardForm').style.display = 'block';
                document.getElementById('creditUsage').style.display = 'none';
                document.getElementById('toggleCardFormBtn').style.display = 'block';
                
                // Eliminar el estado de localStorage
                localStorage.removeItem('cardAdded');
            }
        });
        
        document.getElementById('creditUsage').style.display = 'block';
    } else {
        document.getElementById('cardInfo').innerHTML = '<p>No hay tarjeta registrada</p>';
        document.getElementById('addCreditCardForm').style.display = 'block';
        document.getElementById('creditUsage').style.display = 'none';
    }
}


// Mostrar la deuda actual
function displayDebtInfo() {
    let creditCard = JSON.parse(localStorage.getItem('creditCard'));

    if (creditCard) {
        let debt = creditCard.creditLimit - creditCard.currentBalance;
        document.getElementById('debtInfo').innerHTML = `
            
        `;
    }
}

document.getElementById('addExpense,IncomeBtn').addEventListener('click', function() {
    document.getElementById('creditCardTransactionModal').style.display = 'block';
    document.getElementById('ccTransactionType').value = 'Gasto','Ingreso';
});



document.getElementById('cancelCCTransaction').addEventListener('click', function() {
    document.getElementById('creditCardTransactionModal').style.display = 'none';
});

document.getElementById('creditCardTransactionForm').addEventListener('submit', function(e) {

    e.preventDefault();
    let type = document.getElementById('ccTransactionType').value;
    let amount = parseFloat(document.getElementById('ccTransactionAmount').value);
    let date = document.getElementById('ccTransactionDate').value;
    let comment = document.getElementById('ccTransactionComment').value;

    if (isNaN(amount) || amount <= 0) {
        alert("Por favor ingresa un monto válido.");
        return;
    }

    updateBalance(type === 'Gasto' ? -amount : amount);
    addTransaction1(type, amount, date, comment);
    document.getElementById('creditCardTransactionModal').style.display = 'none';
});

// Función para actualizar el balance y la deuda
function updateBalance(amount) {
    let creditCard = JSON.parse(localStorage.getItem('creditCard'));
    if (creditCard) {
        creditCard.currentBalance += amount;
        localStorage.setItem('creditCard', JSON.stringify(creditCard));
        displayCardInfo();
        displayDebtInfo();  // Actualizar la deuda después de cada cambio
    }
}

// Función para mostrar la lista de movimientos
function displayTransactions() {
    let transactions1 = JSON.parse(localStorage.getItem('transactions1')) || [];
    let transactionList = document.getElementById('transactionHistory');
    transactionList.innerHTML = '';

    transactions1.forEach(transaction1 => {
        let li = document.createElement('li');
        li.innerHTML = `
            <span>${transaction1.date} - ${transaction1.type}: $${transaction1.amount}</span>
            <p>${transaction1.comment || ''}</p>
            <button class="delete-btn" onclick="deleteTransaction(${transaction1.id})">Eliminar</button>
        `;
        transactionList.appendChild(li);
    });
}

// Actualizar navegación y mostrar/ocultar secciones
function showSection(sectionId, buttonId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    document.querySelectorAll('.nav-button').forEach(button => {
        button.classList.remove('active');
        button.style.backgroundColor = 'black';
        button.style.color = 'white';
    });
    document.getElementById(sectionId).style.display = 'block';
    let button = document.getElementById(buttonId);
    button.classList.add('active');
    button.style.backgroundColor = '#66bb6a';
}

document.getElementById('showCreditCardBtn').addEventListener('click', function() {
    showSection('creditCardView', 'showCreditCardBtn');
});

document.getElementById('showTransactionsBtn').addEventListener('click', function() {
    showSection('transactionsView', 'showTransactionsBtn');
    document.getElementById('addTransactionBtn').style.display = 'block';
    document.getElementById('manageCategoriesBtn').style.display = 'block';
    document.getElementById('settingsBtn').style.display = 'block';
    document.getElementById('showFloatingMenuBtn').style.display = 'block';
});



document.getElementById('showCalendarBtn').addEventListener('click', function() {
    showSection('calendarView', 'showCalendarBtn');
    document.getElementById('addTransactionBtn').style.display = 'none';
    document.getElementById('manageCategoriesBtn').style.display = 'none';
    document.getElementById('settingsBtn').style.display = 'none';
    document.getElementById('showFloatingMenuBtn').style.display = 'none';
});

document.getElementById('showStatsBtn').addEventListener('click', function() {
    showSection('statsView', 'showStatsBtn');
    document.getElementById('addTransactionBtn').style.display = 'none';
    document.getElementById('manageCategoriesBtn').style.display = 'none';
    document.getElementById('settingsBtn').style.display = 'none';
    document.getElementById('showFloatingMenuBtn').style.display = 'none';
});


// Función para mostrar/ocultar el formulario de agregar tarjeta
document.getElementById('toggleCardFormBtn').addEventListener('click', function() {
    let form = document.getElementById('addCreditCardForm');
    form.style.display = (form.style.display === "none") ? "block" : "none";
});

// Función para añadir y mostrar movimientos
function addTransaction1(type, amount, date, comment) {
    let transactions1 = JSON.parse(localStorage.getItem('transactions1')) || [];
    let transaction1 = { id: Date.now(), type, amount, date, comment };
    transactions1.push(transaction1);
    localStorage.setItem('transactions1', JSON.stringify(transactions1));
    displayTransactions();
}


// Función para eliminar un movimiento
function deleteTransaction(id) {
    let transactions1 = JSON.parse(localStorage.getItem('transactions1')) || [];
    let transaction1 = transactions1.find(trans => trans.id === id);
    if (transaction1) {
        let adjustment = transaction1.type === 'Gasto' ? transaction1.amount : -transaction1.amount;
        updateBalance(adjustment);  // Revertir el impacto del movimiento en el balance
        transactions1 = transactions1.filter(trans => trans.id !== id);
        localStorage.setItem('transactions1', JSON.stringify(transactions1));
        displayTransactions();
    }
}

// Añadir un botón para eliminar los datos de la tarjeta
document.getElementById('cardInfo').innerHTML += `
    <button id="deleteCardBtn" class="delete-btn">Eliminar Tarjeta</button>
`;

// Evento para eliminar los datos de la tarjeta
document.getElementById('deleteCardBtn').addEventListener('click', function() {
    if (confirm('¿Estás seguro de que quieres eliminar los datos de la tarjeta?')) {
        localStorage.removeItem('creditCard');
        document.getElementById('cardInfo').innerHTML = '<p>No hay tarjeta registrada</p>';
        document.getElementById('debtInfo').innerHTML = '';
        document.getElementById('addCreditCardForm').style.display = 'block';
    }
});

// Asegurarse de que displayCardInfo se llame al cargar la página
window.onload = function() {
    displayCardInfo();
    displayDebtInfo();
    displayTransactions();
};



// Función para exportar datos
function exportData() {
    const currentMode = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    const currentLanguage = document.getElementById('languageSelect').value;

    const data = {
        transactions: transactions,
        categories: categories,
        creditCard: JSON.parse(localStorage.getItem('creditCard')),
        transactions1: JSON.parse(localStorage.getItem('transactions1')),
        archivedMonths: archivedMonths,
        mode: currentMode,
        language: currentLanguage
    };

    const dataStr = JSON.stringify(data);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'mai_money_data.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}


// Función para importar datos
function importData(event) {
    if (isImporting) return; // Si ya estamos importando, no continuar
    isImporting = true;

    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const content = e.target.result;
        try {
            const data = JSON.parse(content);
            transactions = data.transactions || [];
            categories = data.categories || [];
            localStorage.setItem('creditCard', JSON.stringify(data.creditCard));
            localStorage.setItem('transactions1', JSON.stringify(data.transactions1 || []));
            archivedMonths = data.archivedMonths || {};

            // Aplicar modo claro/oscuro
            if (data.mode) {
                document.body.classList.toggle('dark-mode', data.mode === 'dark');
            }

            // Aplicar configuración de idioma
            if (data.language) {
                document.getElementById('languageSelect').value = data.language;
                loadLanguage(data.language); // Asumiendo que tienes una función para cargar el idioma
            }

            saveTransactions();
            saveCategories();
            updateUI();
            displayCardInfo();
            displayDebtInfo();
            displayTransactions();
            updateCategoryOptions();
            updateCharts();

            alert('Datos JSON importados con éxito');
        } catch (jsonError) {
            console.error('Error al importar datos:', jsonError);
            alert('Error al importar datos. Por favor, asegúrate de que el archivo es válido.');
        } finally {
            isImporting = false; // Resetear el flag después de completar la importación
        }
    };

    reader.readAsText(file);
}



document.addEventListener('DOMContentLoaded', () => {
    const importInput = document.getElementById('importInput');
    importInput.replaceWith(importInput.cloneNode(true)); // Esto reemplaza el input para asegurarse de que no haya listeners duplicados
    document.getElementById('importInput').addEventListener('change', importData);
});






// Función para manejar el clic en el botón de importar
function handleImportClick() {
    document.getElementById('importInput').click();
}

// Función para confirmar y eliminar todos los datos
function confirmDataDeletion() {
    if (confirm('¿Estás seguro de que quieres eliminar TODOS los datos? Esta acción no se puede deshacer.')) {
        // Eliminar todos los datos del localStorage
        localStorage.clear();

        // Reiniciar variables globales
        transactions = [];
        categories = ['Comida', 'Transporte', 'Entretenimiento', 'Servicios', 'Otros'];
        archivedMonths = {};

        // Actualizar la interfaz
        updateUI();
        displayCardInfo();
        displayDebtInfo();
        displayTransactions();
        updateCategoryOptions();
        updateCharts();

        alert('Todos los datos han sido eliminados.');
    }
}

// Agregar event listener al botón de eliminar datos
document.addEventListener('DOMContentLoaded', function() {
    const deleteAllDataBtn = document.getElementById('deleteAllDataBtn');
    if (deleteAllDataBtn) {
        deleteAllDataBtn.addEventListener('click', confirmDataDeletion);
    }
});

// Función para mostrar/ocultar el popup de ajustes
function toggleSettingsPopup() {
    const popup = document.getElementById('settingsPopup');
    popup.style.display = popup.style.display === 'none' ? 'block' : 'block';
}

// Evento para cerrar el settingsPopup si se hace clic fuera de él
// Evento para cerrar los modales y botones flotantes si se hace clic fuera de ellos
window.onclick = function(event) {
    const popup = document.getElementById('settingsPopup');
    if (event.target === popup) {
        popup.style.display = 'none';
    }

    const addTransactionModal = document.getElementById('addTransactionModal');
    if (event.target === addTransactionModal) {
        addTransactionModal.style.display = 'none';
    }

    const categoryManagementModal = document.getElementById('categoryManagementModal');
    if (event.target === categoryManagementModal) {
        categoryManagementModal.style.display = 'none';
    }

    const creditCardTransactionModal = document.getElementById('creditCardTransactionModal');
    if (event.target === creditCardTransactionModal) {
        creditCardTransactionModal.style.display = 'none';
    }

    const showFloatingMenuBtn = document.getElementById('showFloatingMenuBtn');
    const floatingButtons = [
        document.getElementById('addTransactionBtn'),
        document.getElementById('manageCategoriesBtn'),
        document.getElementById('settingsBtn')
    ];

    // Verificar si los botones flotantes están visibles y si el clic fue fuera de ellos
    const anyButtonVisible = floatingButtons.some(btn => btn.classList.contains('float-btn-visible'));

    if (anyButtonVisible && event.target !== showFloatingMenuBtn && !floatingButtons.some(btn => btn.contains(event.target))) {
        // Ocultar los botones flotantes
        floatingButtons.forEach(btn => {
            btn.classList.remove('float-btn-visible');
            btn.classList.add('float-btn-hidden');
        });
    }
};




// Asegúrate de que estas funciones estén definidas o ajusta según sea necesario
document.getElementById('exportBtn').addEventListener('click', exportData);
document.getElementById('importBtn').addEventListener('click', handleImportClick);
document.getElementById('deleteAllDataBtn').addEventListener('click', confirmDataDeletion);


document.getElementById('showFloatingMenuBtn').addEventListener('click', function() {
    const buttons = [
        document.getElementById('addTransactionBtn'),
        document.getElementById('manageCategoriesBtn'),
        document.getElementById('settingsBtn')
    ];

    buttons.forEach((btn, index) => {
        if (btn.classList.contains('float-btn-hidden')) {
            // Mostrar botones
            setTimeout(() => {
                btn.classList.remove('float-btn-hidden');
                btn.classList.add('float-btn-visible');
            }, index * 1); // Animación escalonada
        } else {
            // Ocultar botones
            btn.classList.remove('float-btn-visible');
            btn.classList.add('float-btn-hidden');
        }
    });
});

// TUTORIAL
    document.addEventListener('DOMContentLoaded', function() {
        const modal = document.getElementById("welcomeModal");
        const closeBtn = document.getElementsByClassName("close1")[0];
        const prevBtns = document.querySelectorAll("#prevBtn");
        const nextBtns = document.querySelectorAll("#nextBtn");
        const finishBtn = document.getElementById("finishBtn");
        const tutorialSteps = document.getElementsByClassName("tutorial-step");
        const content = document.querySelectorAll('main, header, nav, .float-btn'); // Incluir botones y el flotante
        let currentStep = 0;
    
        function showStep(stepIndex) {
            for (let i = 0; i < tutorialSteps.length; i++) {
                tutorialSteps[i].classList.remove("active");
                tutorialSteps[i].style.display = "none";
            }
            tutorialSteps[stepIndex].classList.add("active");
            tutorialSteps[stepIndex].style.display = "block";
        }
    
        function applyBlur() {
            content.forEach(el => {
                el.classList.add('blur-background');
            });
        }
    
        function removeBlur() {
            content.forEach(el => {
                el.classList.remove('blur-background');
            });
        }
    
        if (!localStorage.getItem('tutorialShown')) {
            modal.style.display = "block";
            applyBlur();
            localStorage.setItem('tutorialShown', 'true');
        }
    
        nextBtns.forEach(btn => {
            btn.onclick = function() {
                currentStep = (currentStep + 1) % tutorialSteps.length;
                showStep(currentStep);
            };
        });
    
        prevBtns.forEach(btn => {
            btn.onclick = function() {
                currentStep = (currentStep - 1 + tutorialSteps.length) % tutorialSteps.length;
                showStep(currentStep);
            };
        });
    
        closeBtn.onclick = function() {
            modal.style.display = "none";
            removeBlur();
        };
    
        finishBtn.onclick = function() {
            modal.style.display = "none";
            removeBlur();
        };
    
        showStep(currentStep);
    });
    

//Local Transacction

function saveTransactionOffline(transaction) {
    if ('indexedDB' in window) {
      let dbPromise = idb.open('mai-money-db', 1, upgradeDB => {
        if (!upgradeDB.objectStoreNames.contains('transactions')) {
          upgradeDB.createObjectStore('transactions', { autoIncrement: true });
        }
      });
  
      dbPromise.then(db => {
        let tx = db.transaction('transactions', 'readwrite');
        let store = tx.objectStore('transactions');
        store.put(transaction);
        return tx.complete;
      }).then(() => {
        console.log('Transaction saved offline');
      });
    } else {
      console.log('IndexedDB not supported, falling back to localStorage');
      let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
      transactions.push(transaction);
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }
  }

  // Detección de Conectividad y Sincronización

  window.addEventListener('online', () => {
    syncTransactions();
  });
  
  function syncTransactions() {
    if ('indexedDB' in window) {
      let dbPromise = idb.open('mai-money-db', 1);
  
      dbPromise.then(db => {
        let tx = db.transaction('transactions', 'readonly');
        let store = tx.objectStore('transactions');
        return store.getAll();
      }).then(transactions => {
        // Aquí deberías enviar las transacciones al servidor
        transactions.forEach(transaction => {
          // Suponiendo que tienes una función sendTransaction que envía la transacción al servidor
          sendTransaction(transaction).then(() => {
            // Una vez que la transacción ha sido enviada, eliminarla de IndexedDB
            deleteTransaction(transaction.id);
          });
        });
      });
    } else {
      let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
      transactions.forEach(transaction => {
        // Suponiendo que tienes una función sendTransaction que envía la transacción al servidor
        sendTransaction(transaction).then(() => {
          // Una vez que la transacción ha sido enviada, eliminarla de localStorage
          transactions = transactions.filter(t => t.id !== transaction.id);
          localStorage.setItem('transactions', JSON.stringify(transactions));
        });
      });
    }
  }
  
  function deleteTransaction(id) {
    let dbPromise = idb.open('mai-money-db', 1);
  
    dbPromise.then(db => {
      let tx = db.transaction('transactions', 'readwrite');
      let store = tx.objectStore('transactions');
      store.delete(id);
      return tx.complete;
    });
  }
  

  //Interfaz de Usuario

  function updateOnlineStatus() {
    const statusIndicator = document.getElementById('statusIndicator');
    if (navigator.onLine) {
      statusIndicator.textContent = "Online";
      statusIndicator.classList.remove('offline');
      statusIndicator.classList.add('online');
    } else {
      statusIndicator.textContent = "Offline";
      statusIndicator.classList.remove('online');
      statusIndicator.classList.add('offline');
    }
  }
  
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  document.addEventListener('DOMContentLoaded', () => {
    updateOnlineStatus();
  });
  
  

//Import/Export CSV

function exportToCSV(transactions) {
    const headers = ['Fecha', 'Categoría', 'Tipo', 'Monto', 'Comentario'];
    const csvRows = [];
  
    // Añadir encabezados
    csvRows.push(headers.join(','));
  
    // Añadir datos de las transacciones
    transactions.forEach(transaction => {
      const row = [
        transaction.date,
        transaction.category,
        transaction.type,
        transaction.amount,
        transaction.comment || '' // Agregar comentario si existe, si no, dejar vacío
      ];
      csvRows.push(row.join(','));
    });
  
    // Unir todas las filas en un solo string
    const csvContent = csvRows.join('\n');
  
    // Crear un Blob y generar un enlace de descarga
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'transacciones.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('exportBtn1').addEventListener('click', () => {
      const transactions = getAllTransactions(); // Suponiendo que tienes una función que recupera todas las transacciones
      exportToCSV(transactions);
    });
  });

  function getAllTransactions() {
    return transactions; // Retorna el array global que contiene todas las transacciones
}

  

function importFromCSV(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const csvContent = e.target.result;
        const rows = csvContent.split('\n');
        const transactions = [];

        rows.forEach((row, index) => {
            if (index === 0) return; // Saltar la fila de encabezados

            const cols = row.split(',');
            const transaction = {
                date: cols[0],
                category: cols[1],
                type: cols[2],
                amount: parseFloat(cols[3]),
                comment: cols[4] ? cols[4].trim() : '' // Limpia cualquier espacio en blanco
            };
            transactions.push(transaction);
        });

        // Guardar las transacciones importadas
        transactions.forEach(transaction => {
            saveTransaction(transaction); // Guarda cada transacción
        });

        alert('Importación de CSV completada.');
    };

    reader.readAsText(file);
}




function saveTransaction(transaction) {
    // Agrega la transacción al array global `transactions`
    transactions.push(transaction);

    // Guarda las transacciones en el almacenamiento local
    saveTransactions(); // Asegúrate de que esta función guarda `transactions` en localStorage o IndexedDB

    // Actualiza la interfaz de usuario para reflejar la nueva transacción
    updateUI();
}



  document.getElementById('importBtn1').addEventListener('click', () => {
    document.getElementById('importInput').click();
  });
  
  document.getElementById('importInput').addEventListener('change', importFromCSV);


  
//TRADUCIon

let currentLang = localStorage.getItem('lang') || navigator.language.substring(0, 2) || 'en';

function loadLanguage(lang) {
    fetch(`./lang/${lang}.json`)
        .then(response => response.json())
        .then(translations => {
            applyTranslations(translations);
            localStorage.setItem('lang', lang); // Guardar la preferencia del idioma
        })
        .catch(error => {
            console.error('Error al cargar las traducciones:', error);
        });
}

function applyTranslations(translations) {
    const elements = {
        appTitle: document.getElementById('appTitle'),
        balanceLabel: document.getElementById('balanceLabel'),
        incomeLabel: document.getElementById('incomeLabel'),
        expensesLabel: document.getElementById('expensesLabel'),
        transactionsBtn: document.querySelector('#showTransactionsBtn span'),
        calendarBtn: document.querySelector('#showCalendarBtn span'),
        statisticsBtn: document.querySelector('#showStatsBtn span'),
        creditCardBtn: document.querySelector('#showCreditCardBtn span'),
        exportCSVBtn: document.getElementById('exportBtn1'),
        importCSVBtn: document.getElementById('importBtn1'),
        movementsLabel: document.getElementById('movementsLabel'),
        addTransaction: document.getElementById('addTransaction'),
        categoryManagement: document.getElementById('categoryManagement'),
        settings: document.getElementById('settings'),
        advanced: document.getElementById('advanced'),
        creditCard: document.getElementById('creditCard'),
        languages: document.getElementById('languages')
    };

    for (const key in elements) {
        if (elements[key]) {
            elements[key].textContent = translations[key];
        }
    }
}






// Cargar el idioma seleccionado o detectado
loadLanguage(currentLang);

document.getElementById('languageSelect').addEventListener('change', (event) => {
    const selectedLang = event.target.value;
    loadLanguage(selectedLang);
});


document.getElementById('languageSelect').value = currentLang;
