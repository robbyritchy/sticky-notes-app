export function createStylePicker(initial, onChange) {
  // initial = { color, shape }
  const root = document.createElement("div");
  root.className = "style-picker";

  // colors
  const colors = [
    "#fff59d","#f9d65c","#ffd180","#ffccbc","#e1bee7",
    "#c5e1a5","#b3e5fc","#cfd8dc","#ffab91","#f48fb1"
  ];
  const colorRow = document.createElement("div");
  colors.forEach(c => {
    const s = document.createElement("span");
    s.className = "color-swatch";
    s.style.background = c;
    s.addEventListener("click", () => {
      onChange({ color: c });
    });
    colorRow.appendChild(s);
  });
  root.appendChild(colorRow);

  // shape select
  const shapeRow = document.createElement("div");
  const shapeLabel = document.createElement("label");
  shapeLabel.textContent = "Shape:";
  shapeLabel.style.marginRight = "8px";
  const select = document.createElement("select");
  select.innerHTML = `
    <option value="rectangle">Rectangle</option>
    <option value="pillow">Pillow</option>
    <option value="circle">Circle</option>
  `;
  select.value = initial.shape || "rectangle";
  select.addEventListener("change", () => onChange({ shape: select.value }));
  shapeRow.appendChild(shapeLabel);
  shapeRow.appendChild(select);
  root.appendChild(shapeRow);

  return root;
}
