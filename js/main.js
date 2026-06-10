/* ════════════════════════════════════════
   HardFlow — логіка складу
   ════════════════════════════════════════ */
// ── Категорії ──
const CAT = {
    tech: { label: "Техніка", pill: "pill-tech", dot: "dot-tech" },
    bfp: { label: "БФП", pill: "pill-bfp", dot: "dot-bfp" },
    net: { label: "Мережа", pill: "pill-net", dot: "dot-net" },
    cons: { label: "Витратники", pill: "pill-cons", dot: "dot-cons" },
    other: { label: "Інше", pill: "pill-other", dot: "dot-other" },
};

// ── Кольори бару залишку ──
const BAR = { ok: "#1D9E75", warn: "#EF9F27", danger: "#E24B4A" };

// ── Дані складу (стартові) ──
let items = [
    {
        id: 1,
        name: "Ноутбук HP 250 G9",
        cat: "tech",
        qty: 5,
        unit: "шт.",
        max: 10,
    },
    {
        id: 2,
        name: "Роутер TP-Link TL-WR840N",
        cat: "net",
        qty: 4,
        unit: "шт.",
        max: 10,
    },
    {
        id: 3,
        name: "Кабель UTP Cat5e",
        cat: "net",
        qty: 80,
        unit: "м.",
        max: 200,
    },
    {
        id: 4,
        name: "МФУ Canon PIXMA G3420",
        cat: "bfp",
        qty: 2,
        unit: "шт.",
        max: 6,
    },
    {
        id: 5,
        name: "Картридж Canon PG-445",
        cat: "cons",
        qty: 3,
        unit: "упак.",
        max: 20,
    },
    {
        id: 6,
        name: "Патч-корд RJ45 1м",
        cat: "net",
        qty: 25,
        unit: "шт.",
        max: 50,
    },
    {
        id: 7,
        name: 'Монітор LG 24" FHD',
        cat: "tech",
        qty: 0,
        unit: "шт.",
        max: 8,
    },
];

let nextId = 8;
let filter = "all";

// ════════════════════════════════════════
// Встановити фільтр категорії
// ════════════════════════════════════════
function setFilter(f, el) {
    filter = f;
    document.querySelectorAll(".chip").forEach((b) => b.classList.remove("on"));
    el.classList.add("on");
    render();
}

// ════════════════════════════════════════
// Додати товар
// ════════════════════════════════════════
function addItem() {
    const nameEl = document.getElementById("f-name");
    const name = nameEl.value.trim();

    if (!name) {
        nameEl.focus();
        return;
    }

    const qty = Math.max(
        0,
        parseInt(document.getElementById("f-qty").value) || 0,
    );
    const cat = document.getElementById("f-cat").value;
    const unit = document.getElementById("f-unit").value;

    items.push({
        id: nextId++,
        name,
        cat,
        qty,
        unit,
        max: Math.max(qty * 2, 10),
    });

    // Очищаємо форму
    nameEl.value = "";
    document.getElementById("f-qty").value = "1";
    nameEl.focus();

    render();
}

// ════════════════════════════════════════
// Змінити кількість
// ════════════════════════════════════════
function chQty(id, delta) {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    item.qty = Math.max(0, item.qty + delta);
    if (item.qty > item.max) item.max = item.qty;

    render();
}

// ════════════════════════════════════════
// Видалити товар
// ════════════════════════════════════════
function del(id) {
    items = items.filter((i) => i.id !== id);
    render();
}

// ════════════════════════════════════════
// Рендер таблиці та статистики
// ════════════════════════════════════════
function render() {
    const q = (document.getElementById("search").value || "").toLowerCase();

    // Фільтруємо
    const visible = items.filter(
        (i) =>
            (filter === "all" || i.cat === filter) &&
            i.name.toLowerCase().includes(q),
    );

    // ── Статистика ──
    document.getElementById("s-pos").textContent = items.length;
    document.getElementById("s-units").textContent = items.reduce(
        (acc, i) => acc + i.qty,
        0,
    );
    document.getElementById("s-low").textContent = items.filter(
        (i) => i.qty > 0 && i.qty <= 3,
    ).length;
    document.getElementById("s-zero").textContent = items.filter(
        (i) => i.qty === 0,
    ).length;

    // ── Порожній стан ──
    document.getElementById("empty").style.display = visible.length
        ? "none"
        : "block";

    // ── Рядки таблиці ──
    document.getElementById("tbody").innerHTML = visible
        .map((item) => {
            const cat = CAT[item.cat] || CAT.other;
            const pct =
                item.max > 0 ? Math.round((item.qty / item.max) * 100) : 0;
            const barColor =
                pct === 0 ? BAR.danger : pct <= 30 ? BAR.warn : BAR.ok;
            const qClass =
                item.qty === 0 ? "danger" : item.qty <= 3 ? "warn" : "";

            return `
        <tr>
          <td>
            <div class="name-cell">
              <div class="cat-dot ${cat.dot}"></div>
              ${item.name}
            </div>
          </td>
          <td>
            <span class="pill ${cat.pill}">${cat.label}</span>
          </td>
          <td>
            <div class="qty-wrap">
              <button class="qb" onclick="chQty(${item.id}, -1)" aria-label="Зменшити">−</button>
              <span class="qnum ${qClass}">${item.qty}</span>
              <button class="qb" onclick="chQty(${item.id}, +1)" aria-label="Збільшити">+</button>
            </div>
          </td>
          <td>
            <div class="bar-wrap">
              <div class="bar" style="width: ${pct}%; background: ${barColor}"></div>
            </div>
          </td>
          <td style="color: #9999AA; font-size: 12px">${item.unit}</td>
          <td>
            <button class="del-btn" onclick="del(${item.id})" aria-label="Видалити товар">×</button>
          </td>
        </tr>
      `;
        })
        .join("");
}

// ── Enter у полі назви — додати товар ──
document.getElementById("f-name").addEventListener("keydown", (e) => {
    if (e.key === "Enter") addItem();
});

// ── Перший рендер ──
render();
