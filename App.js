// Grounded dataset extracted directly from uploaded Cycle Bill image (Account #656219-226730)
const BILL_DATA = {
  accountNumber: '656219-226730',
  internetAccessPin: '0001154778',
  cycleRoute: '32-06',
  billDate: '10/03/26',
  customerName: 'ANDREW S HOVIOUS',
  serviceAddress: '5466 E LANSING WAY',
  cityStateZip: 'FRESNO, CA 93727',
  servicePeriodThru: '10/01/26',
  accountBalance: 108.68,
  dueDate: '10/28/26',
  depositOnFile: 80.00,
  previousBalance: 109.85,
  payments: -109.85,
  adjustments: 0.00,
  balanceForward: 0.00,
  currentCharges: 109.85,
  totalAmountDue: 108.68,
  amountDueAfterLateDate: 110.85,
  lateDate: '10/29/26',
  categories: [
    {
      category: 'SOLID WASTE',
      total: 25.37,
      items: [
        { name: '96 gal Cont', detail: 'Residential Solid Waste Container (96 Gallon)', amount: 25.37 }
      ]
    },
    {
      category: 'SANITATION',
      total: 6.23,
      items: [
        { name: 'Sanitation', detail: 'City Sanitation Operations & Street Sweeping', amount: 6.23 }
      ]
    },
    {
      category: 'SEWER NON-METERED',
      total: 25.81,
      items: [
        { name: 'Pretttmnt - Residntl', detail: 'Residential Industrial Pretreatment Charge', amount: 0.06 },
        { name: 'Residential Sewer', detail: 'Flat Monthly Residential Wastewater Service', amount: 25.75 }
      ]
    },
    {
      category: 'WATER - METERED',
      total: 51.27,
      items: [
        { name: 'Wtr Mtr Service Chg', detail: '1" Water Meter #12085711 Fixed Readiness Charge', amount: 17.90 },
        { name: 'Consumption', detail: '18.18 HCF (14,347 Gallons • Read 84167 to 98517)', amount: 33.37 }
      ]
    }
  ],
  consumption: {
    readDate: '10/01',
    service: 'WA',
    meterNumber: '12085711',
    meterSize: '1"',
    currentRead: 98517,
    previousRead: 84167,
    readingUnits: 'GALS',
    hcf: 18.18,
    gallonsUsed: 14347,
    lastMonthAvgGallons: 13879,
    gallonsPerHcf: 748
  }
};

const state = {
  authenticated: false,
  enteredAccount: BILL_DATA.accountNumber,
  activeTab: 'overview',
  splitPreviewVisible: true,
  selectedCategory: 'ALL',
  simulatedGallons: 14347
};

let doughnutChart = null;
let usageBarChart = null;

function formatCurrency(val) {
  return '$' + Number(val).toFixed(2);
}

function renderItemizedTable() {
  const tbody = document.getElementById('itemized-charges-tbody');
  if (!tbody) return;

  const filtered = state.selectedCategory === 'ALL'
    ? BILL_DATA.categories
    : BILL_DATA.categories.filter(c => c.category === state.selectedCategory);

  let rowsHtml = '';
  filtered.forEach(group => {
    group.items.forEach((item, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === group.items.length - 1;
      rowsHtml += `
        <tr class="hover:bg-slate-50/80 transition">
          <td class="py-3 px-4 align-top">
            ${isFirst ? `<div class="text-[11px] font-extrabold uppercase tracking-wider text-fresno-navy mb-0.5">Total ${group.category} Charges</div>` : ''}
            <div class="font-semibold text-slate-800 pl-2 border-l-2 border-fresno-green/50">${item.name}</div>
          </td>
          <td class="py-3 px-4 text-slate-600 align-top">${item.detail}</td>
          <td class="py-3 px-4 font-mono text-slate-800 text-right align-top">${formatCurrency(item.amount)}</td>
          <td class="py-3 px-4 font-mono font-bold text-fresno-navy text-right align-top">
            ${isLast ? formatCurrency(group.total) : ''}
          </td>
        </tr>
      `;
    });
  });

  tbody.innerHTML = rowsHtml;
}

