/* ═══════════════════════════════════════════════════════════════════
   PIVOT AIDE — BLOG MODULE JAVASCRIPT (blog.js)
   Handles dynamic rendering of 100 posts, search, filtering,
   pagination, detail page view, social share, and interactive comments.
   ═══════════════════════════════════════════════════════════════════ */

const DIVERSE_BLOG_IMAGES = [
  "https://picsum.photos/seed/mastering-accrual-accounting-vs-cash-basis-for-growing-smbs/800/500",
  "https://picsum.photos/seed/10-crucial-financial-kpis-every-founder-must-track-monthly/800/500",
  "https://picsum.photos/seed/how-clean-general-ledgers-streamline-year-end-financial-audits/800/500",
  "https://picsum.photos/seed/the-ultimate-guide-to-monthly-bank-credit-card-reconciliation/800/500",
  "https://picsum.photos/seed/inventory-valuation-methods-fifo-vs-lifo-vs-weighted-average/800/500",
  "https://picsum.photos/seed/managing-accounts-receivable-to-reduce-days-sales-outstanding-dso/800/500",
  "https://picsum.photos/seed/fixed-asset-management-depreciation-schedule-fundamentals/800/500",
  "https://picsum.photos/seed/preventing-revenue-leakage-with-automated-invoicing-workflows/800/500",
  "https://picsum.photos/seed/constructing-a-13-week-rolling-cash-flow-forecast/800/500",
  "https://picsum.photos/seed/chart-of-accounts-architecture-for-multi-entity-organizations/800/500",
  "https://picsum.photos/seed/deferred-revenue-asc-606-revenue-recognition-best-practices/800/500",
  "https://picsum.photos/seed/understanding-variance-analysis-budget-vs-actual-financials/800/500",
  "https://picsum.photos/seed/outsourced-bookkeeping-vs-in-house-accountant-cost-benefit-breakdown/800/500",
  "https://picsum.photos/seed/how-to-audit-proof-your-business-expense-documentation/800/500",
  "https://picsum.photos/seed/capital-leases-vs-operating-leases-under-asc-842-standards/800/500",
  "https://picsum.photos/seed/streamlining-accounts-payable-with-3-way-invoice-matching/800/500",
  "https://picsum.photos/seed/essential-internal-controls-to-safeguard-smb-assets-against-fraud/800/500",
  "https://picsum.photos/seed/financial-statements-101-balance-sheet-income-cash-flow-interlocks/800/500",
  "https://picsum.photos/seed/job-costing-strategies-for-contractors-professional-services/800/500",
  "https://picsum.photos/seed/preparing-your-books-for-m-a-due-diligence-a-12-month-checklist/800/500",
  "https://picsum.photos/seed/r-d-tax-credit-strategies-maximizing-innovation-deductions-in-2026/800/500",
  "https://picsum.photos/seed/section-179-bonus-depreciation-expensing-capital-purchases-efficiently/800/500",
  "https://picsum.photos/seed/s-corp-election-vs-c-corp-vs-llc-tax-optimization-matrix/800/500",
  "https://picsum.photos/seed/multi-state-sales-tax-compliance-economic-nexus-rules/800/500",
  "https://picsum.photos/seed/year-end-tax-planning-checklist-15-high-impact-tax-savings-tactics/800/500",
  "https://picsum.photos/seed/navigating-estimated-quarterly-tax-payments-to-avoid-irs-penalties/800/500",
  "https://picsum.photos/seed/qualified-opportunity-zone-qoz-investments-for-capital-gains-shelter/800/500",
  "https://picsum.photos/seed/cost-segregation-studies-accelerating-commercial-real-estate-depreciation/800/500",
  "https://picsum.photos/seed/pass-through-entity-tax-ptet-strategies-to-bypass-the-salt-cap/800/500",
  "https://picsum.photos/seed/international-tax-compliance-form-5471-fbar-transfer-pricing-rules/800/500",
  "https://picsum.photos/seed/maximizing-business-meals-travel-entertainment-expense-deductions/800/500",
  "https://picsum.photos/seed/navigating-irs-form-1099-nec-1099-misc-annual-reporting-rules/800/500",
  "https://picsum.photos/seed/employee-retention-credit-erc-audit-preparedness-irs-guidance/800/500",
  "https://picsum.photos/seed/tax-implications-of-stock-options-isos-vs-nsos-for-tech-startups/800/500",
  "https://picsum.photos/seed/net-operating-loss-nol-carryforwards-80-taxable-income-limits/800/500",
  "https://picsum.photos/seed/state-local-tax-salt-nexus-risks-for-remote-workforce-companies/800/500",
  "https://picsum.photos/seed/forming-a-captive-insurance-company-for-risk-management-tax-savings/800/500",
  "https://picsum.photos/seed/work-opportunity-tax-credit-wotc-hiring-incentives-breakdown/800/500",
  "https://picsum.photos/seed/section-1202-qualified-small-business-stock-qsbs-tax-exclusion-guide/800/500",
  "https://picsum.photos/seed/irs-audit-defense-how-modern-accounting-records-protect-business-owners/800/500",
  "https://picsum.photos/seed/why-odoo-18-is-disrupting-traditional-enterprise-erp-systems/800/500",
  "https://picsum.photos/seed/step-by-step-roadmap-for-migrating-quickbooks-to-odoo-accounting/800/500",
  "https://picsum.photos/seed/automating-inventory-control-multi-warehouse-tracking-in-odoo/800/500",
  "https://picsum.photos/seed/optimizing-odoo-manufacturing-mrp-for-custom-batch-production/800/500",
  "https://picsum.photos/seed/odoo-studio-building-custom-modules-without-writing-complex-code/800/500",
  "https://picsum.photos/seed/integrating-odoo-crm-with-sales-pipeline-e-commerce-web-stores/800/500",
  "https://picsum.photos/seed/odoo-community-vs-odoo-enterprise-complete-feature-pricing-guide/800/500",
  "https://picsum.photos/seed/best-practices-for-data-cleaning-sanitization-before-erp-go-live/800/500",
  "https://picsum.photos/seed/automating-analytic-accounting-cost-center-tracking-in-odoo/800/500",
  "https://picsum.photos/seed/odoo-hr-attendance-integration-with-automated-payroll-engines/800/500",
  "https://picsum.photos/seed/multi-currency-multi-company-setup-in-odoo-enterprise/800/500",
  "https://picsum.photos/seed/how-odoo-barcode-scanner-integration-boosts-fulfillment-speed-by-300/800/500",
  "https://picsum.photos/seed/building-interactive-executive-dashboards-custom-financial-reports-in-odoo/800/500",
  "https://picsum.photos/seed/odoo-pos-point-of-sale-offline-mode-hardware-integration-retail-sync/800/500",
  "https://picsum.photos/seed/managing-subscription-billing-automated-recurring-payments-in-odoo/800/500",
  "https://picsum.photos/seed/role-based-access-control-rbac-security-policies-in-odoo/800/500",
  "https://picsum.photos/seed/top-5-common-odoo-implementation-pitfalls-how-to-avoid-them/800/500",
  "https://picsum.photos/seed/automating-customer-support-ticketing-sla-tracking-in-odoo-helpdesk/800/500",
  "https://picsum.photos/seed/api-integration-framework-connecting-odoo-with-third-party-platforms/800/500",
  "https://picsum.photos/seed/post-implementation-erp-governance-user-adoption-strategies/800/500",
  "https://picsum.photos/seed/sba-7-a-loan-approval-blueprint-requirements-documentation-timeline/800/500",
  "https://picsum.photos/seed/sba-504-loans-for-commercial-real-estate-heavy-equipment-acquisitions/800/500",
  "https://picsum.photos/seed/building-bank-ready-financial-projections-3-year-p-l-balance-sheet-cash-flow/800/500",
  "https://picsum.photos/seed/debt-service-coverage-ratio-dscr-how-lenders-evaluate-your-loan-capacity/800/500",
  "https://picsum.photos/seed/sba-microloans-vs-conventional-bank-loans-choosing-the-right-financing-path/800/500",
  "https://picsum.photos/seed/alternative-business-financing-revenue-based-loans-lines-of-credit-factoring/800/500",
  "https://picsum.photos/seed/the-role-of-clean-financial-audit-records-in-venture-capital-due-diligence/800/500",
  "https://picsum.photos/seed/commercial-collateral-evaluation-real-estate-equipment-accounts-receivable/800/500",
  "https://picsum.photos/seed/business-credit-score-booster-dun-bradstreet-experian-paydex-strategies/800/500",
  "https://picsum.photos/seed/preparing-a-winning-sba-loan-business-plan-narrative-section/800/500",
  "https://picsum.photos/seed/navigating-personal-guarantees-sba-form-1919-disclosure-compliance/800/500",
  "https://picsum.photos/seed/working-capital-loans-for-seasonal-businesses-structuring-flexible-debt/800/500",
  "https://picsum.photos/seed/equipment-financing-options-fair-market-value-vs-1-buyout-leases/800/500",
  "https://picsum.photos/seed/refinancing-high-interest-merchant-cash-advances-mcas-with-sba-capital/800/500",
  "https://picsum.photos/seed/equity-financing-vs-debt-financing-strategic-trade-off-analysis-for-founders/800/500",
  "https://picsum.photos/seed/how-quality-of-earnings-qofe-reports-impact-enterprise-loan-underwriting/800/500",
  "https://picsum.photos/seed/government-contracting-funding-mobilization-loans-contract-financing/800/500",
  "https://picsum.photos/seed/understanding-sba-franchise-directory-approvals-eligibility-requirements/800/500",
  "https://picsum.photos/seed/top-7-reasons-sba-loan-applications-get-declined-and-how-to-fix-them/800/500",
  "https://picsum.photos/seed/post-funding-compliance-managing-sba-covenant-monitoring-annual-audits/800/500",
  "https://picsum.photos/seed/fractional-cfo-vs-full-time-cfo-when-to-scale-your-executive-finance-team/800/500",
  "https://picsum.photos/seed/automating-multi-state-payroll-tax-withholding-registration-compliance/800/500",
  "https://picsum.photos/seed/designing-executive-compensation-packages-phantom-stock-equity-bonuses/800/500",
  "https://picsum.photos/seed/flsa-employee-classification-w-2-vs-1099-contractor-risk-audit/800/500",
  "https://picsum.photos/seed/building-a-unit-economics-dashboard-for-saas-service-subscriptions/800/500",
  "https://picsum.photos/seed/strategic-cost-reduction-frameworks-without-hurting-operations-or-morale/800/500",
  "https://picsum.photos/seed/managing-401-k-plan-fiduciary-duties-annual-form-5500-filings/800/500",
  "https://picsum.photos/seed/scenario-planning-financial-stress-testing-for-economic-downturns/800/500",
  "https://picsum.photos/seed/optimizing-working-capital-cycles-receivables-inventory-payables-ccc/800/500",
  "https://picsum.photos/seed/direct-deposit-vs-earned-wage-access-ewa-modernizing-payroll-delivery/800/500",
  "https://picsum.photos/seed/preparing-your-business-for-a-bank-line-of-credit-extension/800/500",
  "https://picsum.photos/seed/key-differences-between-bookkeeper-controller-and-cfo-roles/800/500",
  "https://picsum.photos/seed/managing-overtime-pay-regulations-time-tracking-integrations/800/500",
  "https://picsum.photos/seed/strategic-capital-allocation-dividend-payouts-vs-reinvestment-in-growth/800/500",
  "https://picsum.photos/seed/garnishment-compliance-child-support-wage-levies-student-loans/800/500",
  "https://picsum.photos/seed/cross-border-payroll-solutions-for-international-distributed-teams/800/500",
  "https://picsum.photos/seed/establishing-strategic-kpis-for-department-leaders-performance-bonuses/800/500",
  "https://picsum.photos/seed/post-merger-financial-integration-unifying-payroll-accounting-systems/800/500",
  "https://picsum.photos/seed/year-end-w-2-w-3-processing-protocols-to-avoid-social-security-fines/800/500",
  "https://picsum.photos/seed/the-value-of-monthly-board-reporting-packages-for-backers-directors/800/500"
];

