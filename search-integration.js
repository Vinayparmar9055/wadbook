/**
 * index.html ના મુખ્ય સર્ચ બાર માટે ઓટો-સજેશન ઇન્ટિગ્રેશન
 */
function attachSamajAutoSuggest(inputSelector) {
  const input = document.querySelector(inputSelector);
  if (!input) return;

  const dropdown = document.createElement("div");
  dropdown.id = "samajAutoSuggestBox";
  dropdown.style.cssText = `
    position: absolute; left: 0; right: 0; top: 100%;
    background: #ffffff; border: 1px solid #d4af37;
    border-radius: 0 0 12px 12px; max-height: 260px;
    overflow-y: auto; z-index: 9999; display: none;
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  `;

  input.parentElement.style.position = "relative";
  input.parentElement.appendChild(dropdown);

  input.addEventListener("input", () => {
    const q = input.value.trim();
    if (!q) {
      dropdown.style.display = "none";
      return;
    }

    const matches = searchSamajAutoComplete(q, "all").slice(0, 12);
    if (matches.length === 0) {
      dropdown.style.display = "none";
      return;
    }

    dropdown.innerHTML = matches.map(item => `
      <div class="suggest-row" data-type="${item.type}" data-name="${item.name}"
           style="padding:10px 14px; border-bottom:1px solid #f0e6d8; display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
        <div>
          <span style="font-weight:700; color:#2c1e16;">${item.name}</span>
          <span style="font-size:11px; background:#f5ebe0; color:#8b4513; padding:2px 6px; border-radius:6px; margin-left:6px;">${item.label}</span>
        </div>
        <span style="font-size:12px; color:#7a6658; font-weight:600;">${item.count} સભ્યો →</span>
      </div>
    `).join("");

    dropdown.style.display = "block";

    dropdown.querySelectorAll(".suggest-row").forEach(row => {
      row.addEventListener("click", () => {
        const type = row.getAttribute("data-type");
        const name = row.getAttribute("data-name");
        window.location.href = `directory.html?type=${encodeURIComponent(type)}&name=${encodeURIComponent(name)}`;
      });
    });
  });

  document.addEventListener("click", (e) => {
    if (!input.parentElement.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  attachSamajAutoSuggest("#mainSearchInput, #searchInput, input[type='search']");
});