function switchView(showPortal) {
  state.authenticated = showPortal;
  const loginView = document.getElementById('login-view');
  const portalView = document.getElementById('portal-view');
  const userPill = document.getElementById('header-user-pill');
  const quickBtn = document.getElementById('quick-switch-view-btn');
  const headerAcct = document.getElementById('header-account-label');
  const portalAcct = document.getElementById('portal-acct-display');

  if (showPortal) {
    loginView.classList.add('hidden');
    portalView.classList.remove('hidden');
    userPill.classList.remove('hidden');
    userPill.classList.add('flex');
    quickBtn.textContent = 'Back to Sign-In Landing Page';
    headerAcct.textContent = state.enteredAccount || BILL_DATA.accountNumber;
    portalAcct.textContent = state.enteredAccount || BILL_DATA.accountNumber;
    initOrUpdateCharts();
  } else {
    portalView.classList.add('hidden');
    loginView.classList.remove('hidden');
    userPill.classList.add('hidden');
    userPill.classList.remove('flex');
    quickBtn.textContent = 'Switch to Itemized Portal View';
  }
}

function switchPortalTab(tabId) {
  state.activeTab = tabId;
  const tabs = ['overview', 'document', 'calculator'];
  tabs.forEach(t => {
    const el = document.getElementById('tab-' + t);
    if (el) {
      if (t === tabId) el.classList.remove('hidden');
      else el.classList.add('hidden');
    }
  });

  document.querySelectorAll('.portal-tab-btn').forEach(btn => {
    const isCurrent = btn.getAttribute('data-tab') === tabId;
    btn.className = isCurrent
      ? 'portal-tab-btn px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition bg-fresno-navy text-white shadow-sm'
      : 'portal-tab-btn px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition bg-white text-slate-700 hover:bg-slate-100 border border-slate-200';
  });

  if (tabId === 'overview' || tabId === 'calculator') {
    initOrUpdateCharts();
  }
}

function updateUsageSimulation(gallons) {
  state.simulatedGallons = Number(gallons);
  const hcf = state.simulatedGallons / 748;
  const unitRatePerHcf = 33.37 / 18.18;
  const simConsumptionCharge = hcf * unitRatePerHcf;
  const fixedMeterCharge = 17.90;
  const simWaterTotal = fixedMeterCharge + simConsumptionCharge;
  const nonWaterAndCredit = 108.68 - 51.27;
  const simGrandTotal = simWaterTotal + nonWaterAndCredit;

  document.getElementById('sim-gallons-readout').textContent =
    `${state.simulatedGallons.toLocaleString()} GALS (${hcf.toFixed(2)} HCF)`;
  document.getElementById('sim-water-vol-charge').textContent = formatCurrency(simConsumptionCharge);
  document.getElementById('sim-water-total').textContent = formatCurrency(simWaterTotal);
  document.getElementById('sim-grand-total').textContent = formatCurrency(simGrandTotal);

  if (usageBarChart) {
    usageBarChart.data.datasets[0].data = [13879, 14347, state.simulatedGallons];
    usageBarChart.update();
  }
}