function getPostImage(post) {
  if (!post) return 'precision_accounting.png';
  if (post.featuredImage) return post.featuredImage;
  const idx = (post.id - 1) % DIVERSE_BLOG_IMAGES.length;
  return DIVERSE_BLOG_IMAGES[idx];
}

document.addEventListener('DOMContentLoaded', () => {
  const blogsData = window.PIVOT_BLOGS_DATA || [];

  if (document.getElementById('blogGrid')) {
    initBlogListPage(blogsData);
  }

  if (document.getElementById('articleContainer')) {
    initBlogDetailPage(blogsData);
  }

  initUniversalScrollAnimations();
});

/* ═══════════════════════════════════════════════════════════════════
   1. BLOG LIST PAGE LOGIC (blog.html)
   ═══════════════════════════════════════════════════════════════════ */
function initBlogListPage(blogsData) {
  let currentCategory = 'All';
  let searchQuery = '';
  let currentPage = 1;
  const itemsPerPage = 9;

  const blogGrid = document.getElementById('blogGrid');
  const paginationControls = document.getElementById('paginationControls');
  const paginationStats = document.getElementById('paginationStats');
  const searchInput = document.getElementById('blogSearchInput');
  const categoriesScroll = document.getElementById('categoriesScroll');
  const sidebarCategories = document.getElementById('sidebarCategories');
  const sidebarRecentPosts = document.getElementById('sidebarRecentPosts');
  const sidebarTags = document.getElementById('sidebarTags');

  // DYNAMIC TYPING PLACEHOLDER ANIMATION FOR SEARCH BOX
  if (searchInput) {
    const placeholders = [
      "Search by topic, keyword, category, or IRS rule...",
      "Try searching 'Odoo ERP Implementation'...",
      "Try searching 'Forensic Bookkeeping'...",
      "Try searching 'W-2 Tax Compliance'...",
      "Try searching 'Growth Capital & SBA Loans'..."
    ];
    let pIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typingSpeed = 70;

    function typePlaceholder() {
      if (document.activeElement === searchInput || searchInput.value.length > 0) {
        setTimeout(typePlaceholder, 1000);
        return;
      }

      const currentText = placeholders[pIdx];
      if (isDeleting) {
        searchInput.setAttribute('placeholder', currentText.substring(0, charIdx--));
        typingSpeed = 30;
      } else {
        searchInput.setAttribute('placeholder', currentText.substring(0, charIdx++));
        typingSpeed = 65;
      }

      if (!isDeleting && charIdx === currentText.length + 1) {
        isDeleting = true;
        typingSpeed = 1600;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        pIdx = (pIdx + 1) % placeholders.length;
        typingSpeed = 350;
      }

      setTimeout(typePlaceholder, typingSpeed);
    }

    setTimeout(typePlaceholder, 800);
  }

  // LIVE SEARCH DROPDOWN SUGGESTIONS ENGINE
  const searchDropdown = document.getElementById('searchDropdown');

  if (searchInput && searchDropdown) {
    function updateDropdown(query) {
      const q = query.trim().toLowerCase();

      if (q.length === 0) {
        const popularTopics = [
          { title: "Mastering Accrual Accounting vs. Cash Basis", category: "Accounting & Bookkeeping", id: 1 },
          { title: "10 Crucial Financial KPIs Every Founder Must Track", category: "Accounting & Bookkeeping", id: 2 },
          { title: "Odoo 18 Accounting vs. QuickBooks Enterprise", category: "Odoo ERP Implementation", id: 21 },
          { title: "SBA 7(a) vs. 504 Loans: Debt Structure Guide", category: "Funding Readiness & SBA", id: 41 }
        ];

        searchDropdown.innerHTML = `
          <div class="search-dropdown-section-header">
            <span>Popular Topics</span>
            <span style="font-size:10px;opacity:0.7;">Quick Jump</span>
          </div>
          ${popularTopics.map(item => {
          const postObj = blogsData.find(b => b.id === item.id) || item;
          return `
              <a href="blog-details.html?id=${item.id}" class="search-dropdown-item">
                <img src="${getPostImage(postObj)}" class="search-dropdown-thumb" alt="${item.title}">
                <div class="search-dropdown-info">
                  <div class="search-dropdown-title">${item.title}</div>
                  <div class="search-dropdown-meta">
                    <span class="search-dropdown-badge">${item.category}</span>
                  </div>
                </div>
              </a>
            `;
        }).join('')}
        `;
        searchDropdown.classList.add('active');
        return;
      }

      const matches = blogsData.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.excerpt.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        (b.tags && b.tags.some(t => t.toLowerCase().includes(q))) ||
        (b.author && b.author.toLowerCase().includes(q))
      );

      if (matches.length === 0) {
        searchDropdown.innerHTML = `
          <div class="search-dropdown-empty">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom:8px;color:var(--yellow);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <div>No matching articles found for "<strong>${escapeHtml(query)}</strong>"</div>
          </div>
        `;
        searchDropdown.classList.add('active');
        return;
      }

      const topMatches = matches.slice(0, 5);

      searchDropdown.innerHTML = `
        <div class="search-dropdown-section-header">
          <span>Articles (${matches.length} matches)</span>
          <span style="font-size:10px;opacity:0.7;">Press Enter to filter grid</span>
        </div>
        ${topMatches.map(post => `
          <a href="blog-details.html?id=${post.id}" class="search-dropdown-item">
            <img src="${getPostImage(post)}" class="search-dropdown-thumb" alt="${post.title}">
            <div class="search-dropdown-info">
              <div class="search-dropdown-title">${post.title}</div>
              <div class="search-dropdown-meta">
                <span class="search-dropdown-badge">${post.category}</span>
                <span>• ${post.readTime}</span>
              </div>
            </div>
          </a>
        `).join('')}
        ${matches.length > 5 ? `
          <div class="search-dropdown-footer">
            <div class="search-dropdown-view-all" id="dropdownFilterAll">
              View all ${matches.length} matching articles →
            </div>
          </div>
        ` : ''}
      `;

      const viewAllBtn = document.getElementById('dropdownFilterAll');
      if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
          searchQuery = query;
          currentPage = 1;
          renderBlogList();
          searchDropdown.classList.remove('active');
          window.scrollTo({ top: 500, behavior: 'smooth' });
        });
      }

      searchDropdown.classList.add('active');
    }

    searchInput.addEventListener('focus', () => {
      updateDropdown(searchInput.value);
    });

    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      currentPage = 1;
      renderBlogList();
      updateDropdown(e.target.value);
    });

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
        searchDropdown.classList.remove('active');
      }
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchDropdown.classList.remove('active');
      }
    });
  }

  // RENDER CATEGORY PILLS BAR (STATIC)
  function renderCategoryPills() {
    const categories = ['All', ...new Set(blogsData.map(b => b.category))];
    if (categoriesScroll) {
      categoriesScroll.innerHTML = categories.map(cat => {
        const count = cat === 'All' ? blogsData.length : blogsData.filter(b => b.category === cat).length;
        const activeClass = cat === currentCategory ? 'active' : '';
        return `<button class="category-pill ${activeClass}" data-cat="${cat}">${cat} (${count})</button>`;
      }).join('');

      categoriesScroll.querySelectorAll('.category-pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
          currentCategory = e.currentTarget.dataset.cat;
          currentPage = 1;
          renderCategoryPills();
          renderBlogList();
        });
      });

      const activePill = categoriesScroll.querySelector('.category-pill.active');
      if (activePill && window.innerWidth <= 900) {
        activePill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }

    if (sidebarCategories) {
      const mainCategories = [...new Set(blogsData.map(b => b.category))];
      sidebarCategories.innerHTML = mainCategories.map(cat => {
        const count = blogsData.filter(b => b.category === cat).length;
        return `
          <li class="category-item" data-cat="${cat}">
            <span>${cat}</span>
            <span class="category-count">${count}</span>
          </li>
        `;
      }).join('');

      sidebarCategories.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', (e) => {
          currentCategory = e.currentTarget.dataset.cat;
          currentPage = 1;
          renderCategoryPills();
          renderBlogList();
          window.scrollTo({ top: 300, behavior: 'smooth' });
        });
      });
    }
  }

  // RENDER FEATURED POST
  function renderFeaturedPost() {
    const featuredWrap = document.getElementById('featuredPostContainer');
    if (!featuredWrap) return;

    const featuredPost = blogsData.find(b => b.featured) || blogsData[0];
    if (!featuredPost) return;

    featuredWrap.innerHTML = `
      <div class="featured-card">
        <div class="featured-img-wrap">
          <img src="${getPostImage(featuredPost)}" alt="${featuredPost.title}" class="featured-img" onerror="this.src='precision_accounting.png'">
          <span class="featured-badge">Featured Insight</span>
        </div>
        <div class="featured-content">
          <span class="featured-category">${featuredPost.category}</span>
          <h2 class="featured-title"><a href="blog-details.html?id=${featuredPost.id}" style="color:inherit;text-decoration:none;">${featuredPost.title}</a></h2>
          <p class="featured-excerpt">${featuredPost.excerpt}</p>
          <div class="author-meta">
            <div class="author-avatar">${featuredPost.author ? featuredPost.author.charAt(0) : 'P'}</div>
            <div class="author-info">
              <strong>${featuredPost.author}</strong>
              <span>${featuredPost.authorRole} • ${featuredPost.date}</span>
            </div>
          </div>
          <div>
            <a href="blog-details.html?id=${featuredPost.id}" class="btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;">
              Read Full Article →
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // RENDER RECENT POSTS SIDEBAR
  function renderRecentPostsSidebar() {
    if (!sidebarRecentPosts) return;
    const recent = blogsData.slice(0, 4);
    sidebarRecentPosts.innerHTML = recent.map(post => `
      <a href="blog-details.html?id=${post.id}" class="recent-post-item">
        <img src="${getPostImage(post)}" alt="${post.title}" class="recent-post-thumb" onerror="this.src='precision_accounting.png'">
        <div class="recent-post-info">
          <h4>${post.title}</h4>
          <span class="recent-post-date">${post.date} • ${post.readTime}</span>
        </div>
      </a>
    `).join('');
  }

  // RENDER TAGS SIDEBAR
  function renderTagsSidebar() {
    if (!sidebarTags) return;
    const allTags = [...new Set(blogsData.flatMap(b => b.tags || []))].slice(0, 15);
    sidebarTags.innerHTML = allTags.map(tag => `
      <span class="tag-badge" data-tag="${tag}">${tag}</span>
    `).join('');

    sidebarTags.querySelectorAll('.tag-badge').forEach(badge => {
      badge.addEventListener('click', (e) => {
        searchQuery = e.currentTarget.dataset.tag;
        if (searchInput) searchInput.value = searchQuery;
        currentPage = 1;
        renderBlogList();
        window.scrollTo({ top: 400, behavior: 'smooth' });
      });
    });
  }

  // RENDER FILTERED BLOG LIST & PAGINATION
  function renderBlogList() {
    if (!blogGrid) return;

    let filtered = blogsData;

    if (currentCategory !== 'All') {
      filtered = filtered.filter(b => b.category === currentCategory);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.excerpt.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        (b.tags && b.tags.some(t => t.toLowerCase().includes(q))) ||
        (b.author && b.author.toLowerCase().includes(q))
      );
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

    if (paginatedItems.length === 0) {
      blogGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--bg-card); border-radius: var(--card-radius); border: 1px solid var(--border-light);">
          <h3 style="color:var(--steel-100);margin-bottom:12px;font-size:22px;">No Articles Found</h3>
          <p style="color:var(--steel-300);">No blog posts matched your search "${searchQuery}". Try a different keyword or category.</p>
          <button class="btn-primary" id="resetFilterBtn" style="margin-top:20px;">Reset All Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('resetFilterBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          currentCategory = 'All';
          searchQuery = '';
          if (searchInput) searchInput.value = '';
          currentPage = 1;
          renderCategoryPills();
          renderBlogList();
        });
      }
    } else {
      blogGrid.innerHTML = paginatedItems.map(post => `
        <article class="blog-card">
          <div class="card-img-wrap">
            <img src="${getPostImage(post)}" alt="${post.title}" class="card-img" onerror="this.src='precision_accounting.png'">
          </div>
          <div class="card-body">
            <div class="card-meta-row">
              <div class="card-author-inline">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>${post.author || 'Pivot Aide'}</span>
              </div>
              <span class="card-cat-pill">${post.category}</span>
            </div>
            <h3 class="card-title">
              <a href="blog-details.html?id=${post.id}">${post.title}</a>
            </h3>
            <p class="card-excerpt">${post.excerpt}</p>
            <div class="card-footer">
              <a href="blog-details.html?id=${post.id}" class="card-read-more">Read More →</a>
              <div class="card-share-icons">
                <button class="card-icon-btn card-whatsapp-btn" data-id="${post.id}" data-title="${escapeHtml(post.title)}" title="Share on WhatsApp">
                  <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></svg>
                </button>
                <button class="card-icon-btn card-linkedin-btn" data-id="${post.id}" data-title="${escapeHtml(post.title)}" title="Share on LinkedIn">
                  <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                </button>
              </div>
            </div>
          </div>
        </article>
      `).join('');

      blogGrid.querySelectorAll('.card-whatsapp-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const url = encodeURIComponent(window.location.origin + '/blog-details.html?id=' + btn.dataset.id);
          const title = encodeURIComponent(btn.dataset.title);
          window.open(`https://api.whatsapp.com/send?text=${title}%20${url}`, '_blank');
        });
      });

      blogGrid.querySelectorAll('.card-linkedin-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const url = encodeURIComponent(window.location.origin + '/blog-details.html?id=' + btn.dataset.id);
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
        });
      });

      // Staggered card entrance animation
      const cards = blogGrid.querySelectorAll('.blog-card');
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('card-visible');
        }, 50 * index);
      });
    }

    // STATS SUMMARY
    if (paginationStats) {
      const endItem = Math.min(startIndex + itemsPerPage, totalItems);
      paginationStats.textContent = totalItems > 0
        ? `Showing ${startIndex + 1}–${endItem} of ${totalItems} articles`
        : '0 articles found';
    }

    // PAGINATION CONTROLS
    if (paginationControls) {
      if (totalPages <= 1) {
        paginationControls.innerHTML = '';
        return;
      }

      let paginationHtml = `
        <button class="page-btn page-btn-wide" id="prevPageBtn" ${currentPage === 1 ? 'disabled' : ''}>← Prev</button>
      `;

      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
          paginationHtml += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>
          `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
          paginationHtml += `<span style="color:var(--steel-300);padding:0 4px;">...</span>`;
        }
      }

      paginationHtml += `
        <button class="page-btn page-btn-wide" id="nextPageBtn" ${currentPage === totalPages ? 'disabled' : ''}>Next →</button>
      `;

      paginationControls.innerHTML = paginationHtml;

      paginationControls.querySelectorAll('.page-btn[data-page]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          currentPage = parseInt(e.currentTarget.dataset.page, 10);
          renderBlogList();
          window.scrollTo({ top: 500, behavior: 'smooth' });
        });
      });

      const prevBtn = document.getElementById('prevPageBtn');
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          if (currentPage > 1) {
            currentPage--;
            renderBlogList();
            window.scrollTo({ top: 500, behavior: 'smooth' });
          }
        });
      }

      const nextBtn = document.getElementById('nextPageBtn');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (currentPage < totalPages) {
            currentPage++;
            renderBlogList();
            window.scrollTo({ top: 500, behavior: 'smooth' });
          }
        });
      }
    }
  }

  // SEARCH INPUT EVENT LISTENER
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      currentPage = 1;
      renderBlogList();
    });
  }

  // INITIAL CALLS
  renderCategoryPills();
  renderFeaturedPost();
  renderRecentPostsSidebar();
  renderTagsSidebar();
  renderBlogList();
}


/* ═══════════════════════════════════════════════════════════════════
   2. BLOG DETAIL PAGE LOGIC (blog-details.html)
   ═══════════════════════════════════════════════════════════════════ */
function initBlogDetailPage(blogsData) {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = parseInt(urlParams.get('id'), 10) || 1;

  const post = blogsData.find(b => b.id === postId) || blogsData[0];
  if (!post) return;

  // Set document title
  document.title = `${post.title} — Pivot Aide Insights`;

  // Render Breadcrumb & Title
  const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = post.title;

  const articleCategory = document.getElementById('articleCategory');
  if (articleCategory) articleCategory.textContent = post.category;

  const articleTitle = document.getElementById('articleTitle');
  if (articleTitle) articleTitle.textContent = post.title;

  const articleLead = document.getElementById('articleLead');
  if (articleLead) articleLead.textContent = post.excerpt;

  // Render Author & Date
  const authorAvatar = document.getElementById('authorAvatar');
  if (authorAvatar) authorAvatar.textContent = post.author ? post.author.charAt(0) : 'P';

  const authorName = document.getElementById('authorName');
  if (authorName) authorName.textContent = post.author;

  const authorRole = document.getElementById('authorRole');
  if (authorRole) authorRole.textContent = post.authorRole;

  const articleDate = document.getElementById('articleDate');
  if (articleDate) articleDate.textContent = post.date;

  const articleReadTime = document.getElementById('articleReadTime');
  if (articleReadTime) articleReadTime.textContent = post.readTime;

  // Featured Image Banner
  const articleBanner = document.getElementById('articleBanner');
  if (articleBanner) {
    articleBanner.src = getPostImage(post);
    articleBanner.alt = post.title;
  }

  // Content Body
  const articleBody = document.getElementById('articleBody');
  if (articleBody) {
    articleBody.innerHTML = post.content || `<p>${post.excerpt}</p>`;
  }

  // Setup Social Sharing Buttons
  setupSocialSharing(post);

  // Author Bio Card
  const bioAuthorName = document.getElementById('bioAuthorName');
  if (bioAuthorName) bioAuthorName.textContent = post.author;

  const bioAuthorRole = document.getElementById('bioAuthorRole');
  if (bioAuthorRole) bioAuthorRole.textContent = post.authorRole;

  // Render Related Articles (3 from same category or random)
  renderRelatedArticles(blogsData, post);

  // Setup Comment System
  setupComments(post.id);
}


/* ── SOCIAL SHARING HANDLER ── */
function setupSocialSharing(post) {
  const currentUrl = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(post.title);
  const excerpt = encodeURIComponent(post.excerpt);

  const shareLinks = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${currentUrl}&text=${title}`,
    whatsapp: `https://api.whatsapp.com/send?text=${title}%20${currentUrl}`,
    telegram: `https://t.me/share/url?url=${currentUrl}&text=${title}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${currentUrl}&description=${title}`,
    reddit: `https://reddit.com/submit?url=${currentUrl}&title=${title}`,
    email: `mailto:?subject=${title}&body=${excerpt}%0A%0ARead%20more:%20${currentUrl}`
  };

  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const platform = btn.dataset.platform;

      if (platform === 'copylink' || platform === 'instagram') {
        navigator.clipboard.writeText(window.location.href).then(() => {
          showToast('Link Copied!', 'Article link copied to clipboard.');
          if (platform === 'instagram') {
            setTimeout(() => window.open('https://instagram.com', '_blank'), 1000);
          }
        });
      } else if (shareLinks[platform]) {
        window.open(shareLinks[platform], '_blank', 'width=600,height=500');
      }
    });
  });
}