function initOrUpdateCharts() {
  if (typeof Chart === 'undefined') return;

  const doughnutCtx = document.getElementById('charges-doughnut-chart');
  if (doughnutCtx && !doughnutChart) {
    doughnutChart = new Chart(doughnutCtx, {
      type: 'doughnut',
      data: {
        labels: [
          'Water - Metered ($51.27)',
          'Sewer Non-Metered ($25.81)',
          'Solid Waste ($25.37)',
          'Sanitation ($6.23)'
        ],
        datasets: [{
          data: [51.27, 25.81, 25.37, 6.23],
          backgroundColor: ['#1a5a96', '#0f3c68', '#2d7a47', '#f59e0b'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { boxWidth: 10, font: { size: 10, family: 'Inter' } }
          }
        }
      }
    });
  }

  const barCtx = document.getElementById('usage-comparison-chart');
  if (barCtx && !usageBarChart) {
    usageBarChart = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: [
          'Last Month Household Avg',
          'Your Current Bill (10/01)',
          'Simulated Usage Target'
        ],
        datasets: [{
          label: 'Gallons Used',
          data: [13879, 14347, state.simulatedGallons],
          backgroundColor: ['#64748b', '#1a5a96', '#2d7a47'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) { return value.toLocaleString() + ' gal'; }
            }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  renderItemizedTable();

  const loginForm = document.getElementById('portal-login-form');
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const acctVal = document.getElementById('account-input').value.trim();
    state.enteredAccount = acctVal || BILL_DATA.accountNumber;
    switchView(true);
  });

  document.getElementById('toggle-pw-btn').addEventListener('click', () => {
    const pwInput = document.getElementById('password-input');
    pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
  });

  document.getElementById('fill-sample-btn').addEventListener('click', () => {
    document.getElementById('account-input').value = BILL_DATA.accountNumber;
    document.getElementById('password-input').value = BILL_DATA.internetAccessPin;
  });

  document.getElementById('quick-switch-view-btn').addEventListener('click', () => {
    switchView(!state.authenticated);
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    switchView(false);
  });

  document.querySelectorAll('.portal-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchPortalTab(btn.getAttribute('data-tab'));
    });
  });

  document.getElementById('category-filter').addEventListener('change', (e) => {
    state.selectedCategory = e.target.value;
    renderItemizedTable();
  });

  document.getElementById('toggle-split-btn').addEventListener('click', (e) => {
    state.splitPreviewVisible = !state.splitPreviewVisible;
    const previewCol = document.getElementById('bill-preview-col');
    const itemizedCol = document.getElementById('itemized-col');
    if (state.splitPreviewVisible) {
      previewCol.classList.remove('hidden');
      itemizedCol.className = 'lg:col-span-7 space-y-6';
      e.currentTarget.textContent = 'Side-by-Side Bill Image: ON';
    } else {
      previewCol.classList.add('hidden');
      itemizedCol.className = 'lg:col-span-12 space-y-6';
      e.currentTarget.textContent = 'Side-by-Side Bill Image: OFF';
    }
  });

  document.getElementById('expand-bill-tab-btn').addEventListener('click', () => {
    switchPortalTab('document');
  });

  document.querySelectorAll('.zoom-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const zoom = btn.getAttribute('data-zoom');
      const container = document.getElementById('zoom-container');
      if (zoom === '100') {
        container.style.maxWidth = '56rem';
        container.style.width = '100%';
      } else if (zoom === '125') {
        container.style.maxWidth = '72rem';
        container.style.width = '125%';
      } else if (zoom === '150') {
        container.style.maxWidth = '90rem';
        container.style.width = '150%';
      }
      document.querySelectorAll('.zoom-btn').forEach(b => {
        b.className = b === btn
          ? 'zoom-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-fresno-navy text-white'
          : 'zoom-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200';
      });
    });
  });

  const slider = document.getElementById('sim-gallons-slider');
  slider.addEventListener('input', (e) => {
    updateUsageSimulation(e.target.value);
  });
  document.getElementById('preset-actual-btn').addEventListener('click', () => {
    slider.value = 14347;
    updateUsageSimulation(14347);
  });
  document.getElementById('preset-avg-btn').addEventListener('click', () => {
    slider.value = 13879;
    updateUsageSimulation(13879);
  });
  document.getElementById('preset-conserve-btn').addEventListener('click', () => {
    slider.value = 12195;
    updateUsageSimulation(12195);
  });

  document.getElementById('print-statement-btn').addEventListener('click', () => {
    window.print();
  });

  const payModal = document.getElementById('payment-modal');
  const receiptBox = document.getElementById('pay-receipt-box');
  document.getElementById('open-pay-modal-btn').addEventListener('click', () => {
    receiptBox.classList.add('hidden');
    payModal.classList.remove('hidden');
  });
  document.getElementById('close-pay-modal-btn').addEventListener('click', () => {
    payModal.classList.add('hidden');
  });
  document.getElementById('cancel-pay-btn').addEventListener('click', () => {
    payModal.classList.add('hidden');
  });
  document.getElementById('mock-pay-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const amt = Number(document.getElementById('pay-amount-input').value || 0).toFixed(2);
    const method = document.getElementById('pay-method-select').value;
    receiptBox.innerHTML = `
      <div class="font-bold text-emerald-950">Prototype Payment Confirmation #FR-${Math.floor(100000 + Math.random() * 900000)}</div>
      <div>Simulated payment of <span class="font-mono font-bold">$${amt}</span> via <strong>${method}</strong> recorded for Account <span class="font-mono">656219-226730</span>.</div>
    `;
    receiptBox.classList.remove('hidden');
  });
});