/* ── RELATED ARTICLES ── */
function renderRelatedArticles(blogsData, currentPost) {
  const relatedGrid = document.getElementById('relatedGrid');
  if (!relatedGrid) return;

  const matches = blogsData.filter(b => b.id !== currentPost.id && b.category === currentPost.category);
  const related = (matches.length >= 3 ? matches : blogsData.filter(b => b.id !== currentPost.id)).slice(0, 3);

  relatedGrid.innerHTML = related.map(item => `
    <article class="blog-card">
      <div class="card-img-wrap">
        <img src="${getPostImage(item)}" alt="${item.title}" class="card-img" onerror="this.src='precision_accounting.png'">
      </div>
      <div class="card-body">
        <div class="card-meta-row">
          <div class="card-author-inline">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>${item.author || 'Pivot Aide'}</span>
          </div>
          <span class="card-cat-pill">${item.category}</span>
        </div>
        <h3 class="card-title"><a href="blog-details.html?id=${item.id}">${item.title}</a></h3>
        <p class="card-excerpt">${item.excerpt}</p>
        <div class="card-footer">
          <a href="blog-details.html?id=${item.id}" class="card-read-more">Read More →</a>
          <div class="card-share-icons">
            <button class="card-icon-btn card-whatsapp-btn" data-id="${item.id}" data-title="${escapeHtml(item.title)}" title="Share on WhatsApp">
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></svg>
            </button>
            <button class="card-icon-btn card-linkedin-btn" data-id="${item.id}" data-title="${escapeHtml(item.title)}" title="Share on LinkedIn">
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  `).join('');

  const cards = relatedGrid.querySelectorAll('.blog-card');
  cards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('card-visible');
    }, 80 * index);
  });
}


/* ── INTERACTIVE COMMENTS ── */
function setupComments(postId) {
  const commentForm = document.getElementById('commentForm');
  const commentsList = document.getElementById('commentsList');
  const storageKey = `pivot_blog_comments_${postId}`;

  // Default initial comments for realistic look
  const initialComments = [
    {
      name: 'Robert Vance',
      date: '2 days ago',
      text: 'Extremely insightful article! We recently implemented this exact framework in our organization and saw an immediate improvement in ledger clarity.'
    },
    {
      name: 'Elena Gilbert',
      date: '1 week ago',
      text: 'Great breakdown of compliance standards and automated workflows. Thanks to Pivot Aide for publishing high quality guidance.'
    }
  ];

  function getStoredComments() {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : initialComments;
  }

  function renderComments() {
    if (!commentsList) return;
    const comments = getStoredComments();

    commentsList.innerHTML = comments.map(c => `
      <div class="comment-card">
        <div class="comment-header">
          <span class="comment-author-name">${escapeHtml(c.name)}</span>
          <span class="comment-date">${c.date}</span>
        </div>
        <p class="comment-text">${escapeHtml(c.text)}</p>
      </div>
    `).join('');
  }

  if (commentForm) {
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('commentName');
      const textInput = document.getElementById('commentText');

      if (!nameInput.value.trim() || !textInput.value.trim()) {
        showToast('Required Fields Missing', 'Please fill in your name and comment before submitting.');
        return;
      }

      const newComment = {
        name: nameInput.value.trim(),
        date: 'Just now',
        text: textInput.value.trim()
      };

      const currentComments = getStoredComments();
      currentComments.unshift(newComment);
      localStorage.setItem(storageKey, JSON.stringify(currentComments));

      nameInput.value = '';
      textInput.value = '';

      renderComments();
      showToast('Comment Posted!', 'Thank you for sharing your thoughts.');
    });
  }

  renderComments();
}


/* ── UTILITY TOAST NOTIFICATION ── */
function showToast(title, message) {
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toastTitle');
  const toastMsg = document.getElementById('toastMsg');

  if (toast && toastTitle && toastMsg) {
    toastTitle.textContent = title;
    toastMsg.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  } else {
    alert(`${title}\n${message}`);
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

/* ═══════════════════════════════════════════════════════════════════
   UNIVERSAL SCROLL ANIMATION OBSERVER ENGINE (SCROLL UP & DOWN)
   ═══════════════════════════════════════════════════════════════════ */
function initUniversalScrollAnimations() {
  const heroInner = document.querySelector('.blog-hero-inner');
  if (heroInner) heroInner.classList.add('scroll-reveal-scale');

  const categoriesWrapper = document.querySelector('.blog-categories-wrapper');
  if (categoriesWrapper) categoriesWrapper.classList.add('scroll-reveal');

  const featuredSection = document.querySelector('.featured-section');
  if (featuredSection) featuredSection.classList.add('scroll-reveal-scale');

  const sidebarWidgets = document.querySelectorAll('.sidebar-widget');
  sidebarWidgets.forEach((w, idx) => {
    w.classList.add('scroll-reveal-right');
    w.style.transitionDelay = `${idx * 0.12}s`;
  });

  const paginationWrapper = document.querySelector('.blog-pagination-wrapper');
  if (paginationWrapper) paginationWrapper.classList.add('scroll-reveal');

  const footer = document.querySelector('footer');
  if (footer) footer.classList.add('scroll-reveal');

  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  };

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      } else {
        entry.target.classList.remove('in-view');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale').forEach(el => {
    scrollObserver.observe(el);
  });
}